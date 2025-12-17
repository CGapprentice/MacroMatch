from flask import Blueprint, request, jsonify
from database.mongodb_config import get_progress_collection
from core.auth_middleware import require_auth
from models.models import ProgressRoutine
from bson import ObjectId
from datetime import datetime

progress_bp = Blueprint('progress', __name__, url_prefix='/api/v1/progress')

@progress_bp.route('/', methods=['POST'])
@require_auth
def create_progress():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No routine added'}), 400
        if not data.get('progress'):
            return jsonify({'error' : 'Nothing was sent'})
        
        progress = ProgressRoutine(
            progress = data.get('progress')
        )

        progress_collection = get_progress_collection()
        progress_data = progress.to_dict()
        progress_data['firebase_uid'] = request.firebase_uid
        progress_data['user_id'] = str(request.current_user['_id'])
        
        result = progress_collection.insert_one(progress_data)

        return jsonify({
            'message' : 'Progress Routine Created! :)',
            'progress' : {
                'id' : str(result.inserted_id),
                'progress' : progress.progress,
                'date': progress.created_at.isoformat()
            }
        }), 201
    
    except Exception as error:
        print(f"Create progress routine error: {str(error)}")
        return jsonify({'error' : 'server error'}), 500
    
@progress_bp.route('/', methods=['GET'])
@require_auth
def get_progress():
    try:

        progress_collection = get_progress_collection()
        progress_user = list(progress_collection.find({'firebase_uid': request.firebase_uid}))

        if not progress_user:
            return jsonify({'error' : 'No progress routine found'}), 404
        
        addProgress=[]
        for progress in progress_user:
            progress['id'] = str(progress['_id'])
            del progress['_id']
            if 'timestamp' in progress and hasattr(progress['timestamp'], 'isoformat'):
                progress['timestamp'] = progress['timestamp'].isoformat()
            addProgress.append(progress)
        return jsonify({'progress' : addProgress}),200
    
    except Exception as error:
        print(f"Progress routine error: {str(error)}")
        return jsonify({'error' : 'server error'}), 500

@progress_bp.route('/<progress_id>', methods=['PUT'])
@require_auth
def update_progress(progress_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error' : 'no data given'}), 400
        
        allowed_field = "progress"
        updated_data={}
        if allowed_field in data:
            updated_data[allowed_field] = data[allowed_field]
        
        if not updated_data:
            return jsonify({'error': 'nothing was updated'}), 400
        
        updated_data['updated_at'] = datetime.utcnow()

        progress_collection = get_progress_collection()
        results = progress_collection.update_one(
            {'_id': ObjectId(progress_id), 'firebase_uid' : request.firebase_uid},
            {'$set' : updated_data}
        )

        if not results:
            return jsonify({'error' : 'failed to update progress routine'}), 500
        
        update_progress = progress_collection.find_one({'_id':ObjectId(progress_id)})
        if update_progress:
            update_progress['id'] = str(update_progress['_id'])
            del update_progress['_id']
            if 'created_at' in update_progress and hasattr(update_progress['created_at'], 'isoformat'):
                update_progress['created_at'] = update_progress['created_at'].isoformat()
            if 'updated_at' in update_progress and hasattr(update_progress['updated_at'], 'isoformat'):
                update_progress['updated_at'] = update_progress['updated_at'].isoformat()
        
        return jsonify({
            'message' : 'routine updated',
            'progress' : update_progress
        }),200
    
    except Exception as error:
        print(f"Updating progress routine error: {str(error)}")
        return jsonify({'error':'server error'}), 500
    
@progress_bp.route('/<progress_id>', methods=['DELETE'])
@require_auth
def delete_progress(progress_id):
    try:
        progress_collection = get_progress_collection()
        result = progress_collection.delete_one({'_id':ObjectId(progress_id), 'firebase_uid' : request.firebase_uid})

        if result.deleted_count == 0:
            return jsonify({'error' : 'progress routine was not deleted'}), 400
        return jsonify({'message' :  'progress routine was deleted'}), 200
    except Exception as error:
        print(f"Delete progress routine error: {str(error)}")
        return jsonify({'error' : 'server error'}), 500