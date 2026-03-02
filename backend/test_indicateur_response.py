import requests
import json

# Test creating an indicator to verify response format
url = 'http://localhost:8000/indicateurs/'
headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcyMDg4OTIxfQ.gpmt5oYryd8_UBxEbDC7BNU6n5yCBd8vmmoFAY_4kTM',
    'Content-Type': 'application/json'
}

# First, let's create an objectif to use for testing
objectif_data = {
    'libelle': 'Test Objectif',
    'date': '2025-12-31',
    'service_id': 1
}

try:
    # Create objectif first
    objectif_response = requests.post('http://localhost:8000/objectifs/', headers=headers, json=objectif_data)
    print(f'Objectif creation - Status: {objectif_response.status_code}')
    if objectif_response.status_code == 200:
        objectif_id = objectif_response.json()['id']
        print(f'Objectif created with ID: {objectif_id}')
        
        # Now create an indicateur with the created objectif
        indicateur_data = {
            'libelle': 'Test Indicateur',
            'type': 'QUALITATIF',
            'valeur_cible': None,
            'objectif_id': objectif_id
        }
        
        response = requests.post(url, headers=headers, json=indicateur_data)
        print(f'Indicateur creation - Status: {response.status_code}')
        print(f'Response: {response.text}')
        
        if response.status_code == 200:
            response_data = response.json()
            print(f'\nFormatted Response:')
            print(json.dumps(response_data, indent=2, ensure_ascii=False))
    else:
        print(f'Failed to create objectif: {objectif_response.text}')
        
except Exception as e:
    print(f'Error: {e}')