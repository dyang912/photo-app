import flask_jwt_extended
from flask import Response, request
from flask_restful import Resource
from models import User
import json


def get_path():
    return request.host_url + 'api/profile/'


class ProfileDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def get(self):
        user = User.query.get(self.current_user.id)
        return Response(json.dumps(user.to_dict()), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        ProfileDetailEndpoint,
        '/api/profile',
        '/api/profile/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
