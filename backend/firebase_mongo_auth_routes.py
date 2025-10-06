# Firebase + MongoDB authentication routes
from flask import Blueprint, request, jsonify
from datetime import datetime
from mongodb_config import get_users_collection, get_calculator_data_collection
from firebase_config import get_firebase_service
from auth_middleware import require_auth, verify_firebase_token
import firebase_admin
from firebase_admin import auth as firebase_auth

firebase_mongo_auth_bp = Blueprint('firebase_mongo_auth', __name__, url_prefix='/api/auth')

def get_or_create_user(firebase_uid, email, name=None):
    """Get user from MongoDB or create if doesn't exist"""
    users_collection = get_users_collection()
    
    user = users_collection.find_one({'firebase_uid': firebase_uid})
    
    if not user:
        # Create new user in MongoDB
        user_data = {
            'firebase_uid': firebase_uid,
            'email': email,
            'name': name or email.split('@')[0],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = users_collection.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        return user_data
    
    return user

@firebase_mongo_auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user with Firebase Auth"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        # Validate input
        if not email or '@' not in email:
            return jsonify({'error': 'Valid email is required'}), 400
        
        if not password or len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Create user in Firebase
        try:
            # Ensure Firebase is initialized
            get_firebase_service()
            
            firebase_user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            
            # Create/get user in MongoDB
            mongo_user = get_or_create_user(firebase_user.uid, email, name)
            
            # Generate custom token for frontend
            custom_token = firebase_auth.create_custom_token(firebase_user.uid)
            
            # Return user data
            user_response = {
                'id': str(mongo_user['_id']),
                'firebase_uid': firebase_user.uid,
                'email': email,
                'name': name or email.split('@')[0]
            }
            
            return jsonify({
                'message': 'Registration successful',
                'customToken': custom_token.decode('utf-8'),
                'user': user_response
            }), 201
            
        except firebase_auth.EmailAlreadyExistsError:
            return jsonify({'error': 'Email already exists'}), 400
        except Exception as e:
            print(f"Firebase registration error: {str(e)}")
            return jsonify({'error': 'Registration failed'}), 500
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/login', methods=['POST'])
def login():
    """Login user - verify Firebase token and return user data from MongoDB"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        id_token = data.get('idToken')
        
        if not id_token:
            return jsonify({'error': 'ID token is required'}), 400
        
        # Verify Firebase token
        decoded_token = verify_firebase_token(id_token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', email.split('@')[0])
        
        # Get or create user in MongoDB
        mongo_user = get_or_create_user(firebase_uid, email, name)
        
        # Return user data
        user_response = {
            'id': str(mongo_user['_id']),
            'firebase_uid': firebase_uid,
            'email': email,
            'name': mongo_user.get('name', name),
            'age': mongo_user.get('age'),
            'weight': mongo_user.get('weight'),
            'height': mongo_user.get('height'),
            'activity_level': mongo_user.get('activity_level'),
            'dietary_goals': mongo_user.get('dietary_goals'),
            'gender': mongo_user.get('gender')
        }
        
        return jsonify({
            'message': 'Login successful',
            'user': user_response
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify Firebase token"""
    try:
        data = request.get_json()
        id_token = data.get('idToken')
        
        if not id_token:
            return jsonify({'error': 'ID token is required'}), 400
        
        decoded_token = verify_firebase_token(id_token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid token'}), 401
        
        firebase_uid = decoded_token['uid']
        
        # Get user from MongoDB
        users_collection = get_users_collection()
        mongo_user = users_collection.find_one({'firebase_uid': firebase_uid})
        
        if not mongo_user:
            return jsonify({'error': 'User not found'}), 404
        
        user_response = {
            'id': str(mongo_user['_id']),
            'firebase_uid': firebase_uid,
            'email': decoded_token.get('email'),
            'name': mongo_user.get('name')
        }
        
        return jsonify({
            'message': 'Token is valid',
            'user': user_response
        }), 200
        
    except Exception as e:
        print(f"Verify token error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get user profile from MongoDB"""
    try:
        user = request.current_user

        user_response = {
            'id': str(user['_id']),
            'firebase_uid': request.firebase_uid,
            'email': user.get('email'),
            'name': user.get('name'),
            'age': user.get('age'),
            'weight': user.get('weight'),
            'height': user.get('height'),
            'activity_level': user.get('activity_level'),
            'dietary_goals': user.get('dietary_goals'),
            'gender': user.get('gender')
        }

        return jsonify({'user': user_response}), 200

    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile in MongoDB"""
    try:
        # Get update data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Allowed fields to update
        allowed_fields = ['name', 'age', 'weight', 'height', 'activity_level', 'dietary_goals', 'gender']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        update_data['updated_at'] = datetime.utcnow()

        # Update in MongoDB
        users_collection = get_users_collection()
        result = users_collection.update_one(
            {'firebase_uid': request.firebase_uid},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404

        # Get updated user
        user = users_collection.find_one({'firebase_uid': request.firebase_uid})

        user_response = {
            'id': str(user['_id']),
            'firebase_uid': request.firebase_uid,
            'email': user.get('email'),
            'name': user.get('name'),
            'age': user.get('age'),
            'weight': user.get('weight'),
            'height': user.get('height'),
            'activity_level': user.get('activity_level'),
            'dietary_goals': user.get('dietary_goals'),
            'gender': user.get('gender')
        }

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_response
        }), 200

    except Exception as e:
        print(f"Update profile error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/calculator-data', methods=['POST'])
@require_auth
def save_calculator_data():
    """Save calculator data to MongoDB"""
    try:
        # Get calculator data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Save to MongoDB
        calculator_collection = get_calculator_data_collection()
        calculator_data = {
            'firebase_uid': request.firebase_uid,
            'data': data,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # Update or insert
        result = calculator_collection.update_one(
            {'firebase_uid': request.firebase_uid},
            {'$set': calculator_data},
            upsert=True
        )

        return jsonify({
            'message': 'Calculator data saved successfully',
            'id': str(result.upserted_id) if result.upserted_id else None
        }), 200

    except Exception as e:
        print(f"Save calculator data error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@firebase_mongo_auth_bp.route('/calculator-data', methods=['GET'])
@require_auth
def get_calculator_data():
    """Get calculator data from MongoDB"""
    try:
        # Get from MongoDB
        calculator_collection = get_calculator_data_collection()
        calculator_data = calculator_collection.find_one({'firebase_uid': request.firebase_uid})

        if not calculator_data:
            return jsonify({'data': None}), 200

        return jsonify({
            'data': calculator_data.get('data')
        }), 200

    except Exception as e:
        print(f"Get calculator data error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
