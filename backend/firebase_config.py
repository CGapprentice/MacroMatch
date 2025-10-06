# firebase setup for our app :)
import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import current_app

class FirebaseService:
    # simple firebase service - just the basics
    def __init__(self):
        self.db = None
        self._setup_firebase()
    
    def _setup_firebase(self):
        # setup firebase connection
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
                self.db = firestore.client()
                print("firebase connected! :)")
            else:
                self.db = firestore.client()
                
        except Exception as e:
            print(f"firebase error: {str(e)}")
            raise e
    
    def get_database(self):
        return self.db
    
    def create_user(self, user_data):
        # add user to firebase
        try:
            doc_ref = self.db.collection('users').add(user_data)
            return doc_ref[1].id
        except Exception as e:
            print(f"error creating user: {str(e)}")
            raise e
    
    def get_user(self, user_id):
        # get user by id
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            if doc.exists:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
        except Exception as e:
            print(f"error getting user: {str(e)}")
            raise e
    
    def get_user_by_email(self, email):
        # find user by email
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('email', '==', email).limit(1)
            docs = query.get()
            if docs:
                doc = docs[0]
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
        except Exception as e:
            print(f"error getting user by email: {str(e)}")
            raise e
    
    def get_user_by_firebase_uid(self, firebase_uid):
        # find user by firebase uid
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('firebase_uid', '==', firebase_uid).limit(1)
            docs = query.get()
            if docs:
                doc = docs[0]
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
        except Exception as e:
            print(f"error getting user by firebase uid: {str(e)}")
            raise e
    
    def update_user(self, user_id, update_data):
        # update user data
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.update(update_data)
            return True
        except Exception as e:
            print(f"error updating user: {str(e)}")
            return False
    
    def add_meal(self, user_id, meal_data):
        # add meal to user's meals
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('meals').add(meal_data)
            return doc_ref[1].id
        except Exception as e:
            print(f"error adding meal: {str(e)}")
            raise e
    
    def get_user_meals(self, user_id, limit=50):
        # get user's meals
        try:
            meals_ref = self.db.collection('users').document(user_id).collection('meals')
            meals = meals_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit).get()
            meal_list = []
            for meal in meals:
                meal_data = meal.to_dict()
                meal_data['id'] = meal.id
                meal_list.append(meal_data)
            return meal_list
        except Exception as e:
            print(f"error getting meals: {str(e)}")
            raise e
    
    def verify_firebase_token(self, id_token):
        # verify firebase id token
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"token verification failed: {str(e)}")
            return None
    
    def get_user_by_firebase_uid(self, firebase_uid):
        # find user by firebase uid
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('firebase_uid', '==', firebase_uid).limit(1)
            docs = query.get()
            if docs:
                doc = docs[0]
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
        except Exception as e:
            print(f"error getting user by firebase uid: {str(e)}")
            raise e

# global firebase service
firebase_service = None

def get_firebase_service():
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseService()
    return firebase_service