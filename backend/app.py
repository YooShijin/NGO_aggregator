from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db

from models import (
    db,
    NGO,
    Category,
)

# basic flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    return app

app = create_app()

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)



