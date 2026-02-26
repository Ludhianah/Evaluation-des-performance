import requests
import json

url = 'http://localhost:8000/evaluations/'
headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcyMDg4OTIxfQ.gpmt5oYryd8_UBxEbDC7BNU6n5yCBd8vmmoFAY_4kTM',
    'Content-Type': 'application/json'
}
data = {
    'employe_id': 1,
    'realisation': 85.5,
    'indicateur_id': 5,
    'responsable_id': 1,
    'mois': 1,
    'annee': 2026
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')