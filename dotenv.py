from dotenv import load_dotenv
import os

class APIKeyLoader:
    def __init__(self, dotenv_path):
        self.dotenv_path = dotenv_path

    def load_api_key(self):
        load_dotenv(self.dotenv_path)
        api_key = os.getenv("AI_STUDIO_API_KEY")
        return api_key