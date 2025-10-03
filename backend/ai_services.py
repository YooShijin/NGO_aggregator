"""
AI Service using Groq API
Provides summarization and text generation features
"""
from groq import Groq
from config import Config

class AIService:
    def __init__(self):
        self.client = None
        if Config.GROQ_API_KEY:
            self.client = Groq(api_key=Config.GROQ_API_KEY)
    
    def generate_summary(self, text, max_length=150):
        """
        Generate a concise summary of NGO description
        """
        if not self.client:
            return text[:max_length] + "..." if len(text) > max_length else text
        
        try:
            prompt = f"""Summarize the following NGO description in 2-3 sentences (maximum {max_length} characters).
Focus on their main mission and impact:

{text}

Summary:"""
            
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="mixtral-8x7b-32768",
                max_tokens=100,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            return summary
        
        except Exception as e:
            print(f"AI summarization error: {str(e)}")
            return text[:max_length] + "..." if len(text) > max_length else text
    
    def suggest_categories(self, mission_text):
        """
        Suggest relevant categories based on NGO mission
        """
        if not self.client:
            return []
        
        try:
            prompt = f"""Based on this NGO mission, suggest 1-3 relevant categories from this list:
Education, Health, Environment, Child Welfare, Women Empowerment, Elderly Care, 
Animal Welfare, Disaster Relief, Social Welfare, Poverty Alleviation

Mission: {mission_text}

Return only category names separated by commas:"""
            
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "user", "content": prompt}
                ],
                model="mixtral-8x7b-32768",
                max_tokens=50,
                temperature=0.2
            )
            
            categories_text = response.choices[0].message.content.strip()
            categories = [cat.strip() for cat in categories_text.split(',')]
            return categories
        
        except Exception as e:
            print(f"AI category suggestion error: {str(e)}")
            return []
    
    def calculate_transparency_score(self, ngo):
        """
        Calculate transparency score based on data completeness
        """
        score = 0
        
        # Basic info (30 points)
        if ngo.name: score += 5
        if ngo.mission: score += 10
        if ngo.description: score += 15
        
        # Contact info (20 points)
        if ngo.email: score += 10
        if ngo.phone: score += 5
        if ngo.website: score += 5
        
        # Location (20 points)
        if ngo.address: score += 10
        if ngo.city and ngo.state: score += 10
        
        # Verification (30 points)
        if ngo.registration_no: score += 20
        if ngo.verified: score += 10
        
        return min(score, 100)

ai_service = AIService()