from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db

# basic flask app
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)