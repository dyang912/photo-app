from flask import Response, request
from flask_restful import Resource
from models import Post, db, Following
from views import get_authorized_user_ids


import json


def get_path():
    return request.host_url + 'api/posts/'


class PostListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # get posts created by one of these users:
        # print(get_authorized_user_ids(self.current_user))
        args = request.args
        limit = args.get('limit') or 10
        if not isinstance(limit, int) or limit > 50:
            return Response(json.dumps({"message": "invalid parameter"}), mimetype="application/json", status=400)

        user_ids = get_authorized_user_ids(self.current_user)

        posts = Post.query.filter(Post.user_id.in_(user_ids)).limit(limit).all()
        rsp = [post.to_dict() for post in posts]
        return Response(json.dumps(rsp), mimetype="application/json", status=200)

    def post(self):
        # create a new post based on the data posted in the body 
        body = request.get_json()
        print(body)
        return Response(json.dumps({}), mimetype="application/json", status=201)


class PostDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def patch(self, id):
        # update post based on the data posted in the body 
        body = request.get_json()
        print(body)
        return Response(json.dumps({}), mimetype="application/json", status=200)

    def delete(self, id):
        # delete post where "id"=id
        return Response(json.dumps({}), mimetype="application/json", status=200)

    def get(self, id):
        # get the post based on the id
        return Response(json.dumps({}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        PostListEndpoint,
        '/api/posts', '/api/posts/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        PostDetailEndpoint,
        '/api/posts/<int:id>', '/api/posts/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
