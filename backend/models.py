from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_post_id = db.Column(db.Integer, db.ForeignKey('volunteer_posts.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_email': self.user.email if self.user else None,
            'volunteer_post_id': self.volunteer_post_id,
            'volunteer_post_title': self.volunteer_post.title if self.volunteer_post else None,
            'ngo_name': self.volunteer_post.ngo.name if self.volunteer_post and self.volunteer_post.ngo else None,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
    

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    volunteer_post_id = db.Column(db.Integer, db.ForeignKey('volunteer_posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'volunteer_post': self.volunteer_post.to_dict() if self.volunteer_post else None,
            'created_at': self.created_at.isoformat()
        }