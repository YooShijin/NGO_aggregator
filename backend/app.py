from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from ai_service import ai_service
from models import (
    db,
    NGO,
    Category,
    User,
    VolunteerPost,
    Event,
    Application,
    BlacklistRecord,
    Bookmark,
    Like,
    NGORequest,
)


# ---------------------- APP FACTORY ---------------------- #

def create_app():
    """Basic Flask app setup with config, DB and CORS."""
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    return app


app = create_app()


# ---------------------- AUTH HELPERS ---------------------- #

def _get_token_from_header():
    """Extract raw JWT token from the Authorization header."""
    token = request.headers.get("Authorization")

    if not token:
        return None

    if token.startswith("Bearer "):
        token = token[7:]

    return token


def token_required(f):
    """Decorator for routes that need a valid logged-in user."""

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

            if not current_user:
                return jsonify({"message": "User not found"}), 401

        except Exception:
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


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


def ngo_required(f):
    """Decorator for routes that only NGO accounts can access."""

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

            if not current_user or current_user.role != "ngo":
                return jsonify({"message": "NGO access required"}), 403

        except Exception:
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


# ---------------------- AUTH ROUTES ---------------------- #

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        email=data["email"],
        name=data.get("name", ""),
        role=data.get("role", "user"),  # user, ngo, admin
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify(
        {
            "token": token,
            "user": user.to_dict(),
        }
    )


@app.route("/api/auth/me", methods=["GET"])
@token_required
def get_current_user(current_user):
    return jsonify(current_user.to_dict())


# ---------------------- USER DASHBOARD & ACTIONS ---------------------- #

@app.route("/api/user/dashboard", methods=["GET"])
@token_required
def user_dashboard(current_user):
    """Summary info for a logged-in normal user."""
    applications = Application.query.filter_by(user_id=current_user.id).all()
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id).all()
    likes = Like.query.filter_by(user_id=current_user.id).all()

    return jsonify(
        {
            "user": current_user.to_dict(),
            "applications": [app.to_dict() for app in applications],
            "bookmarks": [bm.to_dict() for bm in bookmarks],
            "liked_ngos": [like.to_dict() for like in likes],
            "stats": {
                "total_applications": len(applications),
                "pending_applications": len(
                    [a for a in applications if a.status == "pending"]
                ),
                "accepted_applications": len(
                    [a for a in applications if a.status == "accepted"]
                ),
                "bookmarks_count": len(bookmarks),
                "likes_count": len(likes),
            },
        }
    )


@app.route("/api/user/bookmarks", methods=["POST"])
@token_required
def add_bookmark(current_user):
    data = request.get_json()

    existing = Bookmark.query.filter_by(
        user_id=current_user.id,
        volunteer_post_id=data["volunteer_post_id"],
    ).first()

    if existing:
        return jsonify({"message": "Already bookmarked"}), 400

    bookmark = Bookmark(
        user_id=current_user.id,
        volunteer_post_id=data["volunteer_post_id"],
    )

    db.session.add(bookmark)
    db.session.commit()

    return jsonify({"message": "Bookmark added"}), 201


@app.route("/api/user/bookmarks/<int:id>", methods=["DELETE"])
@token_required
def remove_bookmark(current_user, id):
    bookmark = Bookmark.query.filter_by(
        user_id=current_user.id,
        id=id,
    ).first_or_404()

    db.session.delete(bookmark)
    db.session.commit()

    return jsonify({"message": "Bookmark removed"})


@app.route("/api/user/likes", methods=["POST"])
@token_required
def add_like(current_user):
    data = request.get_json()

    existing = Like.query.filter_by(
        user_id=current_user.id,
        ngo_id=data["ngo_id"],
    ).first()

    if existing:
        return jsonify({"message": "Already liked"}), 400

    like = Like(
        user_id=current_user.id,
        ngo_id=data["ngo_id"],
    )

    db.session.add(like)
    db.session.commit()

    return jsonify({"message": "Like added"}), 201


@app.route("/api/user/likes/<int:id>", methods=["DELETE"])
@token_required
def remove_like(current_user, id):
    like = Like.query.filter_by(
        user_id=current_user.id,
        id=id,
    ).first_or_404()

    db.session.delete(like)
    db.session.commit()

    return jsonify({"message": "Like removed"})


