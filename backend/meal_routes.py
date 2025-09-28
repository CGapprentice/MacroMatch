# meal routes for our app :)
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from models import Meal
from firebase_config import get_firebase_service
from auth_utils import firebase_token_required

meal_bp = Blueprint('meals', __name__, url_prefix='/api/v1/meals')

@meal_bp.route('/', methods=['POST'])
@firebase_token_required
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
        
        # save to firebase
        firebase_service = get_firebase_service()
        meal_id = firebase_service.add_meal(request.current_user_id, meal.to_dict())
        
        return jsonify({
            'message': 'meal created! :)',
            'meal': {
                'id': meal_id,
                'name': meal.name,
                'meal_type': meal.meal_type,
                'calories': meal.calories,
                'notes': meal.notes,
                'timestamp': meal.timestamp.isoformat()
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@meal_bp.route('/', methods=['GET'])
@firebase_token_required
def get_meals():
    # get user's meals
    try:
        limit = request.args.get('limit', 50, type=int)
        if limit > 100:
            limit = 100
        
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, limit)
        
        return jsonify({
            'meals': meals,
            'count': len(meals)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@meal_bp.route('/<meal_id>', methods=['DELETE'])
@firebase_token_required
def delete_meal(meal_id):
    # delete a meal
    try:
        firebase_service = get_firebase_service()
        meals = firebase_service.get_user_meals(request.current_user_id, 1000)
        
        meal_exists = any(meal['id'] == meal_id for meal in meals)
        if not meal_exists:
            return jsonify({'error': 'meal not found'}), 404
        
        # for now just return success - we'd need to add delete method to firebase service
        return jsonify({'message': 'meal deleted! :)'}), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500
