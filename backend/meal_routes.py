"""
Meal tracking routes for MacroMatch backend
Handles CRUD operations for meals and food items
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from models import Meal, FoodItem, NutritionInfo
from firebase_config import get_firebase_service
from auth_routes import token_required

# Create meal tracking blueprint
meal_bp = Blueprint('meals', __name__, url_prefix='/api/v1/meals')

@meal_bp.route('/', methods=['POST'])
@token_required
def create_meal():
    """
    Create a new meal entry
    Requires authentication token
    
    Expected JSON payload:
    {
        "name": "Breakfast",
        "meal_type": "breakfast",
        "food_items": [
            {
                "name": "Oatmeal",
                "serving_size": 1.0,
                "serving_unit": "cup",
                "nutrition": {
                    "calories": 150,
                    "protein": 5.0,
                    "carbs": 27.0,
                    "fat": 3.0,
                    "fiber": 4.0,
                    "sugar": 1.0,
                    "sodium": 10.0
                }
            }
        ],
        "notes": "Added berries and honey"
    }
    
    Returns:
        JSON response with created meal data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'meal_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create meal model instance
        meal_data = {
            'name': data['name'].strip(),
            'meal_type': data['meal_type'].strip(),
            'notes': data.get('notes', '').strip(),
            'timestamp': datetime.utcnow()
        }
        
        # Parse food items if provided
        food_items = []
        if 'food_items' in data and data['food_items']:
            for item_data in data['food_items']:
                # Create nutrition info
                nutrition_data = item_data.get('nutrition', {})
                nutrition = NutritionInfo(**nutrition_data)
                
                # Create food item
                food_item = FoodItem(
                    name=item_data['name'].strip(),
                    serving_size=item_data['serving_size'],
                    serving_unit=item_data['serving_unit'].strip(),
                    nutrition=nutrition
                )
                food_items.append(food_item)
        
        meal = Meal(**meal_data, food_items=food_items)
        
        # Validate meal data
        validation_errors = meal.validate()
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        # Save meal to Firebase
        firebase_service = get_firebase_service()
        meal_id = firebase_service.add_meal(request.current_user_id, meal.to_dict())
        
        # Get total nutrition for the meal
        total_nutrition = meal.get_total_nutrition()
        
        return jsonify({
            'message': 'Meal created successfully',
            'meal': {
                'id': meal_id,
                'name': meal.name,
                'meal_type': meal.meal_type,
                'food_items': [item.to_dict() for item in meal.food_items],
                'total_nutrition': total_nutrition.to_dict(),
                'timestamp': meal.timestamp.isoformat(),
                'notes': meal.notes
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Create meal error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/', methods=['GET'])
@token_required
def get_meals():
    """
    Get user's meal history
    Requires authentication token
    
    Query parameters:
    - limit: Maximum number of meals to return (default: 50)
    - meal_type: Filter by meal type (breakfast, lunch, dinner, snack)
    - date_from: Start date for filtering (YYYY-MM-DD format)
    - date_to: End date for filtering (YYYY-MM-DD format)
    
    Returns:
        JSON response with list of meals
    """
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        meal_type = request.args.get('meal_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Validate limit
        if limit > 100:
            limit = 100
        if limit < 1:
            limit = 50
        
        # Get meals from Firebase
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, limit)
        
        # Filter meals if needed
        filtered_meals = []
        for meal in meals:
            # Filter by meal type
            if meal_type and meal.get('meal_type') != meal_type:
                continue
            
            # Filter by date range
            if date_from or date_to:
                meal_timestamp = meal.get('timestamp')
                if meal_timestamp:
                    # Convert timestamp to datetime if it's a string
                    if isinstance(meal_timestamp, str):
                        meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
                    elif hasattr(meal_timestamp, 'timestamp'):
                        meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
                    
                    meal_date = meal_timestamp.date()
                    
                    if date_from:
                        from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                        if meal_date < from_date:
                            continue
                    
                    if date_to:
                        to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        if meal_date > to_date:
                            continue
            
            # Calculate total nutrition for each meal
            total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
            for food_item in meal.get('food_items', []):
                nutrition = food_item.get('nutrition', {})
                for key in total_nutrition:
                    total_nutrition[key] += nutrition.get(key, 0)
            
            meal['total_nutrition'] = total_nutrition
            filtered_meals.append(meal)
        
        return jsonify({
            'meals': filtered_meals,
            'count': len(filtered_meals)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get meals error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/<meal_id>', methods=['GET'])
@token_required
def get_meal(meal_id):
    """
    Get a specific meal by ID
    Requires authentication token
    
    Args:
        meal_id (str): Meal document ID
    
    Returns:
        JSON response with meal data
    """
    try:
        # Get meals from Firebase
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)  # Get more to find specific meal
        
        # Find the specific meal
        target_meal = None
        for meal in meals:
            if meal['id'] == meal_id:
                target_meal = meal
                break
        
        if not target_meal:
            return jsonify({'error': 'Meal not found'}), 404
        
        # Calculate total nutrition
        total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
        for food_item in target_meal.get('food_items', []):
            nutrition = food_item.get('nutrition', {})
            for key in total_nutrition:
                total_nutrition[key] += nutrition.get(key, 0)
        
        target_meal['total_nutrition'] = total_nutrition
        
        return jsonify({
            'meal': target_meal
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get meal error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/<meal_id>', methods=['PUT'])
@token_required
def update_meal(meal_id):
    """
    Update an existing meal
    Requires authentication token
    
    Args:
        meal_id (str): Meal document ID
    
    Expected JSON payload:
    {
        "name": "Updated Breakfast",
        "meal_type": "breakfast",
        "food_items": [...],
        "notes": "Updated notes"
    }
    
    Returns:
        JSON response with updated meal data
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Get existing meal to validate it exists
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        existing_meal = None
        for meal in meals:
            if meal['id'] == meal_id:
                existing_meal = meal
                break
        
        if not existing_meal:
            return jsonify({'error': 'Meal not found'}), 404
        
        # Prepare update data
        update_data = {}
        
        # Update allowed fields
        allowed_fields = ['name', 'meal_type', 'notes']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field].strip() if isinstance(data[field], str) else data[field]
        
        # Handle food items update
        if 'food_items' in data:
            food_items = []
            for item_data in data['food_items']:
                # Create nutrition info
                nutrition_data = item_data.get('nutrition', {})
                nutrition = NutritionInfo(**nutrition_data)
                
                # Create food item
                food_item = FoodItem(
                    name=item_data['name'].strip(),
                    serving_size=item_data['serving_size'],
                    serving_unit=item_data['serving_unit'].strip(),
                    nutrition=nutrition
                )
                food_items.append(food_item)
            
            # Validate the updated meal
            meal_data = existing_meal.copy()
            meal_data.update(update_data)
            meal_data['food_items'] = [item.to_dict() for item in food_items]
            
            meal = Meal.from_dict(meal_data)
            validation_errors = meal.validate()
            if validation_errors:
                return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
            
            update_data['food_items'] = [item.to_dict() for item in food_items]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update meal in Firebase
        success = firebase_service.update_meal(request.current_user_id, meal_id, update_data)
        
        if not success:
            return jsonify({'error': 'Failed to update meal'}), 500
        
        # Get updated meal
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        updated_meal = None
        for meal in meals:
            if meal['id'] == meal_id:
                updated_meal = meal
                break
        
        # Calculate total nutrition
        total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
        for food_item in updated_meal.get('food_items', []):
            nutrition = food_item.get('nutrition', {})
            for key in total_nutrition:
                total_nutrition[key] += nutrition.get(key, 0)
        
        updated_meal['total_nutrition'] = total_nutrition
        
        return jsonify({
            'message': 'Meal updated successfully',
            'meal': updated_meal
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update meal error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/<meal_id>', methods=['DELETE'])
@token_required
def delete_meal(meal_id):
    """
    Delete a meal
    Requires authentication token
    
    Args:
        meal_id (str): Meal document ID
    
    Returns:
        JSON response with success message
    """
    try:
        # Verify meal exists and belongs to user
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        meal_exists = any(meal['id'] == meal_id for meal in meals)
        if not meal_exists:
            return jsonify({'error': 'Meal not found'}), 404
        
        # Delete meal from Firebase
        success = firebase_service.delete_meal(request.current_user_id, meal_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete meal'}), 500
        
        return jsonify({
            'message': 'Meal deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Delete meal error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/nutrition/summary', methods=['GET'])
@token_required
def get_nutrition_summary():
    """
    Get nutrition summary for a specific date or date range
    Requires authentication token
    
    Query parameters:
    - date: Specific date (YYYY-MM-DD format) - defaults to today
    - date_from: Start date for range (YYYY-MM-DD format)
    - date_to: End date for range (YYYY-MM-DD format)
    
    Returns:
        JSON response with nutrition summary
    """
    try:
        # Get query parameters
        date = request.args.get('date')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Determine date range
        if date:
            # Single date
            target_date = datetime.strptime(date, '%Y-%m-%d').date()
            date_from = date_to = target_date
        elif date_from and date_to:
            # Date range
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        else:
            # Default to today
            today = datetime.now().date()
            date_from = date_to = today
        
        # Get meals from Firebase
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        # Filter meals by date range
        filtered_meals = []
        for meal in meals:
            meal_timestamp = meal.get('timestamp')
            if meal_timestamp:
                # Convert timestamp to datetime if it's a string
                if isinstance(meal_timestamp, str):
                    meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
                elif hasattr(meal_timestamp, 'timestamp'):
                    meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
                
                meal_date = meal_timestamp.date()
                
                if date_from <= meal_date <= date_to:
                    filtered_meals.append(meal)
        
        # Calculate total nutrition
        total_nutrition = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0,
            'sugar': 0,
            'sodium': 0
        }
        
        meal_breakdown = []
        for meal in filtered_meals:
            meal_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
            
            for food_item in meal.get('food_items', []):
                nutrition = food_item.get('nutrition', {})
                for key in meal_nutrition:
                    value = nutrition.get(key, 0)
                    meal_nutrition[key] += value
                    total_nutrition[key] += value
            
            meal_breakdown.append({
                'meal_id': meal['id'],
                'name': meal['name'],
                'meal_type': meal['meal_type'],
                'timestamp': meal['timestamp'],
                'nutrition': meal_nutrition
            })
        
        return jsonify({
            'date_range': {
                'from': date_from.isoformat(),
                'to': date_to.isoformat()
            },
            'total_nutrition': total_nutrition,
            'meal_breakdown': meal_breakdown,
            'meal_count': len(filtered_meals)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get nutrition summary error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@meal_bp.route('/food-items/search', methods=['GET'])
@token_required
def search_food_items():
    """
    Search for food items (placeholder for future food database integration)
    Requires authentication token
    
    Query parameters:
    - query: Search term for food items
    - limit: Maximum number of results (default: 20)
    
    Returns:
        JSON response with food item suggestions
    """
    try:
        query = request.args.get('query', '').strip()
        limit = request.args.get('limit', 20, type=int)
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        if limit > 50:
            limit = 50
        
        # This is a placeholder implementation
        # In a real application, you would integrate with a food database API
        # like USDA FoodData Central, Edamam, or Spoonacular
        
        # For now, return a mock response
        mock_food_items = [
            {
                'name': 'Chicken Breast',
                'serving_size': 100,
                'serving_unit': 'g',
                'nutrition': {
                    'calories': 165,
                    'protein': 31.0,
                    'carbs': 0.0,
                    'fat': 3.6,
                    'fiber': 0.0,
                    'sugar': 0.0,
                    'sodium': 74.0
                }
            },
            {
                'name': 'Brown Rice',
                'serving_size': 100,
                'serving_unit': 'g',
                'nutrition': {
                    'calories': 111,
                    'protein': 2.6,
                    'carbs': 23.0,
                    'fat': 0.9,
                    'fiber': 1.8,
                    'sugar': 0.4,
                    'sodium': 5.0
                }
            }
        ]
        
        # Filter results based on query (simple string matching)
        filtered_items = [
            item for item in mock_food_items 
            if query.lower() in item['name'].lower()
        ][:limit]
        
        return jsonify({
            'food_items': filtered_items,
            'count': len(filtered_items),
            'query': query
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Search food items error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
