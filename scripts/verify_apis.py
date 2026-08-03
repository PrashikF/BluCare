import os
import sys

from dotenv import load_dotenv

# Load env vars
load_dotenv()

def verify_groq():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        print("❌ GROQ_API_KEY is not set correctly in .env")
        return False
        
    try:
        from langchain_groq import ChatGroq
        print(f"Testing Groq API with model {os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')}...")
        chat = ChatGroq(model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"))
        response = chat.invoke("Hello, say 'Groq is working' if you can read this.")
        print("✅ Groq API is working! Response:", response.content)
        return True
    except Exception as e:
        print("❌ Groq API failed:", str(e))
        return False

def verify_langsmith():
    api_key = os.getenv("LANGCHAIN_API_KEY")
    if not api_key or api_key == "your_langsmith_api_key_here":
        print("❌ LANGCHAIN_API_KEY is not set correctly in .env")
        return False
        
    try:
        from langsmith import Client
        print("Testing LangSmith API...")
        client = Client()
        # Just try to get the projects to verify the API key works
        projects = list(client.list_projects(limit=1))
        print("✅ LangSmith API is working! Connected successfully.")
        return True
    except Exception as e:
        print("❌ LangSmith API failed:", str(e))
        return False

if __name__ == "__main__":
    print("=== Verifying APIs ===")
    groq_ok = verify_groq()
    print("-" * 20)
    langsmith_ok = verify_langsmith()
    print("-" * 20)
    
    if groq_ok and langsmith_ok:
        print("🎉 Both Groq and LangSmith APIs are configured correctly!")
        sys.exit(0)
    else:
        print("⚠️ One or more APIs failed to verify. Please check your .env file.")
        sys.exit(1)
