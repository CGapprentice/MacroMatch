# firebase admin sdk setup for authentication
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app

class FirebaseService:
    """
    Lightweight Firebase service for authentication only.
    User data is stored in MongoDB, not Firestore.
    """
    def __init__(self):
        self._setup_firebase()

    def _setup_firebase(self):
        # initialize firebase admin sdk
        try:
            if not firebase_admin._apps:
                # get firebase config from environment
                firebase_config = {
                    "type": "service_account",
                    "project_id": current_app.config.get('FIREBASE_PROJECT_ID'),
                    "private_key_id": current_app.config.get('FIREBASE_PRIVATE_KEY_ID'),
                    "private_key": current_app.config.get('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                    "client_email": current_app.config.get('FIREBASE_CLIENT_EMAIL'),
                    "client_id": current_app.config.get('FIREBASE_CLIENT_ID'),
                    "auth_uri": current_app.config.get('FIREBASE_AUTH_URI'),
                    "token_uri": current_app.config.get('FIREBASE_TOKEN_URI'),
                }

                cred = credentials.Certificate(firebase_config)
                firebase_admin.initialize_app(cred)
                print("firebase admin sdk initialized! :)")

        except Exception as e:
            print(f"firebase initialization error: {str(e)}")
            raise e

    def verify_token(self, id_token):
        """verify firebase id token and return decoded token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"token verification failed: {str(e)}")
            return None

# global firebase service instance
firebase_service = None

def get_firebase_service():
    """get or create firebase service singleton"""
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseService()
    return firebase_service
