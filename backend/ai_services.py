import google.generativeai as genai
from config import Config

class AIService:
    def __init__(self):
        self.client = None
        if Config.GEM_API_KEY:
            genai.configure(api_key=Config.GEM_API_KEY)
            try:
                self.client = genai.GenerativeModel("gemini-pro")
            except Exception as e:
                print("Gemini initialization error:", e)
                self.client = None

    def generate_summary(self, text, max_length=150):
        if not self.client:
            return text[:max_length] + "..." if len(text) > max_length else text

        prompt = (
            f"Summarize the following NGO description in 2-3 sentences "
            f"(maximum {max_length} characters). Focus on their mission & impact:\n\n"
            f"{text}\n\nSummary:"
        )

        try:
            response = self.client.generate_content(prompt)
            summary = response.text.strip()
            return summary
        except Exception as e:
            print("AI summarization error:", e)
            return text[:max_length] + "..." if len(text) > max_length else text

    def suggest_categories(self, mission_text):
        if not self.client:
            return []

        prompt = (
            "Based on this NGO mission, suggest 1-3 relevant categories from this list:\n"
            "Education, Health, Environment, Child Welfare, Women Empowerment, Elderly Care, "
            "Animal Welfare, Disaster Relief, Social Welfare, Poverty Alleviation.\n\n"
            f"Mission: {mission_text}\n\n"
            "Return only category names separated by commas:"
        )

        try:
            response = self.client.generate_content(prompt)
            raw = response.text.strip()
            return [cat.strip() for cat in raw.split(",") if cat.strip()]
        except Exception as e:
            print("AI category suggestion error:", e)
            return []

    def calculate_transparency_score(self, ngo):
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

# Single shared instance for the app
ai_service = AIService()
