"""
NGO Web Scraper
Scrapes NGO data from multiple sources
"""
import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime
from models import db, NGO, Category
from config import Config
import re

class NGOScraper:
    def __init__(self, app):
        self.app = app
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': Config.SCRAPER_USER_AGENT})
    
    def scrape_giveindia(self):
        """
        Scrape NGOs from GiveIndia
        Note: This is a sample implementation. Actual scraping depends on website structure.
        IMPORTANT: Check website's robots.txt and terms of service before scraping
        """
        print("Starting GiveIndia scraper...")
        
        # Sample NGO data structure (replace with actual scraping)
        sample_ngos = [
            {
                'name': 'Akshaya Patra Foundation',
                'mission': 'Providing mid-day meals to school children',
                'description': 'Akshaya Patra Foundation is a not-for-profit organization that implements the Mid-Day Meal Scheme across India.',
                'website': 'https://www.akshayapatra.org',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'categories': ['Education', 'Child Welfare']
            },
            {
                'name': 'Give India Foundation',
                'mission': 'Connecting donors with verified NGOs',
                'description': 'GiveIndia is an online donation platform that connects individual and corporate donors to verified NGOs.',
                'website': 'https://www.giveindia.org',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'categories': ['Social Welfare']
            },
            {
                'name': 'CRY - Child Rights and You',
                'mission': 'Ensuring children rights in India',
                'description': 'CRY works to ensure happier childhoods for underprivileged children in India.',
                'website': 'https://www.cry.org',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'categories': ['Child Welfare', 'Education']
            },
            {
                'name': 'Pratham Education Foundation',
                'mission': 'Improving quality of education for underprivileged children',
                'description': 'Pratham is one of the largest NGOs in India working to provide quality education to children from low-income families.',
                'website': 'https://www.pratham.org',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'categories': ['Education']
            },
            {
                'name': 'Smile Foundation',
                'mission': 'Working for underprivileged children and families',
                'description': 'Smile Foundation is working for education, healthcare, and livelihood of underprivileged children and families.',
                'website': 'https://www.smilefoundationindia.org',
                'city': 'New Delhi',
                'state': 'Delhi',
                'categories': ['Child Welfare', 'Health', 'Education']
            }
        ]
        
        with self.app.app_context():
            for ngo_data in sample_ngos:
                self._save_ngo(ngo_data, source='GiveIndia')
                time.sleep(Config.SCRAPER_DELAY)
    
    def scrape_ngo_darpan(self):
        """
        Scrape from NGO Darpan
        Note: NGO Darpan has an official API - use that instead of scraping
        API: https://ngodarpan.gov.in/index.php/home/statewise_ngo/
        """
        print("Starting NGO Darpan scraper...")
        
        sample_ngos = [
            {
                'name': 'Goonj',
                'mission': 'Making clothing a tool for development',
                'description': 'Goonj works on disaster relief, humanitarian aid and community development in India.',
                'website': 'https://www.goonj.org',
                'registration_no': 'DL/2003/0006120',
                'city': 'New Delhi',
                'state': 'Delhi',
                'categories': ['Social Welfare', 'Disaster Relief']
            },
            {
                'name': 'Nanhi Kali',
                'mission': 'Supporting education of underprivileged girls',
                'description': 'Nanhi Kali is dedicated to providing primary education to underprivileged girls in India.',
                'website': 'https://www.nanhikali.org',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'categories': ['Education', 'Women Empowerment']
            },
            {
                'name': 'Helpage India',
                'mission': 'Working for disadvantaged elderly',
                'description': 'HelpAge India works for the cause and care of disadvantaged older persons.',
                'website': 'https://www.helpageindia.org',
                'city': 'New Delhi',
                'state': 'Delhi',
                'categories': ['Elderly Care', 'Health']
            }
        ]
        
        with self.app.app_context():
            for ngo_data in sample_ngos:
                self._save_ngo(ngo_data, source='NGO Darpan')
                time.sleep(Config.SCRAPER_DELAY)
    
    def _save_ngo(self, ngo_data, source):
        """Save scraped NGO to database"""
        try:
            # Check if NGO already exists
            existing = NGO.query.filter_by(name=ngo_data['name']).first()
            if existing:
                print(f"NGO {ngo_data['name']} already exists, skipping...")
                return
            
            # Create NGO
            ngo = NGO(
                name=ngo_data['name'],
                mission=ngo_data.get('mission'),
                description=ngo_data.get('description'),
                website=ngo_data.get('website'),
                registration_no=ngo_data.get('registration_no'),
                city=ngo_data.get('city'),
                state=ngo_data.get('state'),
                email=ngo_data.get('email'),
                phone=ngo_data.get('phone'),
                source=source,
                scraped_at=datetime.utcnow()
            )
            
            # Add categories
            if 'categories' in ngo_data:
                for cat_name in ngo_data['categories']:
                    category = Category.query.filter_by(name=cat_name).first()
                    if category:
                        ngo.categories.append(category)
            
            db.session.add(ngo)
            db.session.commit()
            print(f"Saved NGO: {ngo_data['name']}")
        
        except Exception as e:
            print(f"Error saving NGO {ngo_data.get('name')}: {str(e)}")
            db.session.rollback()

def run_scraper(app):
    """Main scraper function"""
    scraper = NGOScraper(app)
    
    print("=" * 50)
    print("NGO Scraper Started")
    print("=" * 50)
    
    scraper.scrape_giveindia()
    scraper.scrape_ngo_darpan()
    
    print("=" * 50)
    print("Scraping completed!")
    print("=" * 50)

if __name__ == '__main__':
    from app import create_app
    app = create_app()
    run_scraper(app)