# ---------------------- NGO DASHBOARD & ACTIONS ---------------------- #

@app.route("/api/ngo/request", methods=["POST"])
def request_ngo_account():
    """Public endpoint to request an NGO account (goes to admin queue)."""
    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 400

    ngo_request = NGORequest(
        name=data["name"],
        email=data["email"],
        phone=data.get("phone"),
        registration_no=data["registration_no"],
        darpan_id=data.get("darpan_id"),
        address=data.get("address"),
        city=data.get("city"),
        state=data.get("state"),
        mission=data.get("mission"),
        description=data.get("description"),
        website=data.get("website"),
        documents=data.get("documents"),  # JSON field for doc URLs
        status="pending",
    )

    db.session.add(ngo_request)
    db.session.commit()

    return (
        jsonify({"message": "NGO request submitted. Awaiting admin approval."}),
        201,
    )


@app.route("/api/ngo/dashboard", methods=["GET"])
@ngo_required
def ngo_dashboard(current_user):
    """Dashboard summary for an NGO account."""
    ngo = NGO.query.filter_by(user_id=current_user.id).first()

    if not ngo:
        return jsonify({"message": "NGO profile not found"}), 404

    volunteer_posts = VolunteerPost.query.filter_by(ngo_id=ngo.id).all()
    events = Event.query.filter_by(ngo_id=ngo.id).all()

    applications = []
    for post in volunteer_posts:
        applications.extend(post.applications)

    return jsonify(
        {
            "ngo": ngo.to_dict(),
            "volunteer_posts": [vp.to_dict() for vp in volunteer_posts],
            "events": [e.to_dict() for e in events],
            "applications": [app.to_dict() for app in applications],
            "stats": {
                "total_posts": len(volunteer_posts),
                "active_posts": len([vp for vp in volunteer_posts if vp.active]),
                "total_events": len(events),
                "upcoming_events": len(
                    [e for e in events if e.event_date >= datetime.utcnow()]
                ),
                "total_applications": len(applications),
                "pending_applications": len(
                    [a for a in applications if a.status == "pending"]
                ),
            },
        }
    )


