# MacroMatch Backend

Simple nutrition tracking API built with Flask and Firebase :)

## Features

- **User Authentication**: Basic JWT auth with register/login
- **Meal Tracking**: Simple meal CRUD operations
- **Firebase Integration**: Basic database operations

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /profile` - Get user profile

### Meals (`/api/v1/meals`)
- `POST /` - Create a new meal
- `GET /` - Get user's meals
- `DELETE /<meal_id>` - Delete a meal

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Setup Firebase:
   - Create a Firebase project
   - Enable Firestore Database
   - Generate service account key

3. Create `.env` file:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
CORS_ORIGINS=http://localhost:3000
```

4. Run the app:
```bash
python app.py
```

## Project Structure

```
backend/
├── app.py              # main app
├── config.py           # config settings
├── firebase_config.py  # firebase stuff
├── models.py           # user and meal models
├── auth_routes.py      # auth endpoints
├── meal_routes.py      # meal endpoints
├── error_handlers.py   # error handling
├── requirements.txt    # dependencies
└── README.md          # this file
```

## Testing

Run the test script:
```bash
python test_api.py
```

Health check: `GET /health`
