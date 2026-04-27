# API Documentation

This document describes the backend API for the Inventory & SDP Supply Tracker application.

## Base URL

- Local development: `http://localhost:8000`

## Health and Root

- `GET /`
  - Description: API root endpoint
  - Response: `200 OK`
  - Example response:
    ```json
    { "message": "Inventory & SDP Supply Tracker API is running" }
    ```

- `GET /health`
  - Description: Health check endpoint
  - Response: `200 OK`
  - Example response:
    ```json
    { "status": "healthy" }
    ```

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Register

- `POST /auth/register`
- Description: Create a new SDP user account.
- Request body:
  ```json
  {
    "name": "Your Name",
    "email": "user@example.com",
    "password": "strongpassword",
    "state": "State Name",
    "city": "City Name",
    "pincode": "123456"
  }
  ```
- Response: `201 Created`
- Response body example:
  ```json
  {
    "id": 1,
    "name": "Your Name",
    "email": "user@example.com",
    "role": "sdp",
    "state": "State Name",
    "city": "City Name",
    "pincode": "123456"
  }
  ```

### Login

- `POST /auth/login`
- Description: Authenticate a user and return a JWT access token.
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword"
  }
  ```
- Response: `200 OK`
- Response body example:
  ```json
  {
    "access_token": "<jwt_token>",
    "token_type": "bearer"
  }
  ```

### Current User

- `GET /auth/me`
- Description: Get the current authenticated user's profile.
- Authorization: Bearer token required.
- Response: `200 OK`
- Response body example:
  ```json
  {
    "id": 1,
    "name": "Your Name",
    "email": "user@example.com",
    "role": "sdp",
    "state": "State Name",
    "city": "City Name",
    "pincode": "123456"
  }
  ```

## Inventory Endpoints

All inventory endpoints require authentication.

### Get All Inventory Items

- `GET /inventory/`
- Description: Return all inventory items.
- Authorization: Bearer token required.
- Response: `200 OK`
- Response body example:
  ```json
  [
    {
      "id": 1,
      "item_name": "Item A",
      "quantity": 120,
      "threshold": 20,
      "is_low_stock": false
    }
  ]
  ```

### Get Single Item

- `GET /inventory/{item_id}`
- Description: Retrieve a single inventory item by ID.
- Authorization: Bearer token required.
- Response: `200 OK` or `404 Not Found`

### Create Inventory Item (Admin only)

- `POST /inventory/`
- Description: Create a new inventory record.
- Authorization: Admin token required.
- Request body:
  ```json
  {
    "item_name": "New Item",
    "quantity": 50,
    "threshold": 10
  }
  ```
- Response: `201 Created`

### Update Inventory Item (Admin only)

- `PUT /inventory/{item_id}`
- Description: Update inventory item fields.
- Authorization: Admin token required.
- Request body examples:
  ```json
  {
    "quantity": 45
  }
  ```
  or
  ```json
  {
    "item_name": "Updated Name",
    "threshold": 15
  }
  ```
- Response: `200 OK`

### Delete Inventory Item (Admin only)

- `DELETE /inventory/{item_id}`
- Description: Remove an item from inventory.
- Authorization: Admin token required.
- Response: `204 No Content`

### Get Low Stock Items (Admin only)

- `GET /inventory/low-stock/`
- Description: Return all items whose quantity is at or below threshold.
- Authorization: Admin token required.
- Response: `200 OK`

### Get Low Stock Report (Admin only)

- `GET /inventory/low-stock/report/`
- Description: Return detailed low-stock report data.
- Authorization: Admin token required.
- Response: `200 OK`

## Request Endpoints

All request endpoints require authentication.

### Create Request (SDP only)

- `POST /requests/`
- Description: Create a new supply request for the current SDP user.
- Authorization: Bearer token required.
- Request body:
  ```json
  {
    "items": [
      { "item_id": 1, "quantity": 10 },
      { "item_id": 2, "quantity": 5 }
    ]
  }
  ```
- Response: `201 Created`

### Get My Requests

- `GET /requests/`
- Description: Return all requests created by the current SDP user.
- Authorization: Bearer token required.
- Response: `200 OK`

### Get Request By ID

- `GET /requests/{request_id}`
- Description: Return a request by ID.
- Authorization: Bearer token required.
- Notes: SDP users can only retrieve their own request; Admin users can retrieve any request.

### Get All Requests (Admin only)

- `GET /requests/all/`
- Description: Return all requests across all SDP users.
- Authorization: Admin token required.
- Query parameter: `status_filter` (optional)
- Response: `200 OK`

### Approve Request (Admin only)

- `POST /requests/approve/{request_id}`
- Description: Approve a pending request and deduct inventory.
- Authorization: Admin token required.
- Response: `200 OK`
- Side effects: inventory quantities are reduced and email notification is sent.

### Reject Request (Admin only)

- `POST /requests/reject/{request_id}`
- Description: Reject a pending request.
- Authorization: Admin token required.
- Response: `200 OK`
- Side effects: rejection email notification is sent.

## Request and Response Schemas

### User Registration

- `name`: string
- `email`: email string
- `password`: string
- `state`: string
- `city`: string
- `pincode`: string (6 characters)

### Login

- `email`: email string
- `password`: string

### Inventory Item

- `item_name`: string
- `quantity`: integer
- `threshold`: integer
- `is_low_stock`: boolean

### Supply Request

- `items`: array of request items
- `item_id`: integer
- `quantity`: integer

### Request Response

- `id`: integer
- `sdp_id`: integer
- `sdp_name`: string
- `sdp_state`: string
- `sdp_city`: string
- `sdp_pincode`: string
- `status`: string (`pending`, `approved`, `rejected`)
- `created_at`: datetime
- `items`: array of request item objects

## Authentication Notes

- Access tokens are created as JWT bearer tokens.
- The API uses password hashing and token decoding for authentication.
- Admin-only routes are protected by the `get_current_admin` dependency.

## Environment Variables

The backend uses environment variables from `backend/.env`:

- `DATABASE_URL`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `FROM_EMAIL`

## Notes

- The backend allows CORS from any origin for development.
- Protect JWT secrets and SMTP credentials before deploying to production.
- Use `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` to run the API.
