from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, NGO, Category, User, VolunteerPost, Event, Application, BlacklistRecord, Bookmark, Like, NGORequest
from config import Config
from ai_service import ai_service
import jwt
from functools import wraps
from datetime import datetime, timedelta

@app.route('/api/user/dashboard', methods=['GET'])
@token_required
def user_dashboard(current_user):
    # Get user's applications
    applications = Application.query.filter_by(user_id=current_user.id).all()
    
    # Get bookmarked volunteer posts
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id).all()
    
    # Get liked NGOs
    likes = Like.query.filter_by(user_id=current_user.id).all()
    
    return jsonify({
        'user': current_user.to_dict(),
        'applications': [app.to_dict() for app in applications],
        'bookmarks': [bm.to_dict() for bm in bookmarks],
        'liked_ngos': [like.to_dict() for like in likes],
        'stats': {
            'total_applications': len(applications),
            'pending_applications': len([a for a in applications if a.status == 'pending']),
            'accepted_applications': len([a for a in applications if a.status == 'accepted']),
            'bookmarks_count': len(bookmarks),
            'likes_count': len(likes)
        }
    })


@app.route('/api/user/bookmarks', methods=['POST'])
@token_required
def add_bookmark(current_user):
    data = request.get_json()
    
    existing = Bookmark.query.filter_by(
        user_id=current_user.id,
        volunteer_post_id=data['volunteer_post_id']
    ).first()
    
    if existing:
        return jsonify({'message': 'Already bookmarked'}), 400
    
    bookmark = Bookmark(
        user_id=current_user.id,
        volunteer_post_id=data['volunteer_post_id']
    )
    db.session.add(bookmark)
    db.session.commit()
    
    return jsonify({'message': 'Bookmark added'}), 201

@app.route('/api/user/likes', methods=['POST'])
@token_required
def add_like(current_user):
    data = request.get_json()
    
    existing = Like.query.filter_by(
        user_id=current_user.id,
        ngo_id=data['ngo_id']
    ).first()
    
    if existing:
        return jsonify({'message': 'Already liked'}), 400
    
    like = Like(
        user_id=current_user.id,
        ngo_id=data['ngo_id']
    )
    db.session.add(like)
    db.session.commit()
    
    return jsonify({'message': 'Like added'}), 201