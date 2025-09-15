"""
Error handlers for MacroMatch backend
Provides centralized error handling and custom error responses
"""

from flask import Blueprint, jsonify, current_app
from werkzeug.exceptions import HTTPException
import traceback

# Create error handling blueprint
error_bp = Blueprint('errors', __name__)

class APIError(Exception):
    """Custom API error class for consistent error responses"""
    
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        """Convert error to dictionary for JSON response"""
        rv = {'error': self.message}
        if self.payload:
            rv.update(self.payload)
        return rv

class ValidationError(APIError):
    """Custom validation error class"""
    
    def __init__(self, message, field=None, value=None):
        super().__init__(message, status_code=400)
        self.field = field
        self.value = value
    
    def to_dict(self):
        rv = super().to_dict()
        if self.field:
            rv['field'] = self.field
        if self.value:
            rv['value'] = self.value
        return rv

class AuthenticationError(APIError):
    """Custom authentication error class"""
    
    def __init__(self, message="Authentication failed"):
        super().__init__(message, status_code=401)

class AuthorizationError(APIError):
    """Custom authorization error class"""
    
    def __init__(self, message="Access denied"):
        super().__init__(message, status_code=403)

class NotFoundError(APIError):
    """Custom not found error class"""
    
    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=404)

class ConflictError(APIError):
    """Custom conflict error class"""
    
    def __init__(self, message="Resource conflict"):
        super().__init__(message, status_code=409)

class ServerError(APIError):
    """Custom server error class"""
    
    def __init__(self, message="Internal server error"):
        super().__init__(message, status_code=500)

