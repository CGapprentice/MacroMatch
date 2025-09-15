"""
Authentication routes for MacroMatch backend
Handles user registration, login, logout, and profile management
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models import User
from firebase_config import get_firebase_service

# Create authentication blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

def token_required(f):
    """
    Decorator to require authentication token for protected routes
    Validates JWT token and adds user information to the request context
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Extract token from "Bearer <token>" format
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode and verify JWT token
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            
            # Get user from Firebase
            firebase_service = get_firebase_service()
            current_user = firebase_service.get_user(current_user_id)
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': 'Token validation failed'}), 401
        
        # Add current user to request context
        request.current_user = current_user
        request.current_user_id = current_user_id
        
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user account
    Creates user in Firebase and returns authentication token
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "securepassword",
        "name": "John Doe",
        "age": 25,
        "weight": 70.5,
        "height": 175.0,
        "activity_level": "moderate",
        "dietary_goals": "maintenance"
    }
    
    Returns:
        JSON response with success message and authentication token
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create user model instance for validation
        user_data = {
            'email': data['email'].lower().strip(),
            'name': data['name'].strip(),
            'age': data.get('age'),
            'weight': data.get('weight'),
            'height': data.get('height'),
            'activity_level': data.get('activity_level'),
            'dietary_goals': data.get('dietary_goals')
        }
        
        user = User(**user_data)
        
        # Validate user data
        validation_errors = user.validate()
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        # Check if user already exists
        firebase_service = get_firebase_service()
        existing_user = firebase_service.get_user_by_email(user.email)
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Hash password
        password_hash = generate_password_hash(data['password'])
        
        # Prepare user data for Firebase
        user_dict = user.to_dict()
        user_dict['password_hash'] = password_hash
        
        # Create user in Firebase
        user_id = firebase_service.create_user(user_dict)
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': user.email,
                'name': user.name,
                'age': user.age,
                'weight': user.weight,
                'height': user.height,
                'activity_level': user.activity_level,
                'dietary_goals': user.dietary_goals
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate user and return JWT token
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    
    Returns:
        JSON response with authentication token and user information
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Get user from Firebase
        firebase_service = get_firebase_service()
        user = firebase_service.get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not check_password_hash(user.get('password_hash', ''), password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        # Remove password hash from response
        user_response = {k: v for k, v in user.items() if k != 'password_hash'}
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_response
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Get current user's profile information
    Requires authentication token
    
    Returns:
        JSON response with user profile data
    """
    try:
        # Remove sensitive information from response
        user_response = {k: v for k, v in request.current_user.items() if k != 'password_hash'}
        
        return jsonify({
            'user': user_response
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get profile error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    """
    Update current user's profile information
    Requires authentication token
    
    Expected JSON payload:
    {
        "name": "Updated Name",
        "age": 26,
        "weight": 72.0,
        "height": 176.0,
        "activity_level": "active",
        "dietary_goals": "weight_loss"
    }
    
    Returns:
        JSON response with updated user information
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Get current user data
        current_user = request.current_user.copy()
        
        # Update allowed fields
        allowed_fields = ['name', 'age', 'weight', 'height', 'activity_level', 'dietary_goals']
        update_data = {}
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Create user model for validation
        updated_user_data = current_user.copy()
        updated_user_data.update(update_data)
        
        user = User(**updated_user_data)
        validation_errors = user.validate()
        
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update user in Firebase
        firebase_service = get_firebase_service()
        success = firebase_service.update_user(request.current_user_id, update_data)
        
        if not success:
            return jsonify({'error': 'Failed to update profile'}), 500
        
        # Get updated user data
        updated_user = firebase_service.get_user(request.current_user_id)
        user_response = {k: v for k, v in updated_user.items() if k != 'password_hash'}
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_response
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update profile error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password():
    """
    Change user's password
    Requires authentication token and current password
    
    Expected JSON payload:
    {
        "current_password": "oldpassword",
        "new_password": "newpassword"
    }
    
    Returns:
        JSON response with success message
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        current_password = data['current_password']
        new_password = data['new_password']
        
        # Validate new password length
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        # Verify current password
        current_user = request.current_user
        if not check_password_hash(current_user.get('password_hash', ''), current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Hash new password
        new_password_hash = generate_password_hash(new_password)
        
        # Update password in Firebase
        firebase_service = get_firebase_service()
        success = firebase_service.update_user(request.current_user_id, {
            'password_hash': new_password_hash,
            'updated_at': datetime.utcnow()
        })
        
        if not success:
            return jsonify({'error': 'Failed to update password'}), 500
        
        return jsonify({
            'message': 'Password updated successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Change password error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    Logout user (client-side token invalidation)
    Note: JWT tokens are stateless, so this is mainly for client-side cleanup
    
    Returns:
        JSON response with success message
    """
    try:
        # In a stateless JWT system, logout is handled client-side
        # by removing the token from storage
        # For enhanced security, you could implement a token blacklist
        
        return jsonify({
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify if a JWT token is valid
    Useful for checking token validity without making a full request
    
    Expected JSON payload:
    {
        "token": "jwt_token_string"
    }
    
    Returns:
        JSON response with token validity status
    """
    try:
        data = request.get_json()
        
        if not data.get('token'):
            return jsonify({'error': 'Token is required'}), 400
        
        token = data['token']
        
        try:
            # Decode and verify JWT token
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            user_id = data['user_id']
            
            # Check if user still exists
            firebase_service = get_firebase_service()
            user = firebase_service.get_user(user_id)
            
            if not user:
                return jsonify({'valid': False, 'message': 'User not found'}), 200
            
            return jsonify({
                'valid': True,
                'user_id': user_id,
                'email': data.get('email')
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'valid': False, 'message': 'Token has expired'}), 200
        except jwt.InvalidTokenError:
            return jsonify({'valid': False, 'message': 'Invalid token'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Verify token error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
