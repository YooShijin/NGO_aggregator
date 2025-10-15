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
            },
            {
                'name': 'CRY - Child Rights and You',
                'darpan_id': 'MH/1979/0054321',
                'registration_no': '42540 OF 2002',
                'mission': 'Ensuring happier childhoods for underprivileged children in India',
                'description': 'CRY works to ensure happier childhoods for underprivileged children in India through education, healthcare, nutrition and protection from exploitation.',
                'website': 'https://www.cry.org',
                'email': 'info@cry.org',
                'phone': '+91-22-23632712',
                'address': 'Mumbai, Maharashtra',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'district': 'Mumbai',
                'latitude': 19.0760,
                'longitude': 72.8777,
                'founded_year': 1979,
                'registered_with': 'Registrar of Companies',
                'registration_date': datetime(1979, 4, 1),
                'act_name': 'Societies Registration Act',
                'type_of_ngo': 'Society',
                'verified': True,
                'transparency_score': 92,
                'categories': ['Child Welfare', 'Education', 'Health'],
                'office_bearers': [
                    {'name': 'Puja Marwaha', 'designation': 'CEO'},
                    {'name': 'Rippan Kapur', 'designation': 'Founder'}
                ]
            },
            {
                'name': 'Pratham Education Foundation',
                'darpan_id': 'MH/1995/0012678',
                'registration_no': 'F-10054 OF 1979',
                'mission': 'Improving quality of education for underprivileged children',
                'description': 'Pratham is one of India\'s largest NGOs working to provide quality education to children from low-income families.',
                'website': 'https://www.pratham.org',
                'email': 'info@pratham.org',
                'phone': '+91-22-40201700',
                'address': 'Mumbai, Maharashtra',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'district': 'Mumbai',
                'latitude': 19.0760,
                'longitude': 72.8777,
                'founded_year': 1995,
                'registered_with': 'Public Trust',
                'registration_date': datetime(1995, 1, 1),
                'act_name': 'Public Trust Act',
                'type_of_ngo': 'Public Trust',
                'verified': True,
                'transparency_score': 90,
                'categories': ['Education'],
                'office_bearers': [
                    {'name': 'Rukmini Banerji', 'designation': 'CEO'}
                ]
            },
            {
                'name': 'Smile Foundation',
                'darpan_id': 'DL/2002/0023456',
                'registration_no': 'S/10054 OF 1979',
                'mission': 'Working for education, healthcare, and livelihood of underprivileged',
                'description': 'Smile Foundation works for underprivileged children and families through education, healthcare, and livelihood programs.',
                'website': 'https://www.smilefoundationindia.org',
                'email': 'info@smilefoundationindia.org',
                'phone': '+91-11-43123700',
                'address': 'New Delhi',
                'city': 'New Delhi',
                'state': 'Delhi',
                'district': 'South Delhi',
                'latitude': 28.6139,
                'longitude': 77.2090,
                'founded_year': 2002,
                'registered_with': 'Societies Registration',
                'registration_date': datetime(2002, 6, 1),
                'act_name': 'Societies Act',
                'type_of_ngo': 'Society',
                'verified': True,
                'transparency_score': 88,
                'categories': ['Child Welfare', 'Health', 'Education'],
                'office_bearers': [
                    {'name': 'Santanu Mishra', 'designation': 'Co-Founder & Executive Trustee'}
                ]
            },
            {
                'name': 'Goonj',
                'darpan_id': 'DL/1999/0034567',
                'registration_no': 'DL/2003/0006120',
                'mission': 'Making clothing a tool for development and disaster relief',
                'description': 'Goonj works on disaster relief, humanitarian aid and community development in India using clothing as a medium.',
                'website': 'https://www.goonj.org',
                'email': 'goonj@goonj.org',
                'phone': '+91-11-26972351',
                'address': 'New Delhi',
                'city': 'New Delhi',
                'state': 'Delhi',
                'district': 'South Delhi',
                'latitude': 28.5355,
                'longitude': 77.3910,
                'founded_year': 1999,
                'registered_with': 'Societies Registration',
                'registration_date': datetime(1999, 1, 1),
                'act_name': 'Societies Registration Act',
                'type_of_ngo': 'Society',
                'verified': True,
                'transparency_score': 91,
                'categories': ['Social Welfare', 'Disaster Relief'],
                'office_bearers': [
                    {'name': 'Anshu Gupta', 'designation': 'Founder'},
                    {'name': 'Meenakshi Gupta', 'designation': 'Co-Founder'}
                ]
            },
            {
                'name': 'HelpAge India',
                'darpan_id': 'DL/1978/0045678',
                'registration_no': 'S-16496',
                'mission': 'Working for the cause and care of disadvantaged elderly',
                'description': 'HelpAge India is a leading NGO in India working for the cause and care of disadvantaged older persons.',
                'website': 'https://www.helpageindia.org',
                'email': 'info@helpageindia.org',
                'phone': '+91-11-41688955',
                'address': 'New Delhi',
                'city': 'New Delhi',
                'state': 'Delhi',
                'district': 'Central Delhi',
                'latitude': 28.6139,
                'longitude': 77.2090,
                'founded_year': 1978,
                'registered_with': 'Societies Registration',
                'registration_date': datetime(1978, 1, 1),
                'act_name': 'Societies Registration Act',
                'type_of_ngo': 'Society',
                'verified': True,
                'transparency_score': 87,
                'categories': ['Elderly Care', 'Health'],
                'office_bearers': [
                    {'name': 'Rohit Prasad', 'designation': 'CEO'}
                ]
            },
            {
                'name': 'Nanhi Kali',
                'darpan_id': 'MH/2007/0056789',
                'registration_no': 'E-22416',
                'mission': 'Supporting education of underprivileged girls',
                'description': 'Nanhi Kali is dedicated to providing primary education to underprivileged girls in India.',
                'website': 'https://www.nanhikali.org',
                'email': 'info@nanhikali.org',
                'phone': '+91-22-62427100',
                'address': 'Mumbai, Maharashtra',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'district': 'Mumbai',
                'latitude': 19.0760,
                'longitude': 72.8777,
                'founded_year': 2007,
                'registered_with': 'Public Trust',
                'registration_date': datetime(2007, 3, 8),
                'act_name': 'Public Trust Act',
                'type_of_ngo': 'Public Trust',
                'verified': True,
                'transparency_score': 89,
                'categories': ['Education', 'Women Empowerment'],
                'office_bearers': [
                    {'name': 'Anant Goenka', 'designation': 'Trustee'}
                ]
            },
            {
                'name': 'Give India Foundation',
                'darpan_id': 'MH/2000/0067890',
                'registration_no': 'E-45678',
                'mission': 'Connecting donors with verified NGOs',
                'description': 'GiveIndia is an online donation platform connecting donors with verified NGOs in India.',
                'website': 'https://www.giveindia.org',
                'email': 'info@giveindia.org',
                'phone': '+91-80-68723333',
                'address': 'Bengaluru, Karnataka',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'district': 'Bengaluru Urban',
                'latitude': 12.9716,
                'longitude': 77.5946,
                'founded_year': 2000,
                'registered_with': 'Public Trust',
                'registration_date': datetime(2000, 9, 1),
                'act_name': 'Public Trust Act',
                'type_of_ngo': 'Public Trust',
                'verified': True,
                'transparency_score': 93,
                'categories': ['Social Welfare'],
                'office_bearers': [
                    {'name': 'Atul Satija', 'designation': 'CEO'}
                ]
            },
            # Blacklisted NGOs
            {
                'name': 'Akhil Sanskritik Sanathan',
                'darpan_id': 'UP/2009/0003343',
                'registration_no': 'UP/2009/0003343',
                'mission': 'Cultural and social activities',
                'description': 'Organization working on cultural preservation and social welfare.',
                'address': 'Uttar Pradesh',
                'city': 'Lucknow',
                'state': 'Uttar Pradesh',
                'district': 'Lucknow',
                'latitude': 26.8467,
                'longitude': 80.9462,
                'founded_year': 2009,
                'registered_with': 'Societies Registration',
                'registration_date': datetime(2009, 1, 1),
                'type_of_ngo': 'Society',
                'verified': False,
                'blacklisted': True,
                'transparency_score': 30,
                'categories': ['Social Welfare'],
                'blacklist_info': {
                    'blacklisted_by': 'UTTAR PRADESH',
                    'blacklist_date': datetime(2019, 12, 31),
                    'wef_date': datetime(2019, 12, 31),
                    'last_updated': datetime(2019, 12, 31),
                    'reason': 'Non-compliance with regulations'
                }
            },
            {
                'name': 'AVATHAAR CHARITABTE TRUST',
                'darpan_id': 'TN/2017/0173262',
                'registration_no': 'TN/2017/0173262',
                'mission': 'Charitable activities',
                'description': 'Trust working on various charitable initiatives.',
                'address': 'Tamil Nadu',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'district': 'Chennai',
                'latitude': 13.0827,
                'longitude': 80.2707,
                'founded_year': 2017,
                'registered_with': 'Public Trust',
                'registration_date': datetime(2017, 1, 1),
                'type_of_ngo': 'Trust',
                'verified': False,
                'blacklisted': True,
                'transparency_score': 25,
                'categories': ['Social Welfare'],
                'blacklist_info': {
                    'blacklisted_by': 'NATIONAL DIVYANGJAN FINANCE AND DEVELOPMENT CORPORATION',
                    'blacklist_date': datetime(2024, 3, 28),
                    'wef_date': datetime(2024, 3, 28),
                    'last_updated': datetime(2024, 3, 28),
                    'reason': 'Financial irregularities'
                }
            }
        ]
        
        # Create NGOs
        created_ngos = []
        for ngo_data in ngos_data:
            # Extract related data
            cat_names = ngo_data.pop('categories', [])
            bearers_data = ngo_data.pop('office_bearers', [])
            blacklist_data = ngo_data.pop('blacklist_info', None)
            
            # Check if exists
            existing = NGO.query.filter_by(darpan_id=ngo_data.get('darpan_id')).first()
            if existing:
                print(f"Skipping {ngo_data['name']} - already exists")
                continue
            
            # Create NGO
            ngo = NGO(**ngo_data)
            
            # Add categories
            for cat_name in cat_names:
                if cat_name in categories_map:
                    ngo.categories.append(categories_map[cat_name])
            
            db.session.add(ngo)
            db.session.flush()  # Get ID
            
            # Add office bearers
            for bearer_data in bearers_data:
                bearer = OfficeBearer(ngo_id=ngo.id, **bearer_data)
                db.session.add(bearer)
            
            # Add blacklist record if blacklisted
            if blacklist_data:
                blacklist_record = BlacklistRecord(ngo_id=ngo.id, **blacklist_data)
                db.session.add(blacklist_record)
            
            created_ngos.append(ngo)
            print(f"Created NGO: {ngo.name}")
        
        db.session.commit()
        
        # Seed volunteer posts
        volunteer_posts_data = [
            {
                'title': 'Teaching Volunteers Needed',
                'description': 'Help teach underprivileged children basic subjects like English and Math',
                'requirements': 'Good communication skills, patience, passion for teaching',
                'location': 'Mumbai, Maharashtra',
                'deadline': datetime.now() + timedelta(days=30)
            },
            {
                'title': 'Food Distribution Volunteers',
                'description': 'Assist in preparing and distributing meals to children',
                'requirements': 'Physical fitness, team player, weekend availability',
                'location': 'Bengaluru, Karnataka',
                'deadline': datetime.now() + timedelta(days=45)
            },
            {
                'title': 'Healthcare Camp Assistants',
                'description': 'Support medical camps in rural areas',
                'requirements': 'Medical background preferred, empathy, dedication',
                'location': 'Delhi',
                'deadline': datetime.now() + timedelta(days=20)
            },
            {
                'title': 'Elderly Care Volunteers',
                'description': 'Spend time with elderly people, assist with daily activities',
                'requirements': 'Patience, compassion, good listener',
                'location': 'Chennai, Tamil Nadu',
                'deadline': datetime.now() + timedelta(days=60)
            }
        ]
        
        for i, post_data in enumerate(volunteer_posts_data):
            if i < len(created_ngos) and not created_ngos[i].blacklisted:
                post = VolunteerPost(ngo_id=created_ngos[i].id, **post_data)
                db.session.add(post)
                print(f"Created volunteer post: {post_data['title']}")
        
        # Seed events
        events_data = [
            {
                'title': 'Annual Charity Run',
                'description': 'Join our 10K run to raise funds for children\'s education',
                'event_date': datetime.now() + timedelta(days=15),
                'location': 'Mumbai',
                'registration_link': 'https://example.com/register'
            },
            {
                'title': 'Teacher Training Workshop',
                'description': 'Workshop for volunteer teachers on effective teaching methods',
                'event_date': datetime.now() + timedelta(days=25),
                'location': 'Bengaluru',
                'registration_link': 'https://example.com/workshop'
            },
            {
                'title': 'Health Awareness Campaign',
                'description': 'Community health awareness and free checkup camp',
                'event_date': datetime.now() + timedelta(days=10),
                'location': 'Delhi',
                'registration_link': 'https://example.com/health-camp'
            }
        ]
        
        for i, event_data in enumerate(events_data):
            if i < len(created_ngos) and not created_ngos[i].blacklisted:
                event = Event(ngo_id=created_ngos[i].id, **event_data)
                db.session.add(event)
                print(f"Created event: {event_data['title']}")
        
        db.session.commit()
        
        print("\n" + "="*50)
        print("Database seeding completed successfully!")
        print(f"Total NGOs: {len(created_ngos)}")
        print(f"Blacklisted NGOs: {sum(1 for ngo in created_ngos if ngo.blacklisted)}")
        print(f"Volunteer Posts: {len(volunteer_posts_data)}")
        print(f"Events: {len(events_data)}")
        print("="*50)

if __name__ == '__main__':
    seed_database()