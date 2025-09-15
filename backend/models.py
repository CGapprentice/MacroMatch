"""
Data models for MacroMatch application
Defines the structure and validation for users, meals, and nutrition data
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import re

class User:
    """
    User model for MacroMatch application
    Represents a user account with personal information and dietary preferences
    """
    
    def __init__(self, email: str, name: str, age: int = None, weight: float = None, 
                 height: float = None, activity_level: str = None, 
                 dietary_goals: str = None, **kwargs):
        """
        Initialize a new User instance
        
        Args:
            email (str): User's email address (must be valid email format)
            name (str): User's full name
            age (int, optional): User's age in years
            weight (float, optional): User's weight in kg
            height (float, optional): User's height in cm
            activity_level (str, optional): Activity level (sedentary, light, moderate, active, very_active)
            dietary_goals (str, optional): Dietary goals (weight_loss, weight_gain, maintenance, muscle_gain)
            **kwargs: Additional user attributes
        """
        self.email = email
        self.name = name
        self.age = age
        self.weight = weight
        self.height = height
        self.activity_level = activity_level
        self.dietary_goals = dietary_goals
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # Additional attributes
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def validate(self) -> List[str]:
        """
        Validate user data and return list of validation errors
        
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        # Email validation
        if not self.email or not self._is_valid_email(self.email):
            errors.append("Invalid email address")
        
        # Name validation
        if not self.name or len(self.name.strip()) < 2:
            errors.append("Name must be at least 2 characters long")
        
        # Age validation
        if self.age is not None:
            if not isinstance(self.age, int) or self.age < 1 or self.age > 120:
                errors.append("Age must be between 1 and 120")
        
        # Weight validation
        if self.weight is not None:
            if not isinstance(self.weight, (int, float)) or self.weight <= 0 or self.weight > 500:
                errors.append("Weight must be between 0 and 500 kg")
        
        # Height validation
        if self.height is not None:
            if not isinstance(self.height, (int, float)) or self.height <= 0 or self.height > 300:
                errors.append("Height must be between 0 and 300 cm")
        
        # Activity level validation
        valid_activity_levels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
        if self.activity_level and self.activity_level not in valid_activity_levels:
            errors.append(f"Activity level must be one of: {', '.join(valid_activity_levels)}")
        
        # Dietary goals validation
        valid_goals = ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain']
        if self.dietary_goals and self.dietary_goals not in valid_goals:
            errors.append(f"Dietary goals must be one of: {', '.join(valid_goals)}")
        
        return errors
    
    def _is_valid_email(self, email: str) -> bool:
        """Check if email format is valid"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert user instance to dictionary for database storage
        
        Returns:
            Dict[str, Any]: User data as dictionary
        """
        return {
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'weight': self.weight,
            'height': self.height,
            'activity_level': self.activity_level,
            'dietary_goals': self.dietary_goals,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """
        Create User instance from dictionary data
        
        Args:
            data (Dict[str, Any]): User data dictionary
            
        Returns:
            User: User instance
        """
        return cls(**data)

class NutritionInfo:
    """
    Nutrition information model for individual food items
    Represents macronutrient and micronutrient data
    """
    
    def __init__(self, calories: float = 0, protein: float = 0, carbs: float = 0, 
                 fat: float = 0, fiber: float = 0, sugar: float = 0, 
                 sodium: float = 0, **kwargs):
        """
        Initialize nutrition information
        
        Args:
            calories (float): Calories per serving
            protein (float): Protein in grams
            carbs (float): Carbohydrates in grams
            fat (float): Fat in grams
            fiber (float): Fiber in grams
            sugar (float): Sugar in grams
            sodium (float): Sodium in mg
            **kwargs: Additional nutrition data
        """
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.fiber = fiber
        self.sugar = sugar
        self.sodium = sodium
        
        # Additional nutrition data
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def validate(self) -> List[str]:
        """
        Validate nutrition data
        
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        # Check for negative values
        for attr in ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']:
            value = getattr(self, attr)
            if value is not None and value < 0:
                errors.append(f"{attr} cannot be negative")
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert nutrition info to dictionary
        
        Returns:
            Dict[str, Any]: Nutrition data as dictionary
        """
        return {
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'fiber': self.fiber,
            'sugar': self.sugar,
            'sodium': self.sodium
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'NutritionInfo':
        """
        Create NutritionInfo instance from dictionary
        
        Args:
            data (Dict[str, Any]): Nutrition data dictionary
            
        Returns:
            NutritionInfo: NutritionInfo instance
        """
        return cls(**data)

class FoodItem:
    """
    Food item model representing individual food entries
    Contains food name, serving information, and nutrition data
    """
    
    def __init__(self, name: str, serving_size: float, serving_unit: str, 
                 nutrition: NutritionInfo, **kwargs):
        """
        Initialize food item
        
        Args:
            name (str): Name of the food item
            serving_size (float): Size of the serving
            serving_unit (str): Unit of measurement (g, ml, cup, etc.)
            nutrition (NutritionInfo): Nutrition information for this food
            **kwargs: Additional food item attributes
        """
        self.name = name
        self.serving_size = serving_size
        self.serving_unit = serving_unit
        self.nutrition = nutrition
        
        # Additional attributes
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def validate(self) -> List[str]:
        """
        Validate food item data
        
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        if not self.name or len(self.name.strip()) < 1:
            errors.append("Food name cannot be empty")
        
        if not isinstance(self.serving_size, (int, float)) or self.serving_size <= 0:
            errors.append("Serving size must be a positive number")
        
        if not self.serving_unit or len(self.serving_unit.strip()) < 1:
            errors.append("Serving unit cannot be empty")
        
        # Validate nutrition info
        if self.nutrition:
            errors.extend(self.nutrition.validate())
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert food item to dictionary
        
        Returns:
            Dict[str, Any]: Food item data as dictionary
        """
        return {
            'name': self.name,
            'serving_size': self.serving_size,
            'serving_unit': self.serving_unit,
            'nutrition': self.nutrition.to_dict() if self.nutrition else {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'FoodItem':
        """
        Create FoodItem instance from dictionary
        
        Args:
            data (Dict[str, Any]): Food item data dictionary
            
        Returns:
            FoodItem: FoodItem instance
        """
        nutrition_data = data.get('nutrition', {})
        nutrition = NutritionInfo.from_dict(nutrition_data) if nutrition_data else None
        
        return cls(
            name=data['name'],
            serving_size=data['serving_size'],
            serving_unit=data['serving_unit'],
            nutrition=nutrition
        )

class Meal:
    """
    Meal model representing a complete meal with multiple food items
    Contains meal metadata and list of food items
    """
    
    def __init__(self, name: str, meal_type: str, food_items: List[FoodItem] = None, 
                 timestamp: datetime = None, notes: str = None, **kwargs):
        """
        Initialize meal
        
        Args:
            name (str): Name of the meal
            meal_type (str): Type of meal (breakfast, lunch, dinner, snack)
            food_items (List[FoodItem], optional): List of food items in the meal
            timestamp (datetime, optional): When the meal was consumed
            notes (str, optional): Additional notes about the meal
            **kwargs: Additional meal attributes
        """
        self.name = name
        self.meal_type = meal_type
        self.food_items = food_items or []
        self.timestamp = timestamp or datetime.utcnow()
        self.notes = notes
        
        # Additional attributes
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def add_food_item(self, food_item: FoodItem):
        """
        Add a food item to the meal
        
        Args:
            food_item (FoodItem): Food item to add
        """
        self.food_items.append(food_item)
    
    def remove_food_item(self, index: int):
        """
        Remove a food item from the meal by index
        
        Args:
            index (int): Index of food item to remove
        """
        if 0 <= index < len(self.food_items):
            self.food_items.pop(index)
    
    def get_total_nutrition(self) -> NutritionInfo:
        """
        Calculate total nutrition for the entire meal
        
        Returns:
            NutritionInfo: Total nutrition information
        """
        total_nutrition = NutritionInfo()
        
        for food_item in self.food_items:
            if food_item.nutrition:
                # Add nutrition values (assuming serving_size is already accounted for)
                total_nutrition.calories += food_item.nutrition.calories
                total_nutrition.protein += food_item.nutrition.protein
                total_nutrition.carbs += food_item.nutrition.carbs
                total_nutrition.fat += food_item.nutrition.fat
                total_nutrition.fiber += food_item.nutrition.fiber
                total_nutrition.sugar += food_item.nutrition.sugar
                total_nutrition.sodium += food_item.nutrition.sodium
        
        return total_nutrition
    
    def validate(self) -> List[str]:
        """
        Validate meal data
        
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        if not self.name or len(self.name.strip()) < 1:
            errors.append("Meal name cannot be empty")
        
        valid_meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
        if self.meal_type not in valid_meal_types:
            errors.append(f"Meal type must be one of: {', '.join(valid_meal_types)}")
        
        # Validate each food item
        for i, food_item in enumerate(self.food_items):
            food_errors = food_item.validate()
            for error in food_errors:
                errors.append(f"Food item {i+1}: {error}")
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert meal to dictionary
        
        Returns:
            Dict[str, Any]: Meal data as dictionary
        """
        return {
            'name': self.name,
            'meal_type': self.meal_type,
            'food_items': [item.to_dict() for item in self.food_items],
            'timestamp': self.timestamp,
            'notes': self.notes
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Meal':
        """
        Create Meal instance from dictionary
        
        Args:
            data (Dict[str, Any]): Meal data dictionary
            
        Returns:
            Meal: Meal instance
        """
        food_items_data = data.get('food_items', [])
        food_items = [FoodItem.from_dict(item_data) for item_data in food_items_data]
        
        return cls(
            name=data['name'],
            meal_type=data['meal_type'],
            food_items=food_items,
            timestamp=data.get('timestamp'),
            notes=data.get('notes')
        )
