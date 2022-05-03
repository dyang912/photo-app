from flask import Response, request
from flask_restful import Resource
from models import Bookmark, Post, db
from views import get_authorized_user_ids
import json


class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # get all bookmarks owned by the current
        bookmarks = Bookmark.query.filter_by(user_id=self.current_user.id).all()

        return Response(json.dumps([bm.to_dict() for bm in bookmarks]), mimetype="application/json", status=200)

    def post(self):
        # create a new "bookmark" based on the data posted in the body 
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

        bookmarks = Bookmark.query.filter_by(user_id=self.current_user.id, post_id=pid).all()
        if len(bookmarks) > 0:
            return Response(json.dumps({"message": "duplicated bookmarks"}), mimetype="application/json", status=400)

        new_bookmark = Bookmark(
            post_id=pid,
            user_id=self.current_user.id,
        )
        db.session.add(new_bookmark)
        db.session.commit()

        return Response(json.dumps(new_bookmark.to_dict()), mimetype="application/json", status=201)


class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def delete(self, id):
        # delete "bookmark" record where "id"=id
        bookmark = Bookmark.query.get(id)
        if not bookmark:
            return Response(json.dumps({"message": "bookmark not exist"}), mimetype="application/json", status=404)

        if bookmark.user_id != self.current_user.id:
            return Response(json.dumps({"message": "unauthorized action"}), mimetype="application/json", status=404)

        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()

        return Response(json.dumps({"message": "delete success"}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint,
        '/api/bookmarks',
        '/api/bookmarks/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint,
        '/api/bookmarks/<int:id>',
        '/api/bookmarks/<int:id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
