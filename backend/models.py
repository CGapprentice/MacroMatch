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
    '''
    def __init__(self, name, meal_type, calories=0, notes=""):
        self.name = name
        self.meal_type = meal_type  # breakfast, lunch, dinner, snack
        self.calories = calories
        self.notes = notes
        self.timestamp = datetime.utcnow()
    '''
    def __init__(self, mealType, meal="", calories=0, notes="", date="", time=""):
        self.meal = meal
        self.mealType = mealType
        self.calories = calories
        self.notes = notes
        self.date = date
        self.time = time
        self.created_at = datetime.utcnow()


    def validate(self):
        # basic validation
        '''
        errors = []
        if not self.name or len(self.name.strip()) < 1:
            errors.append("meal needs a name")
        if self.meal_type not in ['breakfast', 'lunch', 'dinner', 'snack']:
            errors.append("meal type should be breakfast, lunch, dinner, or snack")
        return errors
        '''
        
        errors =[]
        if not self.meal or len(self.meal.strip()) < 1:
            errors.append("There should be a name to the meal")
        return errors
        
    
    def to_dict(self):
        # convert to dict for firebase
        '''
        return {
            'name': self.name,
            'meal_type': self.meal_type,
            'calories': self.calories,
            'notes': self.notes,
            'timestamp': self.timestamp
        }
        '''
        return {
            'meal' : self.meal,
            'mealType' : self.mealType,
            'calories' : self.calories,
            'date' : self.date,
            'time' : self.time,
            'notes' : self.notes,
            'created_at': self.created_at
        }


class Routine:
    '''ADD DURATIONUNIT, SPEEDUNIT, DISTANCEUNIT, AND THE REST TO BE ABLE TO ADD THE MINUTES, HOURS, MPH KM/H, AND THE REST '''
    def __init__ (self, activeDay, selected, durationUnit, speedUnit, distanceUnit, highIntensityUnit, lowIntensityUnit, restTimeUnit, duration=None, speed=None, distance=None, highIntensity=None, lowIntensity=None, restTime=None, exercise=[], notes="", exercisePerRound=""):
        self.activeDay = activeDay
        self.selected = selected
        self.duration = duration
        self.durationUnit = durationUnit
        self.speed = speed
        self.speedUnit = speedUnit
        self.distance = distance
        self.distanceUnit = distanceUnit
        self.highIntensity= highIntensity
        self.highIntensityUnit = highIntensityUnit
        self.lowIntensity = lowIntensity
        self.lowIntensityUnit = lowIntensityUnit
        self.restTime = restTime
        self.restTimeUnit = restTimeUnit
        self.exercise = exercise
        self.notes = notes
        self.exercisePerRound = exercisePerRound
        self.created_at = datetime.utcnow()
    
    def validate(self):
        errors=[]
        if self.selected == "Walking" or self.selected == "Running" or self.selected == "Cycling" or self.selected =="Swimming" or self.selected == "Elliptical" or self.selected == "Treadmill":
            if self.duration == None:
                errors.append("Need to add total time")
            if self.duration is not None and self.duration < 1:
                errors.append("Time can't be negative or zero")
            if self.speed == None:
                errors.append("Need to have speed input")
            if self.speed is not None and self.speed < 1:
                errors.append("There can't be a zero speed or negative speed")
            if self.distance == None:
                errors.append("There needs to be a distance input")
            if self.distance is not None and self.distance <= 0:
                errors.append("There can't be zero distance or negative distance")
        if self.selected == "HIIT" or self.selected == "Carido intervals":
            if not self.exercisePerRound or not self.exercisePerRound.strip():
                errors.append("User needs to add exercise for each round")
            if self.duration == None:
                errors.append("User needs to input a total time")
            if self.duration is not None and self.duration <= 0:
                errors.append("User can't input a 0 for total time or negative")
            if self.highIntensity == None:
                errors.append("User needs to add have an input")
            if self.highIntensity is not None and self.highIntensity <= 0:
                errors.append("user can't input a high intensity time of 0 or less")
            if self.lowIntensity == None: 
                errors.append("User needs to add low intensity time")
            if self.lowIntensity is not None and self.lowIntensity <= 0:
                errors.append("User can't input a zero or negative low intensity time")
            if self.restTime == None:
                errors.append("User needs to add rest time")
            if self.restTime is not None and self.restTime <= 0:
                errors.append("User can't input a negative or a 0 for rest time")
        if self.selected == "Strength":
            if not self.exercise:
                errors.append("User can't add this to routine with no exercise added to it")
        if self.selected == "Yoga" or self.selected == "Pilates":
            if self.duration == None:
                errors.append("User needs to add total time for their session")
            if self.duration is not None and self.duration <= 0:
                errors.append("User can't put zero or anything less than zero for their total duration")
            if not self.notes or not self.notes.strip():
                errors.append("User needs to add notes about their session")
        
        return errors
    
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
            'selected': self.selected,
            'duration': self.duration,
            'durationUnit': self.durationUnit,
            'speed': self.speed,
            'speedUnit' : self.speedUnit,
            'distance': self.distance,
            'distanceUnit': self.distanceUnit,
            'highIntensity': self.highIntensity,
            'highIntensityUnit' : self.highIntensityUnit,
            'lowIntensity': self.lowIntensity,
            'lowIntensityUnit': self.lowIntensityUnit,
            'restTime': self.restTime,
            'restTimeUnit': self.restTimeUnit,
            'exercise' : [ex.to_dict() if hasattr(ex,"to_dict") else ex for ex in self.exercise],
            'notes': self.notes,
            'exercisePerRound': self.exercisePerRound,
            'created_at' : self.created_at
        }
        # Add id if present (for MongoDB documents)
        if hasattr(self, '_id') and self._id:
            routine_dict['id'] = str(self._id)
        return routine_dict
    

class UploadPictures:
    def __init__ (self, uploadPicture=None, fileType=None, fileSize=None):
        self.uploadPicture = uploadPicture
        self.fileType = fileType
        self.fileSize = fileSize
        self.created_at = datetime.utcnow()

    '''
    def validate(self):
        errors=[]
        if self.upladPicture == None:
            return("User needs to pick a file");
        return errors
    '''
    def to_dict(self):
        uploadPictures_dict = {
            'UploadPicture' : self.uploadPicture,
            'fileType': self.fileType,
            'fileSize': self.fileSize,
            'created_at' : self.created_at
        }
