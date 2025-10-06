# firebase auth utilities for our app :)
from flask import request, jsonify
from functools import wraps
from firebase_admin import auth
from firebase_config import get_firebase_service

def firebase_token_required(f):
    """Decorator to verify Firebase ID tokens"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'token missing'}), 401
        
        try:
            # Verify Firebase ID token
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
            
            # Get or create user in Firestore
            firebase_service = get_firebase_service()
            user = firebase_service.get_user_by_firebase_uid(firebase_uid)
            
            if not user:
                # Create user record in Firestore if doesn't exist
                user_data = {
                    'firebase_uid': firebase_uid,
                    'email': email,
                    'name': decoded_token.get('name', ''),
                    'created_at': decoded_token.get('auth_time')
                }
                user_id = firebase_service.create_user(user_data)
                user = firebase_service.get_user(user_id)
            
            # Add user info to request context
            request.current_user = user
            request.current_user_id = user['id']
            request.firebase_uid = firebase_uid
            
            return f(*args, **kwargs)
            
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'invalid firebase token'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'firebase token expired'}), 401
        except Exception as e:
            print(f"Token verification error: {str(e)}")
            return jsonify({'error': 'token verification failed'}), 401
    
    return decorated