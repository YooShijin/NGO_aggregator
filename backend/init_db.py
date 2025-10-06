"""
Enhanced Database Initialization Script
Seeds realistic NGO ecosystem data: NGOs, Users, Categories, Office Bearers, Events, Applications, Blacklist info
"""

from app import create_app
from models import db, Category, User, NGO, VolunteerPost, Event, Application, OfficeBearer, BlacklistRecord
from config import Config
from datetime import datetime, timedelta, date
import random

def init_database():
    app = create_app()

    with app.app_context():
        print("Dropping existing tables...")
        db.drop_all()

        print("Creating tables...")
        db.create_all()

        # -----------------------------
        # 1️⃣ Categories
        # -----------------------------
        print("Seeding categories...")
        categories_data = [
            {'name': 'Education', 'slug': 'education', 'icon': '📚', 'description': 'Educational initiatives and literacy programs'},
            {'name': 'Health', 'slug': 'health', 'icon': '🏥', 'description': 'Healthcare and medical assistance'},
            {'name': 'Environment', 'slug': 'environment', 'icon': '🌱', 'description': 'Environmental conservation and sustainability'},
            {'name': 'Child Welfare', 'slug': 'child-welfare', 'icon': '👶', 'description': 'Child rights and welfare programs'},
            {'name': 'Women Empowerment', 'slug': 'women-empowerment', 'icon': '👩', 'description': 'Women rights and empowerment initiatives'},
            {'name': 'Elderly Care', 'slug': 'elderly-care', 'icon': '👴', 'description': 'Support and care for elderly citizens'},
            {'name': 'Animal Welfare', 'slug': 'animal-welfare', 'icon': '🐾', 'description': 'Animal rights and welfare'},
            {'name': 'Disaster Relief', 'slug': 'disaster-relief', 'icon': '🆘', 'description': 'Emergency response and disaster management'},
            {'name': 'Social Welfare', 'slug': 'social-welfare', 'icon': '🤝', 'description': 'General social welfare programs'},
            {'name': 'Poverty Alleviation', 'slug': 'poverty-alleviation', 'icon': '💰', 'description': 'Programs to reduce poverty'}
        ]
        categories = [Category(**c) for c in categories_data]
        db.session.add_all(categories)
        db.session.commit()

        # -----------------------------
        # 2️⃣ Users (5 normal + 1 admin)
        # -----------------------------
        print("Seeding users...")
        users = []
        for i in range(5):
            user = User(
                email=f"user{i+1}@example.com",
                name=f"User {i+1}",
                role="user"
            )
            user.set_password("password123")
            users.append(user)
        admin = User(email=Config.ADMIN_EMAIL, name="Admin", role="admin")
        admin.set_password(Config.ADMIN_PASSWORD)
        users.append(admin)
        db.session.add_all(users)
        db.session.commit()

        # -----------------------------
        # 3️⃣ NGOs
        # -----------------------------
        print("Creating NGOs...")
        ngo_names = [
            "Akshaya Patra Foundation",
            "Smile Foundation",
            "HelpAge India",
            "Pratham Education Foundation",
            "Nanhi Kali",
            "CRY - Child Rights and You",
            "GiveIndia Foundation",
            "Goonj",
            "Teach for India",
            "Green Earth Trust"
        ]
        cities = ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Pune", "Chennai", "Hyderabad", "Jaipur", "Lucknow", "Patna"]
        states = ["Delhi", "Maharashtra", "Karnataka", "West Bengal", "Maharashtra", "Tamil Nadu", "Telangana", "Rajasthan", "Uttar Pradesh", "Bihar"]
        districts = ["New Delhi", "Mumbai Suburban", "Bengaluru Urban", "Kolkata", "Pune", "Chennai", "Hyderabad", "Jaipur", "Lucknow", "Patna"]

        ngos = []
        for i, name in enumerate(ngo_names):
            ngo = NGO(
                name=name,
                registration_no=f"REG-{1000+i}",
                darpan_id=f"BR/{i+1:05d}/2025",
                mission=f"Empowering communities through {categories[i % len(categories)].name.lower()} programs.",
                description=f"{name} focuses on creating measurable social impact across India.",
                founded_year=1995 + random.randint(0, 20),
                website=f"https://www.{name.split()[0].lower()}.org",
                email=f"info@{name.split()[0].lower()}.org",
                phone=f"+91-98{i}45678{i}",
                address=f"{i+10} Charity Lane, {cities[i]}",
                city=cities[i],
                state=states[i],
                district=districts[i],
                registered_with=random.choice(["Registrar of Societies", "Registrar of Companies", "Charitable Trusts"]),
                registration_date=date(2000 + random.randint(0, 20), random.randint(1, 12), random.randint(1, 28)),
                act_name=random.choice(["Societies Registration Act, 1860", "Indian Trusts Act, 1882", "Companies Act, 2013"]),
                type_of_ngo=random.choice(["Society", "Trust", "Section 8 Company"]),
                transparency_score=random.randint(50, 100),
                verified=random.choice([True, False]),
                active=True,
                scraped_at=datetime.utcnow(),
                source="Seed Script"
            )
            ngo.categories = random.sample(categories, k=random.randint(1, 3))
            db.session.add(ngo)
            ngos.append(ngo)
        db.session.commit()

        # -----------------------------
        # 4️⃣ Office Bearers (2–4 per NGO)
        # -----------------------------
        print("Adding office bearers...")
        designations = ["President", "Secretary", "Treasurer", "Member"]
        for ngo in ngos:
            for _ in range(random.randint(2, 4)):
                bearer = OfficeBearer(
                    ngo_id=ngo.id,
                    name=f"{random.choice(['Amit', 'Priya', 'Ravi', 'Sneha', 'Karan', 'Deepa', 'Manish', 'Neha'])} {random.choice(['Sharma', 'Kumar', 'Patel', 'Rao', 'Verma', 'Singh'])}",
                    designation=random.choice(designations)
                )
                db.session.add(bearer)
        db.session.commit()

        # -----------------------------
        # 5️⃣ Blacklist Records (for 2 NGOs)
        # -----------------------------
        print("Seeding blacklist info...")
        blacklisted_ngos = random.sample(ngos, k=2)
        for ngo in blacklisted_ngos:
            record = BlacklistRecord(
                ngo_id=ngo.id,
                blacklisted_by=random.choice(["Ministry of Home Affairs", "NITI Aayog"]),
                blacklist_date=date(2023, random.randint(1, 12), random.randint(1, 28)),
                reason=random.choice(["Violation of FCRA guidelines", "Non-submission of annual reports"]),
                wef_date=date(2023, random.randint(1, 12), random.randint(1, 28)),
                last_updated=date(2024, random.randint(1, 12), random.randint(1, 28))
            )
            ngo.blacklisted = True
            db.session.add(record)
        db.session.commit()

        # -----------------------------
        # 6️⃣ Volunteer Posts
        # -----------------------------
        print("Creating volunteer posts...")
        posts = []
        for ngo in ngos:
            for j in range(random.randint(1, 3)):
                post = VolunteerPost(
                    ngo_id=ngo.id,
                    title=f"Volunteer for {ngo.name} - Role {j+1}",
                    description="Assist with community outreach and educational initiatives.",
                    requirements="Commitment to social work and at least 5 hours per week.",
                    location=f"{ngo.city}, {ngo.state}",
                    deadline=datetime.utcnow() + timedelta(days=random.randint(15, 60)),
                    active=True
                )
                db.session.add(post)
                posts.append(post)
        db.session.commit()

        # -----------------------------
        # 7️⃣ Events
        # -----------------------------
        print("Creating events...")
        for ngo in ngos:
            for j in range(random.randint(1, 2)):
                event = Event(
                    ngo_id=ngo.id,
                    title=f"{ngo.name} Awareness Drive {j+1}",
                    description=f"Join {ngo.name} for a local awareness drive on {random.choice(['education', 'health', 'sanitation'])}.",
                    event_date=datetime.utcnow() + timedelta(days=random.randint(5, 30)),
                    location=f"{ngo.city}, {ngo.state}",
                    registration_link=f"{ngo.website}/register"
                )
                db.session.add(event)
        db.session.commit()

        # -----------------------------
        # 8️⃣ Applications
        # -----------------------------
        print("Creating applications...")
        for _ in range(10):
            application = Application(
                user_id=random.choice(users).id,
                volunteer_post_id=random.choice(posts).id,
                message="I would love to contribute to your initiative.",
                status=random.choice(["pending", "accepted", "rejected"])
            )
            db.session.add(application)
        db.session.commit()

        # -----------------------------
        # ✅ Summary
        # -----------------------------
        print("\n" + "=" * 70)
        print("🎉 Database seeded successfully with realistic sample data!")
        print("=" * 70)
        print(f"Categories:       {len(categories)}")
        print(f"NGOs:             {len(ngos)}")
        print(f"Office Bearers:   {OfficeBearer.query.count()}")
        print(f"Blacklisted NGOs: {len(blacklisted_ngos)}")
        print(f"Volunteer Posts:  {len(posts)}")
        print(f"Users:            {len(users)}")
        print("Admin credentials:")
        print(f"  Email: {Config.ADMIN_EMAIL}")
        print(f"  Password: {Config.ADMIN_PASSWORD}")
        print("=" * 70)
        print("✅ Next:")
        print(" → Run the app: python app.py")
        print(" → Check /api/ngos or /api/blacklisted to verify data.")
        print("=" * 70)

if __name__ == "__main__":
    init_database()
