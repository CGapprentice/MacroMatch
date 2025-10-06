#!/usr/bin/env python3
"""
MacroMatch Backend Startup Script
Simple script to run the Flask application with proper configuration
"""

import os
import sys
from app import create_app

def main():
    """
    Main function to start the MacroMatch backend server
    """
    # Set default environment if not already set
    if 'FLASK_ENV' not in os.environ:
        os.environ['FLASK_ENV'] = 'development'
    
    # Get configuration from environment
    config_name = os.environ.get('FLASK_ENV', 'development')
    
    # Create the Flask application
    app = create_app(config_name)
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Get host from environment or use default
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting MacroMatch Backend...")
    print(f"Environment: {config_name}")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Debug Mode: {app.config.get('DEBUG', False)}")
    print("-" * 50)
    
    try:
        # Run the application
        app.run(
            host=host,
            port=port,
            debug=app.config.get('DEBUG', False)
        )
    except KeyboardInterrupt:
        print("\nShutting down MacroMatch Backend...")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
