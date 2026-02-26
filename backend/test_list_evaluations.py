import requests

url = 'http://localhost:8000/evaluations/'
headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcyMDg4OTIxfQ.gpmt5oYryd8_UBxEbDC7BNU6n5yCBd8vmmoFAY_4kTM'
}

try:
    response = requests.get(url, headers=headers)
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')