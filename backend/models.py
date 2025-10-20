from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Association table for many-to-many relationship
ngo_categories = db.Table('ngo_categories',
    db.Column('ngo_id', db.Integer, db.ForeignKey('ngos.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)


class NGO(db.Model):
    __tablename__ = 'ngos'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Link to user account
    name = db.Column(db.String(255), nullable=False)
    registration_no = db.Column(db.String(100), unique=True)
    darpan_id = db.Column(db.String(100), unique=True)
    mission = db.Column(db.Text)
    description = db.Column(db.Text)
    founded_year = db.Column(db.Integer)
    
    # Contact
    email = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    
    # Location
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    district = db.Column(db.String(100))
    country = db.Column(db.String(100), default='India')
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Registration Details
    registered_with = db.Column(db.String(255))
    registration_date = db.Column(db.Date)
    act_name = db.Column(db.String(255))
    type_of_ngo = db.Column(db.String(100))
    
    # Verification & Status
    verified = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True)
    blacklisted = db.Column(db.Boolean, default=False)
    transparency_score = db.Column(db.Integer, default=0)
    
    # Metadata
    source = db.Column(db.String(100))
    scraped_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='ngo_profile')
    categories = db.relationship('Category', secondary=ngo_categories, backref='ngos')
    volunteer_posts = db.relationship('VolunteerPost', backref='ngo', lazy=True)
    events = db.relationship('Event', backref='ngo', lazy=True)
    office_bearers = db.relationship('OfficeBearer', backref='ngo', lazy=True, cascade='all, delete-orphan')
    blacklist_info = db.relationship('BlacklistRecord', backref='ngo', uselist=False, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='ngo', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'registration_no': self.registration_no,
            'darpan_id': self.darpan_id,
            'mission': self.mission,
            'description': self.description,
            'founded_year': self.founded_year,
            'email': self.email,
            'phone': self.phone,
            'website': self.website,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'district': self.district,
            'country': self.country,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'registered_with': self.registered_with,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'act_name': self.act_name,
            'type_of_ngo': self.type_of_ngo,
            'verified': self.verified,
            'active': self.active,
            'blacklisted': self.blacklisted,
            'transparency_score': self.transparency_score,
            'categories': [cat.to_dict() for cat in self.categories],
            'office_bearers': [ob.to_dict() for ob in self.office_bearers],
            'blacklist_info': self.blacklist_info.to_dict() if self.blacklist_info else None,
            'likes_count': len(self.likes),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    

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

class Like(db.Model):
    __tablename__ = 'likes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ngo': self.ngo.to_dict() if self.ngo else None,
            'created_at': self.created_at.isoformat()
        }
    


class VolunteerPost(db.Model):
    __tablename__ = 'volunteer_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(255))
    deadline = db.Column(db.Date)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='volunteer_post', lazy=True)
    bookmarks = db.relationship('Bookmark', backref='volunteer_post', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.name if self.ngo else None,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'location': self.location,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'active': self.active,
            'created_at': self.created_at.isoformat(),
            'applications_count': len(self.applications),
            'bookmarks_count': len(self.bookmarks)
        }
    
class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('ngos.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255))
    registration_link = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.name if self.ngo else None,
            'title': self.title,
            'description': self.description,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'location': self.location,
            'registration_link': self.registration_link,
            'created_at': self.created_at.isoformat()
        }