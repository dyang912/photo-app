from flask import Response, request
from flask_restful import Resource
from models import LikePost, db, Post
from views import get_authorized_user_ids
import json


class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def post(self):
        # create a new "like_post" based on the data posted in the body 
        body = request.get_json()
        if not body.get('post_id'):
            return Response(json.dumps({"message": "empty post id"}), mimetype="application/json", status=400)

        try:
            pid = int(body.get('post_id'))
        except ValueError:
            return Response(json.dumps({"message": "invalid parameter"}), mimetype="application/json", status=400)

        post = Post.query.get(pid)
        if not post:
            return Response(json.dumps({"message": "post not found"}), mimetype="application/json", status=404)

        user_ids = get_authorized_user_ids(self.current_user)
        if post.user_id not in user_ids:
            return Response(json.dumps({"message": "unauthorized action"}), mimetype="application/json", status=404)

        likePosts = LikePost.query.filter_by(user_id=self.current_user.id, post_id=pid).all()
        if len(likePosts) > 0:
            return Response(json.dumps({"message": "duplicated likePosts"}), mimetype="application/json", status=400)

        new_likePost = LikePost(
            post_id=pid,
            user_id=self.current_user.id,
        )
        db.session.add(new_likePost)
        db.session.commit()

        return Response(json.dumps(new_likePost.to_dict()), mimetype="application/json", status=201)


class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, id):
        # delete "like_post" where "id"=id
        likePost = LikePost.query.get(id)
        if not likePost:
            return Response(json.dumps({"message": "likePost not exist"}), mimetype="application/json", status=404)

        if likePost.user_id != self.current_user.id:
            return Response(json.dumps({"message": "unauthorized action"}), mimetype="application/json", status=404)

        LikePost.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message": "unlike success"}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint,
        '/api/posts/likes',
        '/api/posts/likes/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint,
        '/api/posts/likes/<int:id>',
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