@error_bp.app_errorhandler(APIError)
def handle_api_error(error):
    """Handle custom API errors"""
    current_app.logger.error(f"API Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors"""
    current_app.logger.warning(f"Validation Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(AuthenticationError)
def handle_auth_error(error):
    """Handle authentication errors"""
    current_app.logger.warning(f"Authentication Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(AuthorizationError)
def handle_authorization_error(error):
    """Handle authorization errors"""
    current_app.logger.warning(f"Authorization Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(NotFoundError)
def handle_not_found_error(error):
    """Handle not found errors"""
    current_app.logger.info(f"Not Found Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(ConflictError)
def handle_conflict_error(error):
    """Handle conflict errors"""
    current_app.logger.warning(f"Conflict Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(ServerError)
def handle_server_error(error):
    """Handle server errors"""
    current_app.logger.error(f"Server Error: {error.message}")
    return jsonify(error.to_dict()), error.status_code

@error_bp.app_errorhandler(HTTPException)
def handle_http_exception(error):
    """Handle HTTP exceptions"""
    current_app.logger.warning(f"HTTP Exception: {error.description}")
    return jsonify({
        'error': error.description,
        'status_code': error.code
    }), error.code

@error_bp.app_errorhandler(ValueError)
def handle_value_error(error):
    """Handle value errors"""
    current_app.logger.warning(f"Value Error: {str(error)}")
    return jsonify({
        'error': 'Invalid value provided',
        'details': str(error)
    }), 400

@error_bp.app_errorhandler(TypeError)
def handle_type_error(error):
    """Handle type errors"""
    current_app.logger.warning(f"Type Error: {str(error)}")
    return jsonify({
        'error': 'Invalid data type',
        'details': str(error)
    }), 400

@error_bp.app_errorhandler(KeyError)
def handle_key_error(error):
    """Handle key errors"""
    current_app.logger.warning(f"Key Error: {str(error)}")
    return jsonify({
        'error': 'Missing required field',
        'details': f'Field "{str(error)}" is required'
    }), 400

@error_bp.app_errorhandler(Exception)
def handle_generic_error(error):
    """Handle generic exceptions"""
    current_app.logger.error(f"Unhandled Exception: {str(error)}")
    current_app.logger.error(f"Traceback: {traceback.format_exc()}")
    
    # In production, don't expose internal error details
    if current_app.config.get('DEBUG', False):
        return jsonify({
            'error': 'Internal server error',
            'details': str(error),
            'traceback': traceback.format_exc()
        }), 500
    else:
        return jsonify({
            'error': 'Internal server error'
        }), 500

def validate_required_fields(data, required_fields):
    """
    Validate that required fields are present in request data
    
    Args:
        data (dict): Request data to validate
        required_fields (list): List of required field names
    
    Raises:
        ValidationError: If any required fields are missing
    """
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            payload={'missing_fields': missing_fields}
        )

def validate_field_types(data, field_types):
    """
    Validate that fields have correct data types
    
    Args:
        data (dict): Request data to validate
        field_types (dict): Dictionary mapping field names to expected types
    
    Raises:
        ValidationError: If any fields have incorrect types
    """
    type_errors = []
    for field, expected_type in field_types.items():
        if field in data and data[field] is not None:
            if not isinstance(data[field], expected_type):
                type_errors.append({
                    'field': field,
                    'expected': expected_type.__name__,
                    'actual': type(data[field]).__name__
                })
    
    if type_errors:
        raise ValidationError(
            "Invalid field types",
            payload={'type_errors': type_errors}
        )

def validate_email_format(email):
    """
    Validate email format using regex
    
    Args:
        email (str): Email address to validate
    
    Returns:
        bool: True if email format is valid
    
    Raises:
        ValidationError: If email format is invalid
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format", field='email', value=email)
    
    return True

def validate_password_strength(password):
    """
    Validate password strength
    
    Args:
        password (str): Password to validate
    
    Raises:
        ValidationError: If password doesn't meet strength requirements
    """
    if len(password) < 6:
        raise ValidationError("Password must be at least 6 characters long", field='password')
    
    if len(password) > 128:
        raise ValidationError("Password must be less than 128 characters long", field='password')
    
    # Check for at least one letter and one number
    has_letter = any(c.isalpha() for c in password)
    has_number = any(c.isdigit() for c in password)
    
    if not has_letter:
        raise ValidationError("Password must contain at least one letter", field='password')
    
    if not has_number:
        raise ValidationError("Password must contain at least one number", field='password')

def validate_numeric_range(value, min_val=None, max_val=None, field_name=None):
    """
    Validate that a numeric value is within specified range
    
    Args:
        value: Value to validate
        min_val: Minimum allowed value
        max_val: Maximum allowed value
        field_name: Name of the field for error messages
    
    Raises:
        ValidationError: If value is outside the allowed range
    """
    if not isinstance(value, (int, float)):
        raise ValidationError(f"{field_name or 'Value'} must be a number", field=field_name, value=value)
    
    if min_val is not None and value < min_val:
        raise ValidationError(f"{field_name or 'Value'} must be at least {min_val}", field=field_name, value=value)
    
    if max_val is not None and value > max_val:
        raise ValidationError(f"{field_name or 'Value'} must be at most {max_val}", field=field_name, value=value)

def validate_enum_value(value, allowed_values, field_name=None):
    """
    Validate that a value is one of the allowed enum values
    
    Args:
        value: Value to validate
        allowed_values: List of allowed values
        field_name: Name of the field for error messages
    
    Raises:
        ValidationError: If value is not in allowed values
    """
    if value not in allowed_values:
        raise ValidationError(
            f"{field_name or 'Value'} must be one of: {', '.join(allowed_values)}",
            field=field_name,
            value=value
        )

def handle_firebase_error(error):
    """
    Handle Firebase-specific errors and convert to appropriate API errors
    
    Args:
        error: Firebase error object
    
    Raises:
        APIError: Appropriate API error based on Firebase error
    """
    error_message = str(error)
    
    if 'permission-denied' in error_message.lower():
        raise AuthorizationError("Access denied to Firebase resource")
    elif 'not-found' in error_message.lower():
        raise NotFoundError("Firebase resource not found")
    elif 'already-exists' in error_message.lower():
        raise ConflictError("Firebase resource already exists")
    elif 'invalid-argument' in error_message.lower():
        raise ValidationError("Invalid Firebase argument")
    elif 'unavailable' in error_message.lower():
        raise ServerError("Firebase service unavailable")
    else:
        raise ServerError(f"Firebase error: {error_message}")

def log_error(error, context=None):
    """
    Log error with context information
    
    Args:
        error: Error object or string
        context (dict): Additional context information
    """
    error_message = str(error)
    
    if context:
        current_app.logger.error(f"Error: {error_message}, Context: {context}")
    else:
        current_app.logger.error(f"Error: {error_message}")
    
    # In development, also log the full traceback
    if current_app.config.get('DEBUG', False):
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")

# Custom error responses for common scenarios
def create_error_response(message, status_code=400, details=None, field=None):
    """
    Create a standardized error response
    
    Args:
        message (str): Error message
        status_code (int): HTTP status code
        details: Additional error details
        field (str): Field name if error is field-specific
    
    Returns:
        tuple: (response_dict, status_code)
    """
    response = {'error': message}
    
    if details:
        response['details'] = details
    
    if field:
        response['field'] = field
    
    return response, status_code

def create_validation_error_response(errors):
    """
    Create a validation error response for multiple errors
    
    Args:
        errors (list): List of validation error messages
    
    Returns:
        tuple: (response_dict, status_code)
    """
    return {
        'error': 'Validation failed',
        'validation_errors': errors
    }, 400
