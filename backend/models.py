# user models for saving data :)
from datetime import datetime

class User:
    # user model for saving profile data
    def __init__(self, firebase_uid, email, name="", age=None, weight=None, height=None, 
                 activity_level=None, dietary_goals=None, gender=None):
        self.firebase_uid = firebase_uid
        self.email = email
        self.name = name
        self.age = age
        self.weight = weight
        self.height = height
        self.activity_level = activity_level  # sedentary, light, moderate, active, very_active
        self.dietary_goals = dietary_goals    # weight_loss, weight_gain, maintenance, muscle_gain
        self.gender = gender
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def validate(self):
        # check if required fields are good
        errors = []
        if not self.firebase_uid:
            errors.append("need firebase uid")
        if not self.email or '@' not in self.email:
            errors.append("need a valid email")
        if self.age and (self.age < 1 or self.age > 120):
            errors.append("age should be between 1 and 120")
        if self.weight and (self.weight <= 0 or self.weight > 500):
            errors.append("weight should be between 0 and 500 kg")
        if self.height and (self.height <= 0 or self.height > 300):
            errors.append("height should be between 0 and 300 cm")
        return errors
    
    def to_dict(self):
        # convert to dict for firebase
        return {
            'firebase_uid': self.firebase_uid,
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'weight': self.weight,
            'height': self.height,
            'activity_level': self.activity_level,
            'dietary_goals': self.dietary_goals,
            'gender': self.gender,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        # create user from firebase data
        return cls(
            firebase_uid=data.get('firebase_uid'),
            email=data.get('email'),
            name=data.get('name', ''),
            age=data.get('age'),
            weight=data.get('weight'),
            height=data.get('height'),
            activity_level=data.get('activity_level'),
            dietary_goals=data.get('dietary_goals'),
            gender=data.get('gender')
        )

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
