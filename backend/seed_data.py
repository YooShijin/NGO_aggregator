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
         
        # Enhanced NGO data with coordinates
        ngos_data = [
            {
                'name': 'Akshaya Patra Foundation',
                'darpan_id': 'KA/2000/0012345',
                'registration_no': 'U85300DL2020NPL366426',
                'mission': 'Eliminating classroom hunger by implementing the Mid-Day Meal Scheme',
                'description': 'The Akshaya Patra Foundation is a not-for-profit organisation that implements the Mid-Day Meal Scheme across India, serving nutritious meals to over 1.8 million children daily.',
                'website': 'https://www.akshayapatra.org',
                'email': 'info@akshayapatra.org',
                'phone': '+91-80-30143400',
                'address': 'The Akshaya Patra Foundation, Rajajinagar, Bengaluru',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'district': 'Bengaluru Urban',
                'latitude': 12.9716,
                'longitude': 77.5946,
                'founded_year': 2000,
                'registered_with': 'Registrar of Companies',
                'registration_date': datetime(2000, 6, 13),
                'act_name': 'COMPANIES ACT, 2013',
                'type_of_ngo': 'Section 8 Company',
                'verified': True,
                'transparency_score': 95,
                'categories': ['Education', 'Child Welfare'],
                'office_bearers': [
                    {'name': 'Madhu Pandit Dasa', 'designation': 'Chairman'},
                    {'name': 'Chanchalapathi Dasa', 'designation': 'Vice-Chairman'}
                ]
            },]