# user routes for saving profile data :)
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from models import User
from firebase_config import get_firebase_service
from auth_utils import firebase_token_required

user_bp = Blueprint('users', __name__, url_prefix='/api/v1/users')

@user_bp.route('/profile', methods=['GET'])
@firebase_token_required
def get_user_profile():
    # get current user's profile
    try:
        user_response = {k: v for k, v in request.current_user.items() if k != 'id'}
        return jsonify({
            'user': user_response
        }), 200
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@user_bp.route('/profile', methods=['PUT'])
@firebase_token_required
def update_user_profile():
    # update user profile data
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'no data provided'}), 400
        
        # allowed fields to update
        allowed_fields = ['name', 'age', 'weight', 'height', 'activity_level', 'dietary_goals', 'gender']
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'no valid fields to update'}), 400
        
        # add updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # update in firebase
        firebase_service = get_firebase_service()
        success = firebase_service.update_user(request.current_user_id, update_data)
        
        if not success:
            return jsonify({'error': 'failed to update profile'}), 500
        
        # get updated user data
        updated_user = firebase_service.get_user(request.current_user_id)
        user_response = {k: v for k, v in updated_user.items() if k != 'id'}
        
        return jsonify({
            'message': 'profile updated! :)',
            'user': user_response
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@user_bp.route('/profile/complete', methods=['POST'])
@firebase_token_required
def complete_user_profile():
    # complete user profile setup (for first time users)
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'no data provided'}), 400
        
        # required fields for profile completion
        required_fields = ['name', 'age', 'weight', 'height', 'activity_level', 'dietary_goals', 'gender']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'error': 'missing required fields',
                'missing': missing_fields
            }), 400
        
        # create user model for validation
        user_data = {
            'firebase_uid': request.firebase_uid,
            'email': request.current_user.get('email'),
            'name': data['name'],
            'age': data['age'],
            'weight': data['weight'],
            'height': data['height'],
            'activity_level': data['activity_level'],
            'dietary_goals': data['dietary_goals'],
            'gender': data['gender']
        }
        
        user = User(**user_data)
        validation_errors = user.validate()
        
        if validation_errors:
            return jsonify({
                'error': 'validation failed',
                'details': validation_errors
            }), 400
        
        # update user in firebase
        update_data = user.to_dict()
        update_data['updated_at'] = datetime.utcnow()
        
        firebase_service = get_firebase_service()
        success = firebase_service.update_user(request.current_user_id, update_data)
        
        if not success:
            return jsonify({'error': 'failed to complete profile'}), 500
        
        # get updated user
        updated_user = firebase_service.get_user(request.current_user_id)
        user_response = {k: v for k, v in updated_user.items() if k != 'id'}
        
        return jsonify({
            'message': 'profile completed! :)',
            'user': user_response
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@user_bp.route('/stats', methods=['GET'])
@firebase_token_required
def get_user_stats():
    # get user stats and meal history summary
    try:
        firebase_service = get_firebase_service()
        
        # get user's meals
        meals = firebase_service.get_user_meals(request.current_user_id, 100)
        
        # calculate basic stats
        total_meals = len(meals)
        total_calories = sum(meal.get('calories', 0) for meal in meals)
        
        # meal type breakdown
        meal_types = {}
        for meal in meals:
            meal_type = meal.get('meal_type', 'unknown')
            meal_types[meal_type] = meal_types.get(meal_type, 0) + 1
        
        return jsonify({
            'stats': {
                'total_meals': total_meals,
                'total_calories': total_calories,
                'meal_breakdown': meal_types,
                'avg_calories_per_meal': round(total_calories / total_meals, 1) if total_meals > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500
