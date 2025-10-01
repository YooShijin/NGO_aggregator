import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgres://user:asmit2003@localhost/trading?sslmode=disable/ngo_aggregator')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # API Keys
    GEM_API_KEY = os.getenv('GEM_API_KEY', 'AIzaSyBv9vjdkjUfDLEa8KXqzFl17WGZeFtNoTI')
    
    # Admin
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@example.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'changeme123')
    
    # Pagination
    ITEMS_PER_PAGE = 20
    
    # Scraper settings
    SCRAPER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    SCRAPER_DELAY = 2  # seconds between requests