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




