# authentication middleware for protecting routes
from flask import request, jsonify
from functools import wraps
from firebase_admin import auth
from mongodb_config import get_users_collection
from firebase_config import get_firebase_service

def require_auth(f):
    """
    Decorator to verify Firebase ID tokens and attach user info to request.

    Usage:
        @require_auth
        def protected_route():
            user = request.current_user  # MongoDB user document
            firebase_uid = request.firebase_uid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # get token from authorization header
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'invalid authorization header'}), 401

        try:
            get_firebase_service()

            id_token = auth_header.split('Bearer ')[1]

            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')

            # get user from mongodb
            users_collection = get_users_collection()
            user = users_collection.find_one({'firebase_uid': firebase_uid})

            if not user:
                return jsonify({'error': 'user not found in database'}), 404

            # attach user info to request context
            request.current_user = user
            request.firebase_uid = firebase_uid
            request.user_email = email

            return f(*args, **kwargs)

        except auth.InvalidIdTokenError:
            return jsonify({'error': 'invalid firebase token'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'firebase token expired'}), 401
        except IndexError:
            return jsonify({'error': 'malformed authorization header'}), 401
        except Exception as e:
            print(f"auth middleware error: {str(e)}")
            return jsonify({'error': 'authentication failed'}), 401

    return decorated

def verify_firebase_token(id_token):
    try:
        get_firebase_service()
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"token verification error: {str(e)}")
        return None
