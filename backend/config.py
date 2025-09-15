"""
Configuration file for MacroMatch backend
Handles environment variables and Firebase configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class with common settings"""
    
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Firebase configuration
    FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID')
    FIREBASE_PRIVATE_KEY_ID = os.environ.get('FIREBASE_PRIVATE_KEY_ID')
    FIREBASE_PRIVATE_KEY = os.environ.get('FIREBASE_PRIVATE_KEY')
    FIREBASE_CLIENT_EMAIL = os.environ.get('FIREBASE_CLIENT_EMAIL')
    FIREBASE_CLIENT_ID = os.environ.get('FIREBASE_CLIENT_ID')
    FIREBASE_AUTH_URI = os.environ.get('FIREBASE_AUTH_URI')
    FIREBASE_TOKEN_URI = os.environ.get('FIREBASE_TOKEN_URI')
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # CORS configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # API configuration
    API_PREFIX = '/api/v1'
    
    # Nutrition API configuration (for food database)
    NUTRITION_API_KEY = os.environ.get('NUTRITION_API_KEY')
    NUTRITION_API_URL = 'https://api.edamam.com/api/nutrition-data'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
