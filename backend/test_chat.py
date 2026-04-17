import requests
import json

url = "http://localhost:8000/api/chat/student"
payload = {
    "student_id": "44210988",
    "message": "كيف ارفع معدلي؟"
}

try:
    resp = requests.post(url, json=payload, timeout=30)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    if "response" in data:
        print(f"AI Response:\n{data['response'][:500]}")
    else:
        print(f"Full response:\n{json.dumps(data, ensure_ascii=False, indent=2)}")
except Exception as e:
    print(f"Error: {e}")
