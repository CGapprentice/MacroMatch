"""
MacroMatch Backend Application
A comprehensive nutrition tracking and macro calculation API built with Flask and Firebase
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Import configuration
from config import config

# Import blueprints
from auth_routes import auth_bp
from meal_routes import meal_bp
from nutrition_routes import nutrition_bp
from error_handlers import error_bp

# Import Firebase service
from firebase_config import get_firebase_service

def create_app(config_name=None):
    """
    Application factory pattern for creating Flask app instances
    This allows for different configurations (development, production, testing)
    
    Args:
        config_name (str): Configuration name ('development', 'production', 'testing')
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize CORS (Cross-Origin Resource Sharing)
    # This allows the frontend to make requests to the backend
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Configure logging
    configure_logging(app)
    
    # Initialize Firebase
    initialize_firebase(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Add health check endpoint
    add_health_check(app)
    
    return app

def configure_logging(app):
    """
    Configure application logging
    Sets up logging levels and formats for different environments
    """
    if not app.debug and not app.testing:
        # Production logging
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        file_handler = logging.FileHandler('logs/macromatch.log')
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('MacroMatch backend startup')
    else:
        # Development logging
        app.logger.setLevel(logging.DEBUG)

def initialize_firebase(app):
    """
    Initialize Firebase service with app context
    This ensures Firebase is properly configured before handling requests
    """
    with app.app_context():
        try:
            # Initialize Firebase service
            firebase_service = get_firebase_service()
            app.logger.info("Firebase initialized successfully")
        except Exception as e:
            app.logger.error(f"Failed to initialize Firebase: {str(e)}")
            # In production, you might want to raise this error
            # For development, we'll continue without Firebase
            if app.config.get('DEBUG', False):
                app.logger.warning("Continuing without Firebase in development mode")

def register_blueprints(app):
    """
    Register all application blueprints
    Blueprints organize routes into logical modules
    """
    # Authentication routes
    app.register_blueprint(auth_bp)
    
    # Meal tracking routes
    app.register_blueprint(meal_bp)
    
    # Nutrition calculation routes
    app.register_blueprint(nutrition_bp)
    
    app.logger.info("All blueprints registered successfully")

def register_error_handlers(app):
    """
    Register global error handlers
    These handle errors across all routes
    """
    app.register_blueprint(error_bp)
    app.logger.info("Error handlers registered successfully")

def add_health_check(app):
    """
    Add health check endpoint for monitoring
    This endpoint can be used by load balancers and monitoring systems
    """
    @app.route('/health')
    def health_check():
        """
        Health check endpoint
        Returns the status of the application and its dependencies
        """
        try:
            # Check Firebase connection
            firebase_status = "connected"
            try:
                firebase_service = get_firebase_service()
                # Try to access Firebase (this will fail if not properly configured)
                firebase_service.get_database()
            except Exception as e:
                firebase_status = f"error: {str(e)}"
            
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0.0',
                'services': {
                    'firebase': firebase_status
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e)
            }), 500
    
    @app.route('/')
    def root():
        """
        Root endpoint with API information
        """
        return jsonify({
            'message': 'MacroMatch API',
            'version': '1.0.0',
            'description': 'Nutrition tracking and macro calculation API',
            'endpoints': {
                'health': '/health',
                'auth': '/api/v1/auth',
                'meals': '/api/v1/meals',
                'nutrition': '/api/v1/nutrition'
            },
            'documentation': 'https://github.com/yourusername/macromatch',
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