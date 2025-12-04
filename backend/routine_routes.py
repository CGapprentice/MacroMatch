from flask import Blueprint, request, jsonify
from mongodb_config import get_routine_collection
from auth_middleware import require_auth
from models import Routine
from bson import ObjectId
from datetime import datetime

routine_bp = Blueprint('routine', __name__, url_prefix='/api/v1/routine')

@routine_bp.route('/', methods=['POST'])
@require_auth
def create_routine():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No routine added'}), 400
        if not data.get('activeDay') or not data.get('selected'):
            return jsonify({'error' : 'Either no day was selected or a workout'}), 400
        
        routine = Routine(
            activeDay=data['activeDay'],
            selected=data['selected'],
            duration=float(data.get('duration')) if data.get('duration') is not None else None,
            durationUnit = data['durationUnit'],
            speed=float(data.get('speed')) if data.get('speed') is not None else None,
            speedUnit=data['speedUnit'],
            distance=float(data.get('distance')) if data.get('distance') is not None else None,
            distanceUnit=data['distanceUnit'],
            highIntensity=float(data.get('highIntensity')) if data.get('highIntensity') is not None else None,
            highIntensityUnit=data['highIntensityUnit'],
            lowIntensity=float(data.get('lowIntensity')) if data.get('lowIntensity') is not None else None,
            lowIntensityUnit=data['lowIntensityUnit'],
            restTime=float(data.get('restTime', None)) if data.get('restTime') is not None else None,
            restTimeUnit=data['restTimeUnit'],
            exercise=data.get('exercise', []),
            notes=data.get('notes',''),
            exercisePerRound=data.get('exercisePerRound','')
        )
        
        validation_errors = routine.validate()
        if validation_errors:
            return jsonify({'error' : 'validation failed', 'details':validation_errors}), 400
                
      
        routine_collection = get_routine_collection()
        routine_data = routine.to_dict()
        routine_data['firebase_uid'] = request.firebase_uid
        routine_data['user_id'] = str(request.current_user['_id'])

        result = routine_collection.insert_one(routine_data)

        return jsonify({
            'message' : 'routine created! :)',
            'routine' :{
                'id' : str(result.inserted_id),
                'activeDay': routine.activeDay,
                'selected': routine.selected,
                'duration': routine.duration,
                'durationUnit': routine.durationUnit,
                'speed' : routine.speed,
                'speedUnit': routine.speedUnit,
                'distance' : routine.distance,
                'distanceUnit': routine.distanceUnit,
                'highIntensity' : routine.highIntensity,
                'highIntensityUnit': routine.highIntensityUnit,
                'lowIntensity' : routine.lowIntensity,
                'lowIntensityUnit': routine.lowIntensityUnit,
                'restTime' : routine.restTime,
                'restTimeUnit' : routine.restTimeUnit,
                'exercise' : [ex.to_dict() if hasattr(ex,"to_dict") else ex for ex in routine.exercise],
                'notes' : routine.notes,
                'exercisePerRound' : routine.exercisePerRound,
                'created_at' : routine.created_at.isoformat()
            }
        }), 201

    except Exception as error:
        print(f"create routine error: {str(error)}")
        return jsonify({'error' : 'servor error'}),500

@routine_bp.route('/', methods=['GET'])
@require_auth
def get_routine():
    try:

        routine_collection = get_routine_collection()
        routine_user = list(routine_collection.find({'firebase_uid' : request.firebase_uid}))

        if not routine_user:
            return jsonify({'error': 'No routine found'}), 404
        
        addRoutine= []
        for routine in routine_user:
            routine['id'] = str(routine['_id'])
            del routine['_id']
            if 'timestamp' in routine and hasattr(routine['timestamp'], 'isoformat'):
                routine['timestamp'] = routine['timestamp'].isoformat()
            addRoutine.append(routine)
        
        return jsonify({'routine': addRoutine}), 200
    except Exception as error:
        print(f"routine error: {str(error)}")
        return jsonify({'error' : 'server error'}), 500
    


#there might be a better way to go about this
@routine_bp.route('/<routine_id>', methods=['PUT'])
@require_auth
def update_routine(routine_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error' : 'no data is given'}), 400
        
        allowed_field = ['activeDay','selected','duration', 'durationUnit','speed', 'speedUnit','distance', 'distanceUnit', 'highIntensity', 'highIntensityUnit', 'lowIntensity', 'lowIntensityUnit', 'restTime', 'restTimeUnit', 'exercise','notes','exercisePerRound']
        updated_data = {}
        #updated = {key: value for key, value in data.items() if key in allowed_field}

        for field in allowed_field:
            if field in data:
                updated_data[field] = data[field]
        if not updated_data:
            return jsonify({'error' : 'no fields were updated'}),400

        updated_data['updated_at'] = datetime.utcnow()

        routine_collection = get_routine_collection();
        result = routine_collection.update_one(
            {'_id' : ObjectId(routine_id), 'firebase_uid' : request.firebase_uid},
            {'$set' : updated_data}
        )

        if not result:
            return jsonify({'error' : 'failed to updated routine'}), 500
        
        update_routine = routine_collection.find_one({'_id' : ObjectId(routine_id)})
        if update_routine:
            update_routine['id'] = str(update_routine['_id'])
            del update_routine['_id']
            if 'created_at' in update_routine and hasattr(update_routine['created_at'], 'isoformat'):
                update_routine['created_at'] = update_routine['created_at'].isoformat()
            if 'updated_at' in update_routine and hasattr(update_routine['updated_at'], 'isoformat'):
                update_routine['updated_at'] = update_routine['updated_at'].isoformat()
        
        return jsonify({
            'message' : 'routine updated',
            'routine' : update_routine
        }),200
   
    
    except Exception as error:
        print(f"updating routine error: {str(error)}")
        return jsonify({'error': 'server error'}), 500


@routine_bp.route('/<routine_id>',methods=['DELETE'])
@require_auth
def delete_routine(routine_id):
    try:
        routine_collection = get_routine_collection()

        result= routine_collection.delete_one({
            '_id': ObjectId(routine_id),
            'firebase_uid':request.firebase_uid
        })

        if result.deleted_count == 0:
            return jsonify({'error':'routine was not deleted'}),400
        return jsonify({'message' : 'routine was deleted'}), 200
    except Exception as error:
        print(f"delete routine error: {str(error)}")
        return jsonify({'error':'server error'}),500
