# meal routes for our app :)
from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from models import Meal
from mongodb_config import get_meals_collection
from auth_middleware import require_auth

meal_bp = Blueprint('meals', __name__, url_prefix='/api/v1/meals')

@meal_bp.route('/', methods=['POST'])
@require_auth
def create_meal():
    # create new meal
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'no data provided'}), 400

        # check required fields
        if not data.get('name') or not data.get('meal_type'):
            return jsonify({'error': 'need name and meal_type'}), 400

        # create meal
        meal = Meal(
            name=data['name'].strip(),
            meal_type=data['meal_type'].strip(),
            calories=data.get('calories', 0),
            notes=data.get('notes', '')
        )

        # validate
        validation_errors = meal.validate()
        if validation_errors:
            return jsonify({'error': 'validation failed', 'details': validation_errors}), 400

        # save to mongodb
        meals_collection = get_meals_collection()
        meal_data = meal.to_dict()
        meal_data['firebase_uid'] = request.firebase_uid
        meal_data['user_id'] = str(request.current_user['_id'])

        result = meals_collection.insert_one(meal_data)

        return jsonify({
            'message': 'meal created! :)',
            'meal': {
                'id': str(result.inserted_id),
                'name': meal.name,
                'meal_type': meal.meal_type,
                'calories': meal.calories,
                'notes': meal.notes,
                'timestamp': meal.timestamp.isoformat()
            }
        }), 201

    except Exception as e:
        print(f"create meal error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@meal_bp.route('/', methods=['GET'])
@require_auth
def get_meals():
    # get user's meals
    try:
        limit = request.args.get('limit', 50, type=int)
        if limit > 100:
            limit = 100

        meals_collection = get_meals_collection()
        meals_cursor = meals_collection.find(
            {'firebase_uid': request.firebase_uid}
        ).sort('timestamp', -1).limit(limit)

        meals = []
        for meal in meals_cursor:
            meal['id'] = str(meal['_id'])
            del meal['_id']
            if 'timestamp' in meal and hasattr(meal['timestamp'], 'isoformat'):
                meal['timestamp'] = meal['timestamp'].isoformat()
            meals.append(meal)

        return jsonify({
            'meals': meals,
            'count': len(meals)
        }), 200

    except Exception as e:
        print(f"get meals error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@meal_bp.route('/<meal_id>', methods=['DELETE'])
@require_auth
def delete_meal(meal_id):
    # delete a meal
    try:
        meals_collection = get_meals_collection()

        # verify meal exists and belongs to user
        result = meals_collection.delete_one({
            '_id': ObjectId(meal_id),
            'firebase_uid': request.firebase_uid
        })

        if result.deleted_count == 0:
            return jsonify({'error': 'meal not found'}), 404

        return jsonify({'message': 'meal deleted! :)'}), 200

    except Exception as e:
        print(f"delete meal error: {str(e)}")
        return jsonify({'error': 'server error'}), 500
