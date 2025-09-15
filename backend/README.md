# MacroMatch Backend

A comprehensive nutrition tracking and macro calculation API built with Flask and Firebase.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Meal Tracking**: CRUD operations for meals and food items
- **Nutrition Calculation**: BMR, TDEE, and macro target calculations
- **Nutrition Analysis**: Daily/weekly nutrition summaries and recommendations
- **Firebase Integration**: Scalable NoSQL database with real-time capabilities

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user
- `POST /login` - Authenticate user
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change user password
- `POST /logout` - Logout user
- `POST /verify-token` - Verify JWT token

### Meals (`/api/v1/meals`)
- `POST /` - Create a new meal
- `GET /` - Get user's meal history
- `GET /<meal_id>` - Get specific meal
- `PUT /<meal_id>` - Update meal
- `DELETE /<meal_id>` - Delete meal
- `GET /nutrition/summary` - Get nutrition summary for date range
- `GET /food-items/search` - Search for food items

### Nutrition (`/api/v1/nutrition`)
- `POST /calculate-bmr` - Calculate BMR and TDEE
- `GET /macro-targets` - Get macro targets and progress
- `GET /analysis` - Get nutrition analysis for date range
- `GET /recommendations` - Get personalized nutrition recommendations

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 3. Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Server Configuration
PORT=5000
```

### 4. Run the Application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## Project Structure

```
backend/
├── app.py                 # Main application file
├── config.py             # Configuration settings
├── firebase_config.py    # Firebase service and database operations
├── models.py             # Data models (User, Meal, FoodItem, NutritionInfo)
├── auth_routes.py        # Authentication routes
├── meal_routes.py        # Meal tracking routes
├── nutrition_routes.py   # Nutrition calculation routes
├── error_handlers.py     # Error handling and validation
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Data Models

### User
- Personal information (name, email, age, weight, height)
- Activity level and dietary goals
- Authentication data

### Meal
- Meal metadata (name, type, timestamp, notes)
- List of food items
- Calculated total nutrition

### FoodItem
- Food name and serving information
- Nutrition data (calories, protein, carbs, fat, etc.)

### NutritionInfo
- Macronutrient and micronutrient data
- Validation and calculation methods

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API provides comprehensive error handling with standardized error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "field": "Field name if applicable"
}
```

## Development

### Running in Development Mode

```bash
export FLASK_ENV=development
python app.py
```

### Running in Production

```bash
export FLASK_ENV=production
python app.py
```

## Testing

Health check endpoint: `GET /health`

Returns the status of the application and its dependencies.

## Contributing

1. Follow PEP 8 style guidelines
2. Add comprehensive docstrings to functions and classes
3. Include error handling for all API endpoints
4. Update this README when adding new features

## License

This project is licensed under the MIT License.
