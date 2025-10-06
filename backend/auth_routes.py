# firebase auth routes for our app :)
from flask import Blueprint, request, jsonify
from firebase_config import get_firebase_service
from auth_utils import firebase_token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/verify', methods=['POST'])
@firebase_token_required
def verify_token():
    """Verify Firebase token and return user info"""
    try:
        user_response = {k: v for k, v in request.current_user.items() if k != 'password_hash'}
        return jsonify({
            'message': 'token valid! :)',
            'user': user_response,
            'firebase_uid': request.firebase_uid
        }), 200
    except Exception as e:
        print(f"verify token error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@firebase_token_required
def get_profile():
    """Get user profile"""
    try:
        user_response = {k: v for k, v in request.current_user.items() if k != 'password_hash'}
        return jsonify({'user': user_response}), 200
    except Exception as e:
        print(f"get profile error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@firebase_token_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'no data provided'}), 400
        
        # Allow updating specific fields
        allowed_fields = ['name', 'age', 'weight', 'height']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'error': 'no valid fields to update'}), 400
        
        # Update user in Firestore (you'll need to add this method)
        firebase_service = get_firebase_service()
        # For now, just return success - you'd implement update_user method
        
        return jsonify({
            'message': 'profile updated! :)',
            'updated_fields': list(update_data.keys())
        }), 200
        
    except Exception as e:
        print(f"update profile error: {str(e)}")
        return jsonify({'error': 'server error'}), 500