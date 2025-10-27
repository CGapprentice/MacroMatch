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


class SocialPost:
    # social feed post model
    def __init__(self, content, user_name="", image_url=None, likes=None, comments=None):
        self.content = content
        self.user_name = user_name
        self.image_url = image_url  # optional image URL
        self.likes = likes if likes is not None else []  # array of user IDs who liked
        self.comments = comments if comments is not None else []  # array of comment objects
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def validate(self):
        # basic validation for social posts
        errors = []
        if not self.content or len(self.content.strip()) < 1:
            errors.append("post needs content")
        if len(self.content) > 5000:
            errors.append("post content too long (max 5000 chars)")
        return errors

    def to_dict(self):
        # convert to dict for mongodb
        return {
            'content': self.content,
            'user_name': self.user_name,
            'image_url': self.image_url,
            'likes': self.likes,
            'comments': self.comments,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }


class Routine:
    def __init__ (self, activeDay, selected, showPopup=False, duration="", speed="", distance="", highIntensity="", lowIntensity="", restTime="", exercise=[], notes="", exercisePerRound=""):
        self.showPopup = showPopup #check if this is really needed
        self.activeDay = activeDay
        self.selected = selected
        self.duration = duration
        self.speed = speed
        self.distance = distance
        self.highIntensity= highIntensity
        self.lowIntensity = lowIntensity
        self.restTime = restTime
        self.exercise = exercise
        self.notes = notes
        self.exercisePerRound = exercisePerRound
    """"
    def validate(self):
        errors = []
        if not self.duration or len(self.duration.strip()) < 1:
            errors.append("Need to add time")
        if not self.speed or len(self.speed.strip()) < 1:
            errors.append("Need to add speed")
        if not self.distance or len(self.distance.strip()) < 1:
            errors.append("Need to add distance")
        if not self.highIntensity or len(self.highIntensity.strip()) < 1:
            errors.append("Need to add High Intensity time")
        if not self.lowIntensity or len(self.lowIntensity.strip()) < 1:
            errors.append("Need to add Low Intensity time")
        if not self.restTime or len(self.restTime.strip()) < 1:
            errors.append("Need to add rest time")
        if not self.exercise:
            errors.append("There's no exercise added. Please add exercise")
        if not self.notes or len(self.notes.strip()) < 1:
            errors.append("Need to add a note of what you plan to do.")
        if not self.exercisePerRound or len(self.exercisePerRound.strip()) < 1:
            errors.append("Need to add exercises you will do.")
        
        #see if can add sets and reps can't be 0
        return errors
    """
    def to_dict(self):
        routine_dict = {
            'activeDay': self.activeDay,
            'showPopup': self.showPopup,
            'selected': self.selected,
            'duration': self.duration,
            'speed': self.speed,
            'distance': self.distance,
            'highIntensity': self.highIntensity,
            'lowIntensity': self.lowIntensity,
            'restTime': self.restTime,
            'exercise' : [ex.to_dict() if hasattr(ex,"to_dict") else ex for ex in self.exercise],
            'notes': self.notes,
            'exercisePerRound': self.exercisePerRound
        }
        # Add id if present (for MongoDB documents)
        if hasattr(self, '_id') and self._id:
            routine_dict['id'] = str(self._id)
        return routine_dict