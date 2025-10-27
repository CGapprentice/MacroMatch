# social feed routes for our app :)
from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from models import SocialPost
from mongodb_config import get_social_posts_collection
from auth_middleware import require_auth

social_feed_bp = Blueprint('social_feed', __name__, url_prefix='/api/v1/social')

@social_feed_bp.route('/', methods=['POST'])
@require_auth
def create_post():
    # create new social post
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'no data provided'}), 400

        # check required fields
        if not data.get('content'):
            return jsonify({'error': 'post needs content'}), 400

        # create post
        post = SocialPost(
            content=data['content'].strip(),
            user_name=request.current_user.get('name', 'Anonymous'),
            image_url=data.get('image_url')
        )

        # validate
        validation_errors = post.validate()
        if validation_errors:
            return jsonify({'error': 'validation failed', 'details': validation_errors}), 400

        # save to mongodb
        posts_collection = get_social_posts_collection()
        post_data = post.to_dict()
        post_data['firebase_uid'] = request.firebase_uid
        post_data['user_id'] = str(request.current_user['_id'])
        post_data['user_email'] = request.user_email

        result = posts_collection.insert_one(post_data)

        return jsonify({
            'message': 'post created! :)',
            'post': {
                'id': str(result.inserted_id),
                'content': post.content,
                'user_name': post.user_name,
                'image_url': post.image_url,
                'likes': post.likes,
                'comments': post.comments,
                'created_at': post.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        print(f"create post error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/', methods=['GET'])
@require_auth
def get_posts():
    # get social posts (all users)
    try:
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)

        if limit > 100:
            limit = 100

        posts_collection = get_social_posts_collection()
        posts_cursor = posts_collection.find().sort('created_at', -1).skip(skip).limit(limit)

        posts = []
        for post in posts_cursor:
            post['id'] = str(post['_id'])
            del post['_id']
            if 'created_at' in post and hasattr(post['created_at'], 'isoformat'):
                post['created_at'] = post['created_at'].isoformat()
            if 'updated_at' in post and hasattr(post['updated_at'], 'isoformat'):
                post['updated_at'] = post['updated_at'].isoformat()
            posts.append(post)

        return jsonify({
            'posts': posts,
            'count': len(posts)
        }), 200

    except Exception as e:
        print(f"get posts error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/<post_id>', methods=['GET'])
@require_auth
def get_post(post_id):
    # get specific post
    try:
        posts_collection = get_social_posts_collection()
        post = posts_collection.find_one({'_id': ObjectId(post_id)})

        if not post:
            return jsonify({'error': 'post not found'}), 404

        post['id'] = str(post['_id'])
        del post['_id']
        if 'created_at' in post and hasattr(post['created_at'], 'isoformat'):
            post['created_at'] = post['created_at'].isoformat()
        if 'updated_at' in post and hasattr(post['updated_at'], 'isoformat'):
            post['updated_at'] = post['updated_at'].isoformat()

        return jsonify({'post': post}), 200

    except Exception as e:
        print(f"get post error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/<post_id>', methods=['DELETE'])
@require_auth
def delete_post(post_id):
    # delete a post (only by owner)
    try:
        posts_collection = get_social_posts_collection()

        # verify post exists and belongs to user
        result = posts_collection.delete_one({
            '_id': ObjectId(post_id),
            'firebase_uid': request.firebase_uid
        })

        if result.deleted_count == 0:
            return jsonify({'error': 'post not found or unauthorized'}), 404

        return jsonify({'message': 'post deleted! :)'}), 200

    except Exception as e:
        print(f"delete post error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/<post_id>/like', methods=['POST'])
@require_auth
def toggle_like(post_id):
    # like or unlike a post
    try:
        posts_collection = get_social_posts_collection()
        post = posts_collection.find_one({'_id': ObjectId(post_id)})

        if not post:
            return jsonify({'error': 'post not found'}), 404

        user_id = str(request.current_user['_id'])
        likes = post.get('likes', [])

        # toggle like
        if user_id in likes:
            # unlike
            likes.remove(user_id)
            action = 'unliked'
        else:
            # like
            likes.append(user_id)
            action = 'liked'

        # update post
        posts_collection.update_one(
            {'_id': ObjectId(post_id)},
            {
                '$set': {
                    'likes': likes,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return jsonify({
            'message': f'post {action}! :)',
            'likes_count': len(likes),
            'action': action
        }), 200

    except Exception as e:
        print(f"toggle like error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/<post_id>/comment', methods=['POST'])
@require_auth
def add_comment(post_id):
    # add comment to a post
    try:
        data = request.get_json()

        if not data or not data.get('content'):
            return jsonify({'error': 'comment needs content'}), 400

        posts_collection = get_social_posts_collection()
        post = posts_collection.find_one({'_id': ObjectId(post_id)})

        if not post:
            return jsonify({'error': 'post not found'}), 404

        # create comment object
        comment = {
            'id': str(ObjectId()),
            'user_id': str(request.current_user['_id']),
            'user_name': request.current_user.get('name', 'Anonymous'),
            'content': data['content'].strip(),
            'created_at': datetime.utcnow()
        }

        # add comment to post
        comments = post.get('comments', [])
        comments.append(comment)

        posts_collection.update_one(
            {'_id': ObjectId(post_id)},
            {
                '$set': {
                    'comments': comments,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        # convert datetime to string for response
        comment['created_at'] = comment['created_at'].isoformat()

        return jsonify({
            'message': 'comment added! :)',
            'comment': comment,
            'comments_count': len(comments)
        }), 201

    except Exception as e:
        print(f"add comment error: {str(e)}")
        return jsonify({'error': 'server error'}), 500

@social_feed_bp.route('/user/<firebase_uid>', methods=['GET'])
@require_auth
def get_user_posts(firebase_uid):
    # get posts from specific user
    try:
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)

        if limit > 100:
            limit = 100

        posts_collection = get_social_posts_collection()
        posts_cursor = posts_collection.find(
            {'firebase_uid': firebase_uid}
        ).sort('created_at', -1).skip(skip).limit(limit)

        posts = []
        for post in posts_cursor:
            post['id'] = str(post['_id'])
            del post['_id']
            if 'created_at' in post and hasattr(post['created_at'], 'isoformat'):
                post['created_at'] = post['created_at'].isoformat()
            if 'updated_at' in post and hasattr(post['updated_at'], 'isoformat'):
                post['updated_at'] = post['updated_at'].isoformat()
            posts.append(post)

        return jsonify({
            'posts': posts,
            'count': len(posts)
        }), 200

    except Exception as e:
        print(f"get user posts error: {str(e)}")
        return jsonify({'error': 'server error'}), 500
