from flask import Response
from flask_restful import Resource
from models import User
from views import get_authorized_user_ids
import json


class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # suggestions should be any user with an ID that's not in this list:
        # print(get_authorized_user_ids(self.current_user))
        user_ids = get_authorized_user_ids(self.current_user)
        suggestions = User.query.filter(User.id.notin_(user_ids)).limit(7).all()

        return Response(json.dumps([u.to_dict() for u in suggestions]), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint,
        '/api/suggestions',
        '/api/suggestions/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