@app.route("/api/ngo/volunteer-posts", methods=["POST"])
@ngo_required
def ngo_create_volunteer_post(current_user):
    """Create a volunteer post from NGO dashboard."""
    ngo = NGO.query.filter_by(user_id=current_user.id).first()

    if not ngo:
        return jsonify({"message": "NGO profile not found"}), 404

    data = request.get_json()

    post = VolunteerPost(
        ngo_id=ngo.id,
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


@app.route("/api/ngo/volunteer-posts/<int:id>", methods=["PUT"])
@ngo_required
def ngo_update_volunteer_post(current_user, id):
    """Update NGO’s own volunteer post."""
    ngo = NGO.query.filter_by(user_id=current_user.id).first()
    post = VolunteerPost.query.filter_by(id=id, ngo_id=ngo.id).first_or_404()

    data = request.get_json()

    for key, value in data.items():
        if hasattr(post, key) and key not in ("id", "ngo_id"):
            if key == "deadline" and value:
                setattr(post, key, datetime.fromisoformat(value))
            else:
                setattr(post, key, value)

    db.session.commit()
    return jsonify(post.to_dict())


@app.route("/api/ngo/events", methods=["POST"])
@ngo_required
def ngo_create_event(current_user):
    """Create an event from NGO dashboard."""
    ngo = NGO.query.filter_by(user_id=current_user.id).first()

    if not ngo:
        return jsonify({"message": "NGO profile not found"}), 404

    data = request.get_json()

    event = Event(
        ngo_id=ngo.id,
        title=data["title"],
        description=data.get("description"),
        event_date=datetime.fromisoformat(data["event_date"]),
        location=data.get("location"),
        registration_link=data.get("registration_link"),
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201


@app.route("/api/ngo/applications/<int:id>/status", methods=["PUT"])
@ngo_required
def ngo_update_application_status(current_user, id):
    """Update status of an application for the NGO's own post."""
    ngo = NGO.query.filter_by(user_id=current_user.id).first()
    application = Application.query.get_or_404(id)

    if application.volunteer_post.ngo_id != ngo.id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    application.status = data["status"]

    db.session.commit()
    return jsonify(application.to_dict())


# ---------------------- ADMIN DASHBOARD ---------------------- #

@app.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard(current_user):
    """High-level stats for admin panel."""
    pending_requests = NGORequest.query.filter_by(status="pending").all()

    return jsonify(
        {
            "stats": {
                "total_users": User.query.filter_by(role="user").count(),
                "total_ngos": NGO.query.count(),
                "pending_verifications": len(pending_requests),
                "blacklisted_ngos": NGO.query.filter_by(blacklisted=True).count(),
                "total_applications": Application.query.count(),
                "total_volunteer_posts": VolunteerPost.query.count(),
                "total_events": Event.query.count(),
            },
            "pending_requests": [req.to_dict() for req in pending_requests],
        }
    )


@app.route("/api/admin/ngo-requests", methods=["GET"])
@admin_required
def get_ngo_requests(current_user):
    status = request.args.get("status", "pending")
    requests = NGORequest.query.filter_by(status=status).all()
    return jsonify([req.to_dict() for req in requests])


@app.route("/api/admin/ngo-requests/<int:id>/approve", methods=["POST"])
@admin_required
def approve_ngo_request(current_user, id):
    """Approve NGO registration request and create user + NGO profile."""
    ngo_request = NGORequest.query.get_or_404(id)
    data = request.get_json()

    user = User(
        email=ngo_request.email,
        name=ngo_request.name,
        role="ngo",
    )
    user.set_password(data.get("password", "changeme123"))
    db.session.add(user)
    db.session.flush()  # get user.id

    ngo = NGO(
        user_id=user.id,
        name=ngo_request.name,
        registration_no=ngo_request.registration_no,
        darpan_id=ngo_request.darpan_id,
        email=ngo_request.email,
        phone=ngo_request.phone,
        address=ngo_request.address,
        city=ngo_request.city,
        state=ngo_request.state,
        mission=ngo_request.mission,
        description=ngo_request.description,
        website=ngo_request.website,
        verified=True,
        active=True,
    )

    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)

    db.session.add(ngo)

    ngo_request.status = "approved"

    db.session.commit()

    return jsonify({"message": "NGO request approved", "ngo": ngo.to_dict()})


@app.route("/api/admin/ngo-requests/<int:id>/reject", methods=["POST"])
@admin_required
def reject_ngo_request(current_user, id):
    """Reject NGO registration request with optional reason."""
    ngo_request = NGORequest.query.get_or_404(id)
    data = request.get_json()

    ngo_request.status = "rejected"
    ngo_request.rejection_reason = data.get("reason")

    db.session.commit()

    return jsonify({"message": "NGO request rejected"})


# ---------------------- CHATBOT ROUTE ---------------------- #

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    """AI chatbot that answers platform/NGO related questions."""
    data = request.get_json()
    message = data.get("message", "")

    if not ai_service.client:
        return jsonify(
            {
                "response": "Chatbot is currently unavailable. Please try again later."
            }
        )

    try:
        ngos_count = NGO.query.filter_by(active=True, blacklisted=False).count()
        categories = Category.query.all()

        context = f"""You are a helpful assistant for an NGO aggregator platform.

Platform Info:
- Total active NGOs: {ngos_count}
- Categories: {', '.join([cat.name for cat in categories])}

Answer questions about:
1. Finding NGOs by category or location
2. Volunteer opportunities
3. How to donate or get involved
4. NGO verification process
5. Platform features

Be helpful, concise, and friendly."""

        response = ai_service.client.chat.completions.create(
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": message},
            ],
            model="mixtral-8x7b-32768",
            max_tokens=300,
            temperature=0.7,
        )

        return jsonify(
            {
                "response": response.choices[0].message.content.strip(),
            }
        )

    except Exception:
        return (
            jsonify(
                {
                    "response": "Sorry, I encountered an error. Please try again.",
                }
            ),
            500,
        )


# ---------------------- NGO ROUTES ---------------------- #

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


