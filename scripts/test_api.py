import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    print("1. Starting session...")
    resp = requests.post(f"{base_url}/session/start", json={"initial_message": "Hi, I am Pruthvi and I am 25 years old."})
    data = resp.json()
    session_id = data["thread_id"]
    print(f"Session ID: {session_id}")
    print(f"Bot Initial: {data['message']}")
    
    # We must ask a question that triggers the hospital scraper
    msg = "I need a hospital nearby immediately. [SYSTEM CONTEXT: User Location: Lat 18.6135, Lon 73.8165]"
    print(f"\n2. Sending chat message: {msg}")
    
    response = requests.post(
        f"{base_url}/session/message", 
        json={"thread_id": session_id, "message": msg}
    )
    
    print("\nBot Response:")
    print(response.json().get("message", "No message field found."))
    print("\n\nTest completed.")

if __name__ == "__main__":
    test_api()
