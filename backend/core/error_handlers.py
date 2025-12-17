# simple error handling for our app :)
from flask import Blueprint, jsonify, current_app
from werkzeug.exceptions import HTTPException

error_bp = Blueprint('errors', __name__)

class APIError(Exception):
    # simple error class
    def __init__(self, message, status_code=400):
        super().__init__()
        self.message = message
        self.status_code = status_code
    
    def to_dict(self):
        return {'error': self.message}

@error_bp.app_errorhandler(APIError)
def handle_api_error(error):
    # handle custom api errors
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(HTTPException)
def handle_http_exception(error):
    # handle http exceptions
    return jsonify({
        'error': error.description,
        'status_code': error.code
    }), error.code

@error_bp.app_errorhandler(Exception)
def handle_generic_error(error):
    # handle any other errors
    return jsonify({'error': 'server error'}), 500
