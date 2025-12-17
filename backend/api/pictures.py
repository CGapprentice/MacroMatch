from flask import Blueprint, request, jsonify
from database.mongodb_config import get_uploadPicture_collection
from core.auth_middleware import require_auth
from models.models import UploadPictures
from bson import ObjectId
from datetime import datetime

pictures_bp = Blueprint('pictures', __name__, url_prefix='/api/v1/pictures')

# TODO: This function is broken and needs to be fixed.
# @pictures_bp.route('/', methods=['POST'])
# @require_auth
# def create_pictures():
#     try:
#         '''
#             file = request.files['uploadPicture']
#             filepath = f"uploads/{file.filename}"
#             file.save(filepath)
#             pictures = UploadPictures(uploadPicture = filepath)
#         '''
        
#         pictures = request.files['uploadPicture']
#         pictures.save(pictures.filename)
        

#         picture_collection = get_uploadPicture_collection();
#         picture_data = pictures.to_dict();
#         picture_data['firebase_uid'] = request.firebase_uid
#         picture_data['user_id'] = str(request.current_user['_id'])

#         result = picture_collection.insert_one(picture_data)

#         return jsonify({
#             'message' : 'picture has been added',
#             'pictures' : {
#                 'id' : str(result.inserted_id),
#                 'uploadPicture': pictures.uploadPicture,
#                 'fileType' : pictures.fileType,
#                 'fileSize': pictures.fileSize,
#                 'created_at' : pictures.created_at.isoformat()
#             }
#         }), 201
    
#     except Exception as error:
#         print(f"Add pictures error; {str(error)}")
#         return jsonify({'error' : 'servor error'}), 500
    
@pictures_bp.route('/', methods=['GET'])
@require_auth
def get_pictures():
    try:
        picture_collection = get_uploadPicture_collection()
        picture_user = list(picture_collection.find({'firebase_uid' : request.firebase_uid}))

        if not picture_user:
            return jsonify({'error' : 'no pictures found'}), 404
        
        addPicture = []
        for picture in picture_user:
            picture['id'] = str(picture['_id'])
            del picture['_id']
            if 'created_at' in picture and hasattr(picture['created_at'], 'isoformat'):
                picture['created_at'] = picture['created_at'].isoformat()

            addPicture.append(picture)
        return jsonify({'pictures': addPicture}), 200
    except Exception as error:
        print(f"picture error: {str(error)}")
        return jsonify({'error' : 'servor error'}),500
    
@pictures_bp.route('/<picture_id>', methods=['PUT'])
@require_auth
def update_picture(picture_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error' : 'no picture given'}), 400
        
        allowed_files=['uploadPicture']
        update_picture={}

        for field in allowed_files:
            if field in data:
                update_picture[field] = data[field]
        if not update_picture:
             return jsonify({'error' : 'no new pictures'}),400
        
        update_picture['updated_at'] = datetime.utcnow()

        picture_collection = get_uploadPicture_collection();
        result = picture_collection.update_one(
            {'_id' : ObjectId(picture_id), 'firebase_uid' : request.firebase_uid},
            {'$set': update_picture}
        )

        if not result:
            return jsonify({'error' : 'failed to updated picture'}),500
        
        updated_picture = picture_collection.find_one({'_id': ObjectId(picture_id)})
        if updated_picture:
            updated_picture['id'] = str(updated_picture['_id'])
            del updated_picture['_id']
            if 'created_at' in updated_picture and hasattr(updated_picture['created_at'], 'isoformat'):
                updated_picture['created_at'] = updated_picture['created_at'].isoformat()
            if 'updated_at' in updated_picture and hasattr(updated_picture['updated_at'],'isoformat'):
                updated_picture['updated_at'] = updated_picture['updated_at'].isoformat()

        return jsonify({
            'message': 'picture updated',
            'picture': updated_picture
        }),200

    except Exception as error:
        print(f"updated picture error: {str(error)}")
        return jsonify({'error' : 'server error'}), 500
    
@pictures_bp.route('/<picture_id>', methods=['DELETE'])
@require_auth
def delete_picture(picture_id):
    try:
        picture_collection = get_uploadPicture_collection()
        result = picture_collection.delete_one({
            '_id': ObjectId(picture_id),
            'firebase_uid' :request.firebase_uid
        })

        if result.deleted_count == 0:
            return jsonify({'error' : 'picture was not deleted'}),400
        return jsonify({'message' : 'picture was deleted'}), 200
    except Exception as error:
        print(f"delete picture error: {str(error)}")
        return jsonify({'error':'server error'}), 500

