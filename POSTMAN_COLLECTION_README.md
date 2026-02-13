# Postman Collection for API Évaluation Mensuelle

This directory contains a comprehensive Postman collection for testing the FastAPI evaluation API.

## Collection Overview

The collection includes all available endpoints organized into logical groups:

### 1. Authentification
- **Register User** - Create new users
- **Login** - Authenticate users and obtain JWT tokens
- **Get Current User** - Retrieve current user information

### 2. Services
- **Create Service** - Create new services
- **List Services** - Get all services
- **Get Service by ID** - Retrieve specific service
- **Update Service** - Update service information
- **Delete Service** - Remove service

### 3. Évaluations
- **Create Evaluation** - Create employee evaluations with automatic note calculation

### 4. Home
- **Get Home** - Basic API health check

## Environment Variables

The collection uses these environment variables:

- `baseUrl`: `http://localhost:8000` (default)
- `token`: JWT token (automatically extracted from login response)

## Usage Instructions

### 1. Import the Collection
1. Open Postman
2. Click "Import" in the top left
3. Select the `evaluation-api.postman_collection.json` file
4. Click "Import"

### 2. Set Up Environment
1. Create a new environment in Postman
2. Add the `baseUrl` variable with your API URL
3. The `token` variable will be automatically populated after login

### 3. Testing the API

#### Step 1: Register a User
1. Go to the "Authentification" folder
2. Run the "Register User" request
3. Use the provided example data or modify as needed

**Alternative: Using curl command:**
```bash
curl --location 'http://localhost:8000/auth/register' \
--header 'Content-Type: application/json' \
--data '{
  "username": "admin",
  "password": "password123"
}'
```

#### Step 2: Login
1. Run the "Login" request
2. The JWT token will be automatically extracted and saved to the `token` environment variable

**Alternative: Using curl command:**
```bash
curl --location 'http://localhost:8000/auth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=admin' \
--data-urlencode 'password=password123'
```

#### Step 3: Test Protected Endpoints
1. All subsequent requests will automatically include the Authorization header
2. Test the Services endpoints (all authenticated users can perform CRUD operations)
3. Test the Evaluations endpoints

### 4. Example Workflows

#### Complete User Registration and Login Flow
1. Register User → Login → Get Current User

#### Service Management
1. Login → Create Service → List Services → Update Service → Delete Service

#### Evaluation Creation
1. Login → Create Evaluation (note is calculated automatically based on indicator type)

## Authentication

The API uses JWT Bearer tokens for authentication:
- Tokens are obtained through the `/auth/token` endpoint
- Tokens are automatically extracted and stored in the Postman environment
- All protected endpoints include the Authorization header automatically

## Important Notes

1. **Token Expiry**: JWT tokens expire after 60 minutes (configurable in the API)
2. **Database**: The API uses PostgreSQL - ensure your database is running
3. **Docker**: The API is designed to run in Docker containers (see docker-compose.yml)

## Error Handling

The collection includes example responses for:
- Successful operations (200, 201)
- Authentication errors (401)
- Not found errors (404)
- Validation errors (400)

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the API server is running on the specified baseUrl
2. **Authentication Failed**: Check that you're logged in and the token is valid
3. **Database Errors**: Ensure PostgreSQL is running and accessible

### Resetting the Collection

If you need to start fresh:
1. Delete the environment variables
2. Re-run the registration and login requests
3. Continue with testing

## API Documentation

For detailed API documentation, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Support

For issues with the Postman collection:
1. Verify the JSON is valid (use Postman's import validation)
2. Check that all environment variables are properly set
3. Ensure the API server is running and accessible