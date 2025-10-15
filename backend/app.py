from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from models import (
    db,
    NGO,
    Category,
    User,
    VolunteerPost,
)


# basic flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    return app

app = create_app()


#------------------ AUTH HELPERS --------------------------
def admin_required(f):
    """Decorator for routes that only admins can access."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = _get_token_from_header()

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            data = jwt.decode(
                token,
                app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            current_user = User.query.get(data["user_id"])

            if not current_user or current_user.role != "admin":
                return jsonify({"message": "Admin access required"}), 403

        except Exception:
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def _get_token_from_header():
    """Extract raw JWT token from the Authorization header."""
    token = request.headers.get("Authorization")

    if not token:
        return None

    if token.startswith("Bearer "):
        token = token[7:]

    return token

#---------------VOLUNTEERS ROUTES----------------------
@app.route("/api/volunteer-posts", methods=["GET"])
def get_volunteer_posts():
    active_only = request.args.get("active", "true") == "true"

    query = VolunteerPost.query.join(NGO).filter(NGO.blacklisted.is_(False))

    if active_only:
        query = query.filter(VolunteerPost.active.is_(True))

    posts = query.order_by(VolunteerPost.created_at.desc()).all()

    return jsonify([post.to_dict() for post in posts])


@app.route("/api/volunteer-posts", methods=["POST"])
@admin_required
def create_volunteer_post(current_user):
    data = request.get_json()

    post = VolunteerPost(
        ngo_id=data["ngo_id"],
        title=data["title"],
        description=data.get("description"),
        requirements=data.get("requirements"),
        location=data.get("location"),
        deadline=datetime.fromisoformat(data["deadline"])
        if data.get("deadline")
        else None,
    )

    db.session.add(post)
    db.session.commit()

    return jsonify(post.to_dict()), 201

#--------------- BASIC NGO ROUTES ----------------------

@app.route("/api/ngos", methods=["GET"])
def get_ngos():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", Config.ITEMS_PER_PAGE, type=int)

    category = request.args.get("category")
    state = request.args.get("state")
    city = request.args.get("city")
    district = request.args.get("district")
    verified = request.args.get("verified")
    search = request.args.get("search")
    exclude_blacklisted = request.args.get("exclude_blacklisted", "true") == "true"

    query = NGO.query.filter_by(active=True)

    if exclude_blacklisted:
        query = query.filter_by(blacklisted=False)

    if category:
        query = query.join(NGO.categories).filter(Category.slug == category)

    if state:
        query = query.filter(NGO.state.ilike(f"%{state}%"))

    if city:
        query = query.filter(NGO.city.ilike(f"%{city}%"))

    if district:
        query = query.filter(NGO.district.ilike(f"%{district}%"))

    if verified == "true":
        query = query.filter(NGO.verified.is_(True))

    if search:
        query = query.filter(
            db.or_(
                NGO.name.ilike(f"%{search}%"),
                NGO.mission.ilike(f"%{search}%"),
                NGO.description.ilike(f"%{search}%"),
                NGO.darpan_id.ilike(f"%{search}%"),
            )
        )

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "ngos": [ngo.to_dict() for ngo in pagination.items],
            "total": pagination.total,
            "pages": pagination.pages,
            "current_page": page,
        }
    )

@app.route("/api/ngos/<int:id>", methods=["GET"])
def get_ngo(id):
    ngo = NGO.query.get_or_404(id)
    return jsonify(ngo.to_dict())


@app.route("/api/ngos/<int:id>", methods=["PUT"])
@admin_required
def update_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    data = request.get_json()

    for key, value in data.items():
        if hasattr(ngo, key):
            setattr(ngo, key, value)

    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)

    db.session.commit()
    return jsonify(ngo.to_dict())

@app.route("/api/ngos/<int:id>", methods=["PUT"])
@admin_required
def update_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    data = request.get_json()

    for key, value in data.items():
        if hasattr(ngo, key):
            setattr(ngo, key, value)

    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)

    db.session.commit()
    return jsonify(ngo.to_dict())


@app.route("/api/ngos/<int:id>/verify", methods=["POST"])
@admin_required
def verify_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    ngo.verified = True
    db.session.commit()
    return jsonify({"message": "NGO verified successfully"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)