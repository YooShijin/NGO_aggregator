"""
Enhanced Database Seeder with More Data
Run this after init_db.py to populate with sample data
"""
from app import create_app
from models import db, NGO, Category, VolunteerPost, Event, OfficeBearer, BlacklistRecord
from datetime import datetime, timedelta
import random

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("Starting enhanced database seeding...")
        
        # Get all categories
        categories_map = {cat.name: cat for cat in Category.query.all()}
         
        