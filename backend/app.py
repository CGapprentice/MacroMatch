# macromatch backend app :)
from flask import Flask, jsonify
from flask_cors import CORS
import os
from datetime import datetime

# import our stuff
from config import config
from auth_routes import auth_bp
from meal_routes import meal_bp
from error_handlers import error_bp
from firebase_config import get_firebase_service

def create_app(config_name=None):
    # create our flask app
    app = Flask(__name__)
    
    # load config
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # setup cors for frontend
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # setup firebase
    initialize_firebase(app)
    
    # register our routes
    register_blueprints(app)
    
    # add health check
    add_health_check(app)
    
    return app

def initialize_firebase(app):
    # setup firebase connection
    with app.app_context():
        try:
            firebase_service = get_firebase_service()
            print("firebase connected! :)")
        except Exception as e:
            print(f"firebase error: {str(e)}")
            if app.config.get('DEBUG', False):
                print("continuing without firebase in dev mode")

def register_blueprints(app):
    # register our route blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(meal_bp)
    app.register_blueprint(error_bp)
    print("routes registered! :)")

def add_health_check(app):
    # add basic health check
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'message': 'app is running! :)'
        }), 200
    
    @app.route('/')
    def root():
        # basic api info
        return jsonify({
            'message': 'macromatch api',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'auth': '/api/v1/auth',
                'meals': '/api/v1/meals'
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200

# Create the application instance
app = create_app()

# This allows the app to be run directly with: python app.py
if __name__ == '__main__':
    # Get configuration from environment
    config_name = os.environ.get('FLASK_ENV', 'development')
    
    # Run the application
    app.run(
        host='0.0.0.0',  # Allow external connections
        port=int(os.environ.get('PORT', 5000)),  # Use PORT environment variable or default to 5000
        debug=config[config_name].DEBUG
    )