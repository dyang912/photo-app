from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json


def get_path():
    return request.host_url + 'api/posts/'


class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # return all of the "following" records that the current user is following
        followings = Following.query.filter_by(user_id=self.current_user.id).all()

        return Response(json.dumps([f.to_dict_following() for f in followings]), mimetype="application/json",
                        status=200)

    def post(self):
        # create a new "following" record based on the data posted in the body 
        body = request.get_json()
        if not body.get('user_id'):
            return Response(json.dumps({"message": "empty user id"}), mimetype="application/json", status=400)

        try:
            uid = int(body.get('user_id'))
        except ValueError:
            return Response(json.dumps({"message": "invalid parameter"}), mimetype="application/json", status=400)

        user = User.query.get(uid)
        if not user:
            return Response(json.dumps({"message": "user not found"}), mimetype="application/json", status=404)

        followings = Following.query.filter_by(user_id=self.current_user.id, following_id=uid).all()
        if len(followings) > 0:
            return Response(json.dumps({"message": "duplicated followings"}), mimetype="application/json", status=400)

        new_following = Following(
            user_id=self.current_user.id,
            following_id=uid,
        )
        db.session.add(new_following)
        db.session.commit()

        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "following" record where "id"=id
        following = Following.query.get(id)
        if not following:
            return Response(json.dumps({"message": "following not exist"}), mimetype="application/json", status=404)

        if following.user_id != self.current_user.id:
            return Response(json.dumps({"message": "unauthorized action"}), mimetype="application/json", status=404)

        Following.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message": "delete success"}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint,
        '/api/following',
        '/api/following/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint,
        '/api/following/<int:id>',
        '/api/following/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
