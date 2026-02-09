#!/usr/bin/env python3
"""
Test script to verify Groq API key functionality
"""
import os
from dotenv import load_dotenv
from groq import Groq

print("=== Environment Variable Diagnostics ===")
print(f"Current working directory: {os.getcwd()}")
print(f"Looking for .env files...")

# Check for .env files in different locations
env_locations = [
    './.env',
    '../.env',
    '../../.env',
    './backend/.env',
    '../backend/.env',
    '/mnt/c/phase-1-2-hackathon-todo-app/backend/.env'
]

for env_loc in env_locations:
    if os.path.exists(env_loc):
        print(f"Found .env file: {env_loc}")
        with open(env_loc, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'GROQ_API_KEY' in line and '=' in line:
                    print(f"  -> Key in {env_loc}: {line.strip()[:20]}...")
    else:
        print(f"  -> Not found: {env_loc}")

print("\nLoading environment variables...")
# Load environment variables
load_dotenv()

# Get the API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print(f"Environment file loaded: {os.path.exists('.env') or os.path.exists('backend/.env')}")
print(f"GROQ_API_KEY is set: {GROQ_API_KEY is not None}")
print(f"GROQ_API_KEY length: {len(GROQ_API_KEY) if GROQ_API_KEY else 0}")
print(f"GROQ_API_KEY starts with 'gsk_': {GROQ_API_KEY.startswith('gsk_') if GROQ_API_KEY else False}")

if GROQ_API_KEY:
    # Check for any whitespace
    stripped_key = GROQ_API_KEY.strip()
    print(f"Original key has leading/trailing whitespace: {GROQ_API_KEY != stripped_key}")

    # Show the exact key format for comparison
    print(f"Raw key: '{GROQ_API_KEY}'")
    print(f"Stripped key: '{stripped_key}'")

    if GROQ_API_KEY != stripped_key:
        print("WARNING: Key has leading/trailing whitespace - this could cause authentication issues!")

    # Test client initialization
    try:
        client = Groq(api_key=stripped_key)
        print("Groq client initialized successfully")

        # Test API call
        try:
            models = client.models.list()
            print("SUCCESS: API key is valid! Available models:")
            for model in models.data:
                print(f"  - {model.id}")
        except Exception as e:
            print(f"ERROR: API call failed: {e}")
            print(f"Error type: {type(e).__name__}")

    except Exception as e:
        print(f"ERROR: Failed to initialize client: {e}")
        print(f"Error type: {type(e).__name__}")
else:
    print("ERROR: GROQ_API_KEY is not set in environment")
    print("\nMake sure your .env file is in the correct location and contains:")
    print("GROQ_API_KEY=your_actual_key_here")