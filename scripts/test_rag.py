import requests
import json
import time

def test_rag():
    base_url = "http://localhost:8000"
    
    print("1. Starting session...")
    resp = requests.post(f"{base_url}/session/start", json={"initial_message": "Hi, I am Pruthvi and I am 25 years old."})
    session_id = resp.json()["thread_id"]
    print(f"Session ID: {session_id}")
    
    messages = [
        "I have a severe fever of 103 degrees.",
        "I also have a cold and runny nose for 3 days.",
        "My head hurts a lot, pain is 9 out of 10.",
        "No other symptoms, that is all. Tell me what I have."
    ]
    
    for i, msg in enumerate(messages):
        print(f"\nTurn {i+1}: Sending '{msg}'")
        resp = requests.post(
            f"{base_url}/session/message", 
            json={"thread_id": session_id, "message": msg}
        )
        print("Bot Response:")
        print(resp.json().get("message", "No message"))
        time.sleep(1)

if __name__ == "__main__":
    test_rag()
