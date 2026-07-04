# Authentication API Specification

This document details the Authentication endpoints for the backend HRMS API. All routes are prefixed with `/api/auth`.

## 1. Login

Authenticates a user and issues an access token and a refresh token.

- **URL:** `/login`
- **Method:** `POST`
- **Auth required:** No
- **Request Body:**
  ```json
  {
    "employee_id": "EMP-001",
    "password": "yourpassword"
  }
  ```
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **Headers:** Sets `refresh_token` as an HTTP-only secure cookie.
- **Error Response:**
  - **Code:** `401 Unauthorized`
  - **Content:** `{ "error": "Invalid credentials" }`

---

## 2. Refresh Token

Issues a new access token using a valid refresh token.

- **URL:** `/refresh`
- **Method:** `POST`
- **Auth required:** Yes (via `refresh_token` HTTP-only cookie)
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
- **Error Response:**
  - **Code:** `401 Unauthorized`
  - **Content:** `{ "error": "Unauthorized: Invalid refresh token" }`

---

## 3. Logout

Clears the user's refresh token cookie.

- **URL:** `/logout`
- **Method:** `POST`
- **Auth required:** No
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:** `{ "message": "Logged out successfully" }`
  - **Headers:** Clears `refresh_token` cookie.

---

## 4. Get Current User

Retrieves the currently authenticated user's details.

- **URL:** `/me`
- **Method:** `GET`
- **Auth required:** Yes (Bearer Token)
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response:**
  - **Code:** `200 OK`
  - **Content:**
    ```json
    {
      "user": {
        "id": 1,
        "employee_id": "EMP-001",
        "name": "System Admin",
        "email": "admin@hrms.com",
        "role": "Admin",
        "created_at": "2023-10-27T10:00:00Z"
      }
    }
    ```
- **Error Response:**
  - **Code:** `401 Unauthorized`
  - **Content:** `{ "error": "Unauthorized: No token provided" }`