@app.route("/api/ngos", methods=["POST"])
@token_required
def create_ngo(current_user):
    data = request.get_json()

    ngo = NGO(
        name=data["name"],
        darpan_id=data.get("darpan_id"),
        mission=data.get("mission"),
        description=data.get("description"),
        email=data.get("email"),
        phone=data.get("phone"),
        website=data.get("website"),
        address=data.get("address"),
        city=data.get("city"),
        state=data.get("state"),
        district=data.get("district"),
        registration_no=data.get("registration_no"),
        verified=False,
    )

    # Optional AI-powered helpers
    if ngo.description and ai_service.client:
        ngo.description = ai_service.generate_summary(ngo.description)

    if ngo.mission and ai_service.client:
        suggested_cats = ai_service.suggest_categories(ngo.mission)
        for cat_name in suggested_cats:
            category = Category.query.filter_by(name=cat_name).first()
            if category:
                ngo.categories.append(category)

    ngo.transparency_score = ai_service.calculate_transparency_score(ngo)

    db.session.add(ngo)
    db.session.commit()

    return jsonify(ngo.to_dict()), 201


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


# ---------------------- BLACKLIST ROUTES ---------------------- #

@app.route("/api/blacklisted", methods=["GET"])
def get_blacklisted_ngos():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", Config.ITEMS_PER_PAGE, type=int)

    state = request.args.get("state")
    blacklisted_by = request.args.get("blacklisted_by")
    search = request.args.get("search")

    query = NGO.query.filter_by(blacklisted=True)

    if state:
        query = query.filter(NGO.state.ilike(f"%{state}%"))

    if blacklisted_by:
        query = query.join(NGO.blacklist_info).filter(
            BlacklistRecord.blacklisted_by.ilike(f"%{blacklisted_by}%")
        )

    if search:
        query = query.filter(
            db.or_(
                NGO.name.ilike(f"%{search}%"),
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


@app.route("/api/ngos/<int:id>/blacklist", methods=["POST"])
@admin_required
def blacklist_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    data = request.get_json()

    ngo.blacklisted = True

    record = BlacklistRecord(
        ngo_id=ngo.id,
        blacklisted_by=data.get("blacklisted_by"),
        blacklist_date=datetime.now(),
        wef_date=datetime.now(),
        last_updated=datetime.now(),
        reason=data.get("reason"),
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"message": "NGO blacklisted successfully"})


@app.route("/api/ngos/<int:id>/unblacklist", methods=["POST"])
@admin_required
def unblacklist_ngo(current_user, id):
    ngo = NGO.query.get_or_404(id)
    ngo.blacklisted = False

    if ngo.blacklist_info:
        db.session.delete(ngo.blacklist_info)

    db.session.commit()
    return jsonify({"message": "NGO removed from blacklist"})


# ---------------------- CATEGORY ROUTES ---------------------- #

@app.route("/api/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    return jsonify([cat.to_dict() for cat in categories])


# ---------------------- VOLUNTEER ROUTES ---------------------- #

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


# ---------------------- EVENT ROUTES ---------------------- #

@app.route("/api/events", methods=["GET"])
def get_events():
    upcoming = request.args.get("upcoming", "true") == "true"

    query = Event.query.join(NGO).filter(NGO.blacklisted.is_(False))

    if upcoming:
        query = query.filter(Event.event_date >= datetime.utcnow())

    events = query.order_by(Event.event_date).all()

    return jsonify([event.to_dict() for event in events])


@app.route("/api/events", methods=["POST"])
@admin_required
def create_event(current_user):
    data = request.get_json()

    event = Event(
        ngo_id=data["ngo_id"],
        title=data["title"],
        description=data.get("description"),
        event_date=datetime.fromisoformat(data["event_date"]),
        location=data.get("location"),
        registration_link=data.get("registration_link"),
    )

    db.session.add(event)
    db.session.commit()

    return jsonify(event.to_dict()), 201


# ---------------------- MAP DATA ---------------------- #

@app.route("/api/ngos/map", methods=["GET"])
def get_ngos_map_data():
    """Return NGOs with coordinates for frontend maps."""
    exclude_blacklisted = request.args.get("exclude_blacklisted", "true") == "true"

    query = NGO.query.filter(
        NGO.active.is_(True),
        NGO.latitude.isnot(None),
        NGO.longitude.isnot(None),
    )

    if exclude_blacklisted:
        query = query.filter(NGO.blacklisted.is_(False))

    ngos = query.all()

    map_data = []
    for ngo in ngos:
        map_data.append(
            {
                "id": ngo.id,
                "name": ngo.name,
                "lat": ngo.latitude,
                "lng": ngo.longitude,
                "city": ngo.city,
                "state": ngo.state,
                "verified": ngo.verified,
                "blacklisted": ngo.blacklisted,
                "categories": [cat.name for cat in ngo.categories],
            }
        )

    return jsonify(map_data)


# ---------------------- STATS ROUTES ---------------------- #

@app.route("/api/stats", methods=["GET"])
def get_stats():
    total_ngos = NGO.query.filter_by(active=True, blacklisted=False).count()
    verified_ngos = NGO.query.filter_by(
        active=True,
        verified=True,
        blacklisted=False,
    ).count()
    blacklisted_ngos = NGO.query.filter_by(blacklisted=True).count()

    total_volunteers = (
        VolunteerPost.query.join(NGO)
        .filter(
            VolunteerPost.active.is_(True),
            NGO.blacklisted.is_(False),
        )
        .count()
    )

    upcoming_events = (
        Event.query.join(NGO)
        .filter(
            Event.event_date >= datetime.utcnow(),
            NGO.blacklisted.is_(False),
        )
        .count()
    )

    categories_data = []
    for category in Category.query.all():
        count = len(
            [ngo for ngo in category.ngos if ngo.active and not ngo.blacklisted]
        )
        if count > 0:
            categories_data.append(
                {
                    "name": category.name,
                    "count": count,
                }
            )

    states_data = (
        db.session.query(NGO.state, db.func.count(NGO.id))
        .filter(
            NGO.active.is_(True),
            NGO.blacklisted.is_(False),
            NGO.state.isnot(None),
        )
        .group_by(NGO.state)
        .all()
    )

    return jsonify(
        {
            "total_ngos": total_ngos,
            "verified_ngos": verified_ngos,
            "blacklisted_ngos": blacklisted_ngos,
            "total_volunteers": total_volunteers,
            "upcoming_events": upcoming_events,
            "categories": categories_data,
            "states": [
                {"name": state, "count": count} for state, count in states_data
            ],
        }
    )


# ---------------------- SEARCH ROUTE ---------------------- #

@app.route("/api/search", methods=["GET"])
def search():
    query_text = request.args.get("q", "")

    if not query_text:
        return jsonify({"results": []})

    ngos = (
        NGO.query.filter(
            db.or_(
                NGO.name.ilike(f"%{query_text}%"),
                NGO.mission.ilike(f"%{query_text}%"),
                NGO.description.ilike(f"%{query_text}%"),
                NGO.darpan_id.ilike(f"%{query_text}%"),
            ),
            NGO.active.is_(True),
            NGO.blacklisted.is_(False),
        )
        .limit(10)
        .all()
    )

    return jsonify({"results": [ngo.to_dict() for ngo in ngos]})


# ---------------------- APPLICATION ROUTES ---------------------- #

@app.route("/api/applications", methods=["POST"])
@token_required
def create_application(current_user):
    """User applies for a volunteer position."""
    data = request.get_json()

    existing = Application.query.filter_by(
        user_id=current_user.id,
        volunteer_post_id=data["volunteer_post_id"],
    ).first()

    if existing:
        return (
            jsonify(
                {"message": "You have already applied for this position"},
            ),
            400,
        )

    application = Application(
        user_id=current_user.id,
        volunteer_post_id=data["volunteer_post_id"],
        message=data.get("message", ""),
        status="pending",
    )

    db.session.add(application)
    db.session.commit()

    return jsonify(application.to_dict()), 201


@app.route("/api/applications/<int:id>", methods=["GET"])
@token_required
def get_application(current_user, id):
    """Return details of a specific application."""
    application = Application.query.get_or_404(id)

    if application.user_id != current_user.id and current_user.role != "ngo":
        return jsonify({"message": "Unauthorized"}), 403

    return jsonify(application.to_dict())


@app.route("/api/applications/<int:id>", methods=["DELETE"])
@token_required
def delete_application(current_user, id):
    """User withdraws their own application."""
    application = Application.query.get_or_404(id)

    if application.user_id != current_user.id:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(application)
    db.session.commit()

    return jsonify({"message": "Application withdrawn successfully"})


# ---------------------- ENTRY POINT ---------------------- #

if __name__ == "__main__":
    app.run(debug=True, port=5000)
