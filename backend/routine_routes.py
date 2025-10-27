from flask import Blueprint, request, jsonify
from mongodb_config import get_routine_collection
from auth_middleware import require_auth
from models import Routine
from bson import ObjectId

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
            showPopup=data.get('showPopup', False),
            activeDay=data['activeDay'],
            selected=data['selected'],
            duration=data.get('duration', ''),
            speed=data.get('speed',''),
            distance=data.get('distance',''),
            highIntensity=data.get('highIntensity', ''),
            lowIntensity=data.get('lowIntensity', ''),
            restTime=data.get('restTime',''),
            exercise=data.get('exercise', []),
            notes=data.get('notes',''),
            exercisePerRound=data.get('exercisePerRound','')
        )
        """
        validation_errors = routine.validate()
        if validation_errors:
            return jsonify({'error' : 'validation failed', 'details':validation_errors}), 400
        """
        routine_collection = get_routine_collection()
        routine_data = routine.to_dict()
        routine_data['firebase_uid'] = request.firebase_uid
        routine_data['user_id'] = str(request.current_user['_id'])

        result = routine_collection.insert_one(routine_data)

        return jsonify({
            'message' : 'routine created',
            'routine' :{
                'id' : str(result.inserted_id),
                'activeDay': routine.activeDay,
                'showPopup': routine.showPopup,
                'selected': routine.selected,
                'duration': routine.duration,
                'speed' : routine.speed,
                'distance' : routine.distance,
                'highIntensity' : routine.highIntensity,
                'lowIntensity' : routine.lowIntensity,
                'restTime' : routine.restTime,
                'exercise' : [ex.to_dict() if hasattr(ex,"to_dict") else ex for ex in routine.exercise],
                'notes' : routine.notes,
                'exercisePerRound' : routine.exercisePerRound 
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
        
        addIdRoutine= []
        for r in routine_user:
            r['id'] = str(r['_id'])
            r.pop('_id', None)
            addIdRoutine.append(r)
        
        return jsonify({'routine': addIdRoutine}), 200
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
        
        allowed_field = ['activeDay','showPopup','selected','duration','speed','distance','highIntensity','lowIntensity','restTime','exercise','notes','exercisePerRound']
        updated_data = {}
        #updated = {key: value for key, value in data.items() if key in allowed_field}

        for field in allowed_field:
            if field in data:
                updated_data[field] = data[field]
        if not updated_data:
            return jsonify({'error' : 'no fields were updated'}),400

        routine_collection = get_routine_collection();
        result = routine_collection.update_one(
            {'_id' : ObjectId(routine_id), 'firebase_uid' : request.firebase_uid},
            {'$set' : updated_data}
        )

        if not result:
            return jsonify({'error' : 'failed to updated routine'}), 500
        
        return jsonify({
            'message' : 'routine updated',
            'updates' : list(updated_data.keys()),
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
