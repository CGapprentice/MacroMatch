# auth routes for our app :)
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models import User
from firebase_config import get_firebase_service

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

def token_required(f):
    # simple token check for protected routes
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'token missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            
            firebase_service = get_firebase_service()
            current_user = firebase_service.get_user(current_user_id)
            
            if not current_user:
                return jsonify({'message': 'user not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'invalid token'}), 401
        except Exception as e:
            return jsonify({'message': 'token validation failed'}), 401
        
        request.current_user = current_user
        request.current_user_id = current_user_id
        
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    # register new user
    try:
        data = request.get_json()
        
        # check required fields
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'need email, password, and name'}), 400
        
        # create user
        user = User(
            email=data['email'].lower().strip(),
            name=data['name'].strip(),
            age=data.get('age'),
            weight=data.get('weight'),
            height=data.get('height')
        )
        
        # validate
        validation_errors = user.validate()
        if validation_errors:
            return jsonify({'error': 'validation failed', 'details': validation_errors}), 400
        
        # check if user exists
        firebase_service = get_firebase_service()
        existing_user = firebase_service.get_user_by_email(user.email)
        if existing_user:
            return jsonify({'error': 'user already exists'}), 409
        
        # hash password and save
        password_hash = generate_password_hash(data['password'])
        user_dict = user.to_dict()
        user_dict['password_hash'] = password_hash
        
        user_id = firebase_service.create_user(user_dict)
        
        # create token
        token = jwt.encode({
            'user_id': user_id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(seconds=3600)  # 1 hour
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'user registered! :)',
            'token': token,
            'user': {
                'id': user_id,
                'email': user.email,
                'name': user.name,
                'age': user.age,
                'weight': user.weight,
                'height': user.height
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    # login user
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'need email and password'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # get user from firebase
        firebase_service = get_firebase_service()
        user = firebase_service.get_user_by_email(email)
        
        if not user:
            return jsonify({'error': 'invalid email or password'}), 401
        
        # check password
        if not check_password_hash(user.get('password_hash', ''), password):
            return jsonify({'error': 'invalid email or password'}), 401
        
        # create token
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(seconds=3600)  # 1 hour
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        # remove password from response
        user_response = {k: v for k, v in user.items() if k != 'password_hash'}
        
        return jsonify({
            'message': 'login successful! :)',
            'token': token,
            'user': user_response
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    # get user profile
    try:
        user_response = {k: v for k, v in request.current_user.items() if k != 'password_hash'}
        return jsonify({'user': user_response}), 200
    except Exception as e:
        return jsonify({'error': 'server error'}), 500
