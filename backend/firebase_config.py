"""
Firebase configuration and initialization for MacroMatch backend
Handles Firebase Admin SDK setup and database operations
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth
from flask import current_app
import json
import os

class FirebaseService:
    """Firebase service class for handling all Firebase operations"""
    
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """
        Initialize Firebase Admin SDK with service account credentials
        This method sets up the connection to Firebase services
        """
        try:
            # Check if Firebase app is already initialized
            if not firebase_admin._apps:
                # Get Firebase configuration from environment variables
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
                
                # Create credentials object
                cred = credentials.Certificate(firebase_config)
                
                # Initialize Firebase app
                firebase_admin.initialize_app(cred)
                
                # Initialize Firestore database
                self.db = firestore.client()
                
                print("Firebase Admin SDK initialized successfully")
            else:
                # Use existing app
                self.db = firestore.client()
                
        except Exception as e:
            print(f"Error initializing Firebase: {str(e)}")
            raise e
    
    def get_database(self):
        """Get Firestore database instance"""
        return self.db
    
    def create_user(self, user_data):
        """
        Create a new user in Firestore
        Args:
            user_data (dict): User information including email, name, etc.
        Returns:
            str: Document ID of the created user
        """
        try:
            # Add user to Firestore users collection
            doc_ref = self.db.collection('users').add(user_data)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            raise e
    
    def get_user(self, user_id):
        """
        Get user data from Firestore
        Args:
            user_id (str): User document ID
        Returns:
            dict: User data or None if not found
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            return None
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            raise e
    
    def update_user(self, user_id, update_data):
        """
        Update user data in Firestore
        Args:
            user_id (str): User document ID
            update_data (dict): Data to update
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.update(update_data)
            return True
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return False
    
    def delete_user(self, user_id):
        """
        Delete user from Firestore
        Args:
            user_id (str): User document ID
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            doc_ref = self.db.collection('users').document(user_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return False
    
    def get_user_by_email(self, email):
        """
        Get user by email address
        Args:
            email (str): User's email address
        Returns:
            dict: User data or None if not found
        """
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
            print(f"Error getting user by email: {str(e)}")
            raise e
    
    def add_meal(self, user_id, meal_data):
        """
        Add a meal to user's meal history
        Args:
            user_id (str): User document ID
            meal_data (dict): Meal information
        Returns:
            str: Document ID of the created meal
        """
        try:
            # Add meal to user's meals subcollection
            doc_ref = self.db.collection('users').document(user_id).collection('meals').add(meal_data)
            return doc_ref[1].id
        except Exception as e:
            print(f"Error adding meal: {str(e)}")
            raise e
    
    def get_user_meals(self, user_id, limit=50):
        """
        Get user's meal history
        Args:
            user_id (str): User document ID
            limit (int): Maximum number of meals to return
        Returns:
            list: List of meal documents
        """
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
            print(f"Error getting user meals: {str(e)}")
            raise e
    
    def update_meal(self, user_id, meal_id, update_data):
        """
        Update a meal in user's meal history
        Args:
            user_id (str): User document ID
            meal_id (str): Meal document ID
            update_data (dict): Data to update
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('meals').document(meal_id)
            doc_ref.update(update_data)
            return True
        except Exception as e:
            print(f"Error updating meal: {str(e)}")
            return False
    
    def delete_meal(self, user_id, meal_id):
        """
        Delete a meal from user's meal history
        Args:
            user_id (str): User document ID
            meal_id (str): Meal document ID
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            doc_ref = self.db.collection('users').document(user_id).collection('meals').document(meal_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"Error deleting meal: {str(e)}")
            return False

# Global Firebase service instance
firebase_service = None

def get_firebase_service():
    """Get or create Firebase service instance"""
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseService()
    return firebase_service
