# MongoDB configuration and connection
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
            self._client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            
            # Test connection
            self._client.admin.command('ping')
            
            db_name = os.environ.get('MONGODB_DB_NAME', 'macromatch')
            self._db = self._client[db_name]
            
            print(f"MongoDB connected to {db_name}! :)")
            
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {str(e)}")
            raise
    
    def get_db(self):
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        return self.get_db()[collection_name]
    
    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            print("MongoDB connection closed")

def get_mongodb():
    """Get MongoDB instance"""
    return MongoDB()

def get_users_collection():
    """Get users collection"""
    return get_mongodb().get_collection('users')

def get_calculator_data_collection():
    """Get calculator data collection"""
    return get_mongodb().get_collection('calculator_data')

def get_meals_collection():
    """Get meals collection"""
    return get_mongodb().get_collection('meals')

def get_routine_collection():
    """Get routine collection"""
    return get_mongodb().get_collection('routine')
