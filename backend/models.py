# basic models for our app :)
from datetime import datetime

class User:
    # simple user model - just the basics for now
    def __init__(self, email, name, age=None, weight=None, height=None):
        self.email = email
        self.name = name
        self.age = age
        self.weight = weight
        self.height = height
        self.created_at = datetime.utcnow()
    
    def validate(self):
        # basic validation - just check if email and name exist
        errors = []
        if not self.email or '@' not in self.email:
            errors.append("need a valid email")
        if not self.name or len(self.name.strip()) < 2:
            errors.append("name needs to be at least 2 characters")
        return errors
    
    def to_dict(self):
        # convert to dict for firebase
        return {
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'weight': self.weight,
            'height': self.height,
            'created_at': self.created_at
        }

class Meal:
    # simple meal model - just name, type, and basic info
    def __init__(self, name, meal_type, calories=0, notes=""):
        self.name = name
        self.meal_type = meal_type  # breakfast, lunch, dinner, snack
        self.calories = calories
        self.notes = notes
        self.timestamp = datetime.utcnow()
    
    def validate(self):
        # basic validation
        errors = []
        if not self.name or len(self.name.strip()) < 1:
            errors.append("meal needs a name")
        if self.meal_type not in ['breakfast', 'lunch', 'dinner', 'snack']:
            errors.append("meal type should be breakfast, lunch, dinner, or snack")
        return errors
    
    def to_dict(self):
        # convert to dict for firebase
        return {
            'name': self.name,
            'meal_type': self.meal_type,
            'calories': self.calories,
            'notes': self.notes,
            'timestamp': self.timestamp
        }
