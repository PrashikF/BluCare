from app.rag.tools.facilities_tool import find_nearby_facilities

print("Testing facilities tool...")
# Example coordinates for testing (e.g., somewhere in Pune based on the user's earlier script)
result = find_nearby_facilities.invoke({
    "disease": "heart", 
    "facility_type": "hospital", 
    "lat": 18.6135, 
    "lon": 73.8165
})

print("RESULT:")
print(result)
