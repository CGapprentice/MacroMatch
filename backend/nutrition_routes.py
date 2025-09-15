"""
Nutrition calculation and tracking routes for MacroMatch backend
Handles BMR calculation, macro recommendations, and nutrition analysis
"""

from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from models import User
from firebase_config import get_firebase_service
from auth_routes import token_required
import math

# Create nutrition blueprint
nutrition_bp = Blueprint('nutrition', __name__, url_prefix='/api/v1/nutrition')

def calculate_bmr(weight, height, age, gender):
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
    This is the number of calories your body needs at rest
    
    Args:
        weight (float): Weight in kg
        height (float): Height in cm
        age (int): Age in years
        gender (str): 'male' or 'female'
    
    Returns:
        float: BMR in calories per day
    """
    if gender.lower() == 'male':
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:  # female
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
    
    return round(bmr, 2)

def calculate_tdee(bmr, activity_level):
    """
    Calculate Total Daily Energy Expenditure (TDEE)
    BMR multiplied by activity factor
    
    Args:
        bmr (float): Basal Metabolic Rate
        activity_level (str): Activity level description
    
    Returns:
        float: TDEE in calories per day
    """
    activity_factors = {
        'sedentary': 1.2,      # Little to no exercise
        'light': 1.375,        # Light exercise 1-3 days/week
        'moderate': 1.55,      # Moderate exercise 3-5 days/week
        'active': 1.725,       # Heavy exercise 6-7 days/week
        'very_active': 1.9     # Very heavy exercise, physical job
    }
    
    factor = activity_factors.get(activity_level.lower(), 1.2)
    return round(bmr * factor, 2)

def calculate_macro_targets(tdee, dietary_goals, weight=None):
    """
    Calculate macronutrient targets based on TDEE and dietary goals
    
    Args:
        tdee (float): Total Daily Energy Expenditure
        dietary_goals (str): Dietary goal (weight_loss, weight_gain, maintenance, muscle_gain)
        weight (float, optional): Weight in kg for protein calculation
    
    Returns:
        dict: Macro targets with calories, protein, carbs, fat
    """
    # Adjust calories based on goals
    if dietary_goals == 'weight_loss':
        target_calories = tdee - 500  # 500 calorie deficit
    elif dietary_goals == 'weight_gain':
        target_calories = tdee + 500  # 500 calorie surplus
    elif dietary_goals == 'muscle_gain':
        target_calories = tdee + 300  # 300 calorie surplus
    else:  # maintenance
        target_calories = tdee
    
    # Protein calculation (g per kg body weight)
    if weight:
        if dietary_goals in ['muscle_gain', 'weight_gain']:
            protein_per_kg = 2.2  # Higher protein for muscle building
        elif dietary_goals == 'weight_loss':
            protein_per_kg = 2.0  # Higher protein to preserve muscle
        else:
            protein_per_kg = 1.6  # Standard protein intake
        
        protein_grams = weight * protein_per_kg
    else:
        # Fallback: 20-25% of calories from protein
        protein_grams = (target_calories * 0.225) / 4  # 4 calories per gram of protein
    
    # Fat calculation (25-30% of calories)
    fat_percentage = 0.275  # 27.5% of calories from fat
    fat_grams = (target_calories * fat_percentage) / 9  # 9 calories per gram of fat
    
    # Carbohydrate calculation (remaining calories)
    protein_calories = protein_grams * 4
    fat_calories = fat_grams * 9
    carb_calories = target_calories - protein_calories - fat_calories
    carb_grams = carb_calories / 4  # 4 calories per gram of carbs
    
    return {
        'calories': round(target_calories, 0),
        'protein': round(protein_grams, 1),
        'carbs': round(carb_grams, 1),
        'fat': round(fat_grams, 1),
        'protein_percentage': round((protein_calories / target_calories) * 100, 1),
        'carbs_percentage': round((carb_calories / target_calories) * 100, 1),
        'fat_percentage': round((fat_calories / target_calories) * 100, 1)
    }

@nutrition_bp.route('/calculate-bmr', methods=['POST'])
@token_required
def calculate_user_bmr():
    """
    Calculate BMR and TDEE for the current user
    Requires authentication token
    
    Expected JSON payload (optional - uses user profile data if not provided):
    {
        "weight": 70.5,
        "height": 175.0,
        "age": 25,
        "gender": "male",
        "activity_level": "moderate"
    }
    
    Returns:
        JSON response with BMR, TDEE, and macro targets
    """
    try:
        data = request.get_json() or {}
        user = request.current_user
        
        # Use provided data or fall back to user profile
        weight = data.get('weight') or user.get('weight')
        height = data.get('height') or user.get('height')
        age = data.get('age') or user.get('age')
        gender = data.get('gender') or user.get('gender', 'male')  # Default to male
        activity_level = data.get('activity_level') or user.get('activity_level', 'moderate')
        dietary_goals = data.get('dietary_goals') or user.get('dietary_goals', 'maintenance')
        
        # Validate required fields
        if not all([weight, height, age]):
            return jsonify({
                'error': 'Weight, height, and age are required for BMR calculation'
            }), 400
        
        # Calculate BMR and TDEE
        bmr = calculate_bmr(weight, height, age, gender)
        tdee = calculate_tdee(bmr, activity_level)
        
        # Calculate macro targets
        macro_targets = calculate_macro_targets(tdee, dietary_goals, weight)
        
        return jsonify({
            'bmr': bmr,
            'tdee': tdee,
            'activity_level': activity_level,
            'dietary_goals': dietary_goals,
            'macro_targets': macro_targets,
            'user_data': {
                'weight': weight,
                'height': height,
                'age': age,
                'gender': gender
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Calculate BMR error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@nutrition_bp.route('/macro-targets', methods=['GET'])
@token_required
def get_macro_targets():
    """
    Get macro targets for the current user
    Requires authentication token
    
    Returns:
        JSON response with macro targets and progress
    """
    try:
        user = request.current_user
        
        # Get user data
        weight = user.get('weight')
        height = user.get('height')
        age = user.get('age')
        gender = user.get('gender', 'male')
        activity_level = user.get('activity_level', 'moderate')
        dietary_goals = user.get('dietary_goals', 'maintenance')
        
        if not all([weight, height, age]):
            return jsonify({
                'error': 'Complete your profile (weight, height, age) to get macro targets'
            }), 400
        
        # Calculate targets
        bmr = calculate_bmr(weight, height, age, gender)
        tdee = calculate_tdee(bmr, activity_level)
        macro_targets = calculate_macro_targets(tdee, dietary_goals, weight)
        
        # Get today's nutrition intake
        today = datetime.now().date()
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        # Filter meals for today
        today_meals = []
        for meal in meals:
            meal_timestamp = meal.get('timestamp')
            if meal_timestamp:
                if isinstance(meal_timestamp, str):
                    meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
                elif hasattr(meal_timestamp, 'timestamp'):
                    meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
                
                if meal_timestamp.date() == today:
                    today_meals.append(meal)
        
        # Calculate today's intake
        today_intake = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0,
            'sugar': 0,
            'sodium': 0
        }
        
        for meal in today_meals:
            for food_item in meal.get('food_items', []):
                nutrition = food_item.get('nutrition', {})
                for key in today_intake:
                    today_intake[key] += nutrition.get(key, 0)
        
        # Calculate progress percentages
        progress = {}
        for macro in ['calories', 'protein', 'carbs', 'fat']:
            target = macro_targets[macro]
            consumed = today_intake[macro]
            percentage = (consumed / target * 100) if target > 0 else 0
            progress[macro] = {
                'target': target,
                'consumed': round(consumed, 1),
                'remaining': round(target - consumed, 1),
                'percentage': round(min(percentage, 100), 1)
            }
        
        return jsonify({
            'macro_targets': macro_targets,
            'today_intake': today_intake,
            'progress': progress,
            'meal_count': len(today_meals),
            'date': today.isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get macro targets error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@nutrition_bp.route('/analysis', methods=['GET'])
@token_required
def get_nutrition_analysis():
    """
    Get nutrition analysis for a specific date range
    Requires authentication token
    
    Query parameters:
    - days: Number of days to analyze (default: 7)
    - date_from: Start date (YYYY-MM-DD format)
    - date_to: End date (YYYY-MM-DD format)
    
    Returns:
        JSON response with nutrition analysis and trends
    """
    try:
        # Get query parameters
        days = request.args.get('days', 7, type=int)
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Determine date range
        if date_from and date_to:
            start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
        else:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days-1)
        
        # Get meals from Firebase
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        # Filter meals by date range
        filtered_meals = []
        for meal in meals:
            meal_timestamp = meal.get('timestamp')
            if meal_timestamp:
                if isinstance(meal_timestamp, str):
                    meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
                elif hasattr(meal_timestamp, 'timestamp'):
                    meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
                
                meal_date = meal_timestamp.date()
                if start_date <= meal_date <= end_date:
                    filtered_meals.append(meal)
        
        # Group meals by date
        daily_nutrition = {}
        for meal in filtered_meals:
            meal_timestamp = meal.get('timestamp')
            if isinstance(meal_timestamp, str):
                meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
            elif hasattr(meal_timestamp, 'timestamp'):
                meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
            
            meal_date = meal_timestamp.date().isoformat()
            
            if meal_date not in daily_nutrition:
                daily_nutrition[meal_date] = {
                    'calories': 0,
                    'protein': 0,
                    'carbs': 0,
                    'fat': 0,
                    'fiber': 0,
                    'sugar': 0,
                    'sodium': 0,
                    'meal_count': 0
                }
            
            # Add nutrition from this meal
            for food_item in meal.get('food_items', []):
                nutrition = food_item.get('nutrition', {})
                for key in daily_nutrition[meal_date]:
                    if key != 'meal_count':
                        daily_nutrition[meal_date][key] += nutrition.get(key, 0)
            
            daily_nutrition[meal_date]['meal_count'] += 1
        
        # Calculate averages and totals
        total_days = len(daily_nutrition)
        if total_days > 0:
            averages = {}
            totals = {}
            
            for nutrient in ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']:
                values = [daily_nutrition[date][nutrient] for date in daily_nutrition]
                averages[nutrient] = round(sum(values) / total_days, 1)
                totals[nutrient] = round(sum(values), 1)
            
            # Calculate meal frequency
            meal_counts = [daily_nutrition[date]['meal_count'] for date in daily_nutrition]
            avg_meals_per_day = round(sum(meal_counts) / total_days, 1)
        else:
            averages = {nutrient: 0 for nutrient in ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']}
            totals = averages.copy()
            avg_meals_per_day = 0
        
        # Get user's macro targets for comparison
        user = request.current_user
        weight = user.get('weight')
        height = user.get('height')
        age = user.get('age')
        gender = user.get('gender', 'male')
        activity_level = user.get('activity_level', 'moderate')
        dietary_goals = user.get('dietary_goals', 'maintenance')
        
        macro_targets = None
        if all([weight, height, age]):
            bmr = calculate_bmr(weight, height, age, gender)
            tdee = calculate_tdee(bmr, activity_level)
            macro_targets = calculate_macro_targets(tdee, dietary_goals, weight)
        
        return jsonify({
            'date_range': {
                'from': start_date.isoformat(),
                'to': end_date.isoformat(),
                'days': total_days
            },
            'daily_nutrition': daily_nutrition,
            'averages': averages,
            'totals': totals,
            'avg_meals_per_day': avg_meals_per_day,
            'macro_targets': macro_targets,
            'analysis': {
                'calorie_consistency': _analyze_consistency([daily_nutrition[date]['calories'] for date in daily_nutrition]),
                'protein_adequacy': _analyze_protein_adequacy(averages.get('protein', 0), weight),
                'meal_frequency': _analyze_meal_frequency(avg_meals_per_day)
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get nutrition analysis error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def _analyze_consistency(values):
    """Analyze consistency of daily values"""
    if len(values) < 2:
        return {'status': 'insufficient_data', 'message': 'Need at least 2 days of data'}
    
    mean_val = sum(values) / len(values)
    variance = sum((x - mean_val) ** 2 for x in values) / len(values)
    std_dev = variance ** 0.5
    cv = (std_dev / mean_val) * 100 if mean_val > 0 else 0
    
    if cv < 10:
        return {'status': 'excellent', 'message': 'Very consistent intake', 'coefficient_of_variation': round(cv, 1)}
    elif cv < 20:
        return {'status': 'good', 'message': 'Good consistency', 'coefficient_of_variation': round(cv, 1)}
    elif cv < 30:
        return {'status': 'fair', 'message': 'Moderate consistency', 'coefficient_of_variation': round(cv, 1)}
    else:
        return {'status': 'poor', 'message': 'Inconsistent intake', 'coefficient_of_variation': round(cv, 1)}

def _analyze_protein_adequacy(avg_protein, weight):
    """Analyze protein adequacy"""
    if not weight:
        return {'status': 'unknown', 'message': 'Weight not available for analysis'}
    
    protein_per_kg = avg_protein / weight if weight > 0 else 0
    
    if protein_per_kg >= 2.0:
        return {'status': 'excellent', 'message': 'High protein intake', 'g_per_kg': round(protein_per_kg, 1)}
    elif protein_per_kg >= 1.6:
        return {'status': 'good', 'message': 'Adequate protein intake', 'g_per_kg': round(protein_per_kg, 1)}
    elif protein_per_kg >= 1.2:
        return {'status': 'fair', 'message': 'Moderate protein intake', 'g_per_kg': round(protein_per_kg, 1)}
    else:
        return {'status': 'low', 'message': 'Low protein intake', 'g_per_kg': round(protein_per_kg, 1)}

def _analyze_meal_frequency(avg_meals):
    """Analyze meal frequency"""
    if avg_meals >= 4:
        return {'status': 'high', 'message': 'Frequent meals/snacks', 'meals_per_day': avg_meals}
    elif avg_meals >= 3:
        return {'status': 'normal', 'message': 'Standard meal pattern', 'meals_per_day': avg_meals}
    elif avg_meals >= 2:
        return {'status': 'low', 'message': 'Few meals per day', 'meals_per_day': avg_meals}
    else:
        return {'status': 'very_low', 'message': 'Very few meals', 'meals_per_day': avg_meals}

@nutrition_bp.route('/recommendations', methods=['GET'])
@token_required
def get_nutrition_recommendations():
    """
    Get personalized nutrition recommendations based on user's data
    Requires authentication token
    
    Returns:
        JSON response with nutrition recommendations
    """
    try:
        user = request.current_user
        
        # Get user's recent nutrition data
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 100)
        
        # Analyze last 7 days
        recent_meals = []
        cutoff_date = datetime.now().date() - timedelta(days=7)
        
        for meal in meals:
            meal_timestamp = meal.get('timestamp')
            if meal_timestamp:
                if isinstance(meal_timestamp, str):
                    meal_timestamp = datetime.fromisoformat(meal_timestamp.replace('Z', '+00:00'))
                elif hasattr(meal_timestamp, 'timestamp'):
                    meal_timestamp = datetime.fromtimestamp(meal_timestamp.timestamp())
                
                if meal_timestamp.date() >= cutoff_date:
                    recent_meals.append(meal)
        
        # Calculate recent averages
        if recent_meals:
            total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sugar': 0, 'sodium': 0}
            meal_count = 0
            
            for meal in recent_meals:
                meal_count += 1
                for food_item in meal.get('food_items', []):
                    nutrition = food_item.get('nutrition', {})
                    for key in total_nutrition:
                        total_nutrition[key] += nutrition.get(key, 0)
            
            days = max(1, len(set(meal.get('timestamp') for meal in recent_meals if meal.get('timestamp'))))
            averages = {key: round(value / days, 1) for key, value in total_nutrition.items()}
        else:
            averages = {nutrient: 0 for nutrient in ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']}
            meal_count = 0
            days = 0
        
        # Generate recommendations
        recommendations = []
        
        # Calorie recommendations
        if user.get('weight') and user.get('height') and user.get('age'):
            bmr = calculate_bmr(user['weight'], user['height'], user['age'], user.get('gender', 'male'))
            tdee = calculate_tdee(bmr, user.get('activity_level', 'moderate'))
            macro_targets = calculate_macro_targets(tdee, user.get('dietary_goals', 'maintenance'), user['weight'])
            
            calorie_diff = averages['calories'] - macro_targets['calories']
            if abs(calorie_diff) > 200:
                if calorie_diff > 0:
                    recommendations.append({
                        'type': 'calories',
                        'priority': 'high',
                        'message': f'You\'re consuming {abs(calorie_diff):.0f} calories above your target. Consider reducing portion sizes or choosing lower-calorie foods.',
                        'action': 'Reduce calorie intake'
                    })
                else:
                    recommendations.append({
                        'type': 'calories',
                        'priority': 'high',
                        'message': f'You\'re consuming {abs(calorie_diff):.0f} calories below your target. Consider adding healthy snacks or increasing portion sizes.',
                        'action': 'Increase calorie intake'
                    })
        
        # Protein recommendations
        if user.get('weight'):
            protein_per_kg = averages['protein'] / user['weight'] if user['weight'] > 0 else 0
            if protein_per_kg < 1.6:
                recommendations.append({
                    'type': 'protein',
                    'priority': 'medium',
                    'message': f'Your protein intake is {protein_per_kg:.1f}g per kg body weight. Consider adding lean meats, fish, eggs, or plant-based proteins.',
                    'action': 'Increase protein intake'
                })
        
        # Fiber recommendations
        if averages['fiber'] < 25:
            recommendations.append({
                'type': 'fiber',
                'priority': 'medium',
                'message': f'Your daily fiber intake is {averages["fiber"]:.1f}g. Aim for 25-35g daily by eating more fruits, vegetables, and whole grains.',
                'action': 'Increase fiber intake'
            })
        
        # Meal frequency recommendations
        if days > 0:
            meals_per_day = meal_count / days
            if meals_per_day < 3:
                recommendations.append({
                    'type': 'meal_frequency',
                    'priority': 'low',
                    'message': f'You average {meals_per_day:.1f} meals per day. Consider eating more regularly to maintain stable energy levels.',
                    'action': 'Increase meal frequency'
                })
        
        # Sodium recommendations
        if averages['sodium'] > 2300:  # Daily recommended limit
            recommendations.append({
                'type': 'sodium',
                'priority': 'medium',
                'message': f'Your sodium intake is {averages["sodium"]:.0f}mg daily, which exceeds the recommended 2300mg limit.',
                'action': 'Reduce sodium intake'
            })
        
        return jsonify({
            'recommendations': recommendations,
            'recent_averages': averages,
            'analysis_period': f'{days} days',
            'meal_count': meal_count
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get nutrition recommendations error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
