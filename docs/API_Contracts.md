# HRMS API Contracts

> **Version:** 1.0.0  
> **Base URL:** `https://api.hrms.com/api` (Production) | `http://localhost:3000/api` (Development)  
> **Content-Type:** `application/json`  
> **Authentication:** Bearer Token (JWT) via `Authorization` header, unless stated otherwise.

---

## Global Conventions

### Authorization Roles
| Role | Description |
|---|---|
| `Admin` | Full system access |
| `HR` | HR operations access |
| `Employee` | Access to own data only |

### Common Error Codes
| Error Code | HTTP Status | Description |
|---|---|---|
| `AUTH_NO_TOKEN` | 401 | No Bearer token provided |
| `AUTH_INVALID_TOKEN` | 401 | Token is malformed or expired |
| `AUTH_FORBIDDEN` | 403 | User role not permitted |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request body failed validation |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Standard Error Response
```json
{
  "error": "AUTH_INVALID_TOKEN",
  "message": "The token provided is expired or invalid."
}
```

### Standard Pagination (for list endpoints)
**Query Parameters:** `?page=1&limit=20&sort=created_at&order=desc`

**Paginated Response Envelope:**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

## 1. Authentication APIs

> Base path: `/api/auth`  
> No authentication required unless specified.

---

### 1.1 Login

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/auth/login` |
| **Authorization** | None |

**Request Body:**
```json
{
  "employee_id": "EMP-001",
  "password": "StrongP@ssw0rd"
}
```

**Validation:**
| Field | Rules |
|---|---|
| `employee_id` | Required, string, non-empty |
| `password` | Required, string, min 6 chars |

**Success Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
> Sets HTTP-only cookie: `refresh_token` (7d expiry, Secure, SameSite=Strict)

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing or invalid fields |
| `401` | `AUTH_INVALID_CREDENTIALS` | Employee ID or password incorrect |
| `500` | `INTERNAL_ERROR` | Unexpected error |

---

### 1.2 Refresh Token

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/auth/refresh` |
| **Authorization** | HTTP-only Cookie: `refresh_token` |

**Request Body:** None

**Success Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
> Also rotates and resets the `refresh_token` cookie.

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `401` | `AUTH_NO_TOKEN` | No refresh_token cookie present |
| `401` | `AUTH_INVALID_TOKEN` | Token invalid or expired |

---

### 1.3 Logout

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/auth/logout` |
| **Authorization** | None |

**Request Body:** None

**Success Response `200 OK`:**
```json
{
  "message": "Logged out successfully."
}
```
> Clears the `refresh_token` HTTP-only cookie.

---

### 1.4 Get Current User

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/auth/me` |
| **Authorization** | Bearer Token (any role) |

**Request Body:** None

**Success Response `200 OK`:**
```json
{
  "user": {
    "id": 1,
    "employee_id": "EMP-001",
    "name": "System Admin",
    "email": "admin@hrms.com",
    "role": "Admin",
    "created_at": "2024-01-01T00:00:00Z",
    "department": {
      "id": 1,
      "name": "IT"
    },
    "profile": {
      "designation": "System Administrator",
      "phone": "+91-9876543210",
      "joining_date": "2023-01-01T00:00:00Z",
      "photo_url": "https://..."
    }
  }
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `401` | `AUTH_NO_TOKEN` | No token |
| `401` | `AUTH_INVALID_TOKEN` | Token invalid |
| `404` | `NOT_FOUND` | User deleted after token issued |

---

## 2. Employee APIs

> Base path: `/api/employees`  
> Admin and HR can access all employees. Employees can only access their own profile.

---

### 2.1 List All Employees

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/employees` |
| **Authorization** | `Admin`, `HR` |

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `department_id` | number | Filter by department |
| `role` | string | Filter by role (`Admin`, `Employee`, `HR`) |
| `search` | string | Search by name or employee_id |

**Success Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 2,
      "employee_id": "EMP-002",
      "name": "Demo Employee",
      "email": "demo@hrms.com",
      "role": "Employee",
      "department": { "id": 3, "name": "Engineering" },
      "profile": {
        "designation": "Software Engineer",
        "joining_date": "2024-01-15T00:00:00Z",
        "photo_url": null
      }
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 20, "total_pages": 3 }
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `401` | `AUTH_NO_TOKEN` | No token |
| `403` | `AUTH_FORBIDDEN` | Insufficient role |

---

### 2.2 Get Employee by ID

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/employees/:id` |
| **Authorization** | `Admin`, `HR`; or `Employee` (own ID only) |

**Path Parameters:** `id` — User ID (integer)

**Success Response `200 OK`:**
```json
{
  "id": 2,
  "employee_id": "EMP-002",
  "name": "Demo Employee",
  "email": "demo@hrms.com",
  "role": "Employee",
  "created_at": "2024-01-01T00:00:00Z",
  "department": { "id": 3, "name": "Engineering" },
  "profile": {
    "designation": "Software Engineer",
    "address": "123 Main St, Mumbai",
    "phone": "+91-9876543210",
    "joining_date": "2024-01-15T00:00:00Z",
    "photo_url": "https://...",
    "documents_urls": ["https://..."]
  }
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `403` | `AUTH_FORBIDDEN` | Employee accessing another's profile |
| `404` | `NOT_FOUND` | Employee ID does not exist |

---

### 2.3 Create Employee

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/employees` |
| **Authorization** | `Admin` only |

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "password": "TempP@ss123",
  "role": "Employee",
  "department_id": 3,
  "profile": {
    "designation": "Product Manager",
    "phone": "+91-9876543210",
    "address": "456 Park Lane, Delhi",
    "joining_date": "2024-06-01"
  }
}
```

**Validation:**
| Field | Rules |
|---|---|
| `name` | Required, string, 2–100 chars |
| `email` | Required, valid email, unique |
| `password` | Required, min 8 chars |
| `role` | Required, enum: `Admin`, `Employee`, `HR` |
| `department_id` | Optional, integer, must exist |
| `profile.designation` | Optional, string |
| `profile.phone` | Optional, string |
| `profile.joining_date` | Optional, ISO 8601 date |

**Success Response `201 Created`:**
```json
{
  "id": 10,
  "employee_id": "EMP-010",
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "role": "Employee"
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Failed validation |
| `409` | `CONFLICT` | Email already in use |
| `403` | `AUTH_FORBIDDEN` | Not Admin |

---

### 2.4 Update Employee

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Route** | `/api/employees/:id` |
| **Authorization** | `Admin`, `HR`; or `Employee` (own profile fields only) |

**Request Body** (all fields optional):
```json
{
  "name": "Jane Smith",
  "department_id": 2,
  "profile": {
    "phone": "+91-9000000000",
    "address": "New Address, Mumbai",
    "photo_url": "https://..."
  }
}
```

**Success Response `200 OK`:**
```json
{
  "message": "Employee updated successfully."
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid field values |
| `403` | `AUTH_FORBIDDEN` | Employee modifying restricted fields |
| `404` | `NOT_FOUND` | Employee not found |

---

### 2.5 Delete Employee

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Route** | `/api/employees/:id` |
| **Authorization** | `Admin` only |

**Success Response `200 OK`:**
```json
{
  "message": "Employee deleted successfully."
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `403` | `AUTH_FORBIDDEN` | Not Admin |
| `404` | `NOT_FOUND` | Employee not found |

---

### 2.6 List Departments

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/employees/departments` |
| **Authorization** | Any authenticated user |

**Success Response `200 OK`:**
```json
{
  "data": [
    { "id": 1, "name": "IT" },
    { "id": 2, "name": "HR" },
    { "id": 3, "name": "Engineering" }
  ]
}
```

---

## 3. Attendance APIs

> Base path: `/api/attendance`  
> Employees manage their own records. Admin/HR can manage all.

---

### 3.1 Check In

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/attendance/checkin` |
| **Authorization** | Any authenticated user |

**Request Body:** None (user determined from JWT)

**Success Response `201 Created`:**
```json
{
  "id": 55,
  "user_id": 2,
  "date": "2024-06-04",
  "check_in": "2024-06-04T09:02:00Z",
  "check_out": null,
  "status": "Present"
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `409` | `CONFLICT` | Already checked in today |

---

### 3.2 Check Out

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/attendance/checkout` |
| **Authorization** | Any authenticated user |

**Request Body:** None

**Success Response `200 OK`:**
```json
{
  "id": 55,
  "check_out": "2024-06-04T18:15:00Z",
  "hours": 9.22
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `CHECKOUT_WITHOUT_CHECKIN` | No check-in record for today |
| `409` | `CONFLICT` | Already checked out today |

---

### 3.3 Get My Attendance

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/attendance/me` |
| **Authorization** | Any authenticated user |

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `month` | number | Month (1–12) |
| `year` | number | Year (e.g., 2024) |

**Success Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 55,
      "date": "2024-06-04",
      "check_in": "2024-06-04T09:02:00Z",
      "check_out": "2024-06-04T18:15:00Z",
      "hours": 9.22,
      "status": "Present"
    }
  ],
  "summary": {
    "present": 18,
    "absent": 2,
    "half_day": 1,
    "total_hours": 162.5
  }
}
```

---

### 3.4 Get Employee Attendance (Admin/HR)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/attendance/:userId` |
| **Authorization** | `Admin`, `HR` |

**Query Parameters:** `month`, `year` (same as 3.3)

**Success Response `200 OK`:** Same shape as 3.3.

---

### 3.5 Create/Override Attendance (Admin/HR)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/attendance` |
| **Authorization** | `Admin`, `HR` |

**Request Body:**
```json
{
  "user_id": 2,
  "date": "2024-06-03",
  "check_in": "2024-06-03T09:00:00Z",
  "check_out": "2024-06-03T17:30:00Z",
  "status": "Present"
}
```

**Validation:**
| Field | Rules |
|---|---|
| `user_id` | Required, integer, must exist |
| `date` | Required, ISO 8601 date, not future |
| `check_in` | Optional, ISO 8601 datetime |
| `check_out` | Optional, must be after check_in |
| `status` | Required, enum: `Present`, `Absent`, `Half Day`, `Leave` |

**Success Response `201 Created`:** Full attendance record.

---

## 4. Leave APIs

> Base path: `/api/leave`

---

### 4.1 Apply for Leave

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/leave` |
| **Authorization** | Any authenticated user |

**Request Body:**
```json
{
  "type": "Sick",
  "from_date": "2024-06-10",
  "to_date": "2024-06-12",
  "reason": "Medical appointment and recovery."
}
```

**Validation:**
| Field | Rules |
|---|---|
| `type` | Required, enum: `Sick`, `Casual`, `Annual` |
| `from_date` | Required, ISO 8601 date, not in past |
| `to_date` | Required, ISO 8601 date, >= from_date |
| `reason` | Required, string, 10–500 chars |

**Success Response `201 Created`:**
```json
{
  "id": 12,
  "type": "Sick",
  "from_date": "2024-06-10",
  "to_date": "2024-06-12",
  "reason": "Medical appointment and recovery.",
  "status": "Pending",
  "created_at": "2024-06-04T10:00:00Z"
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Failed validation |
| `409` | `CONFLICT` | Overlapping leave request exists |

---

### 4.2 Get My Leave Requests

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/leave/me` |
| **Authorization** | Any authenticated user |

**Query Parameters:** `page`, `limit`, `status` (`Pending`, `Approved`, `Rejected`)

**Success Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 12,
      "type": "Sick",
      "from_date": "2024-06-10",
      "to_date": "2024-06-12",
      "reason": "Medical appointment.",
      "status": "Pending",
      "comments": null
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 4.3 Get All Leave Requests (Admin/HR)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/leave` |
| **Authorization** | `Admin`, `HR` |

**Query Parameters:** `page`, `limit`, `status`, `user_id`, `department_id`, `from_date`, `to_date`

**Success Response `200 OK`:** Paginated list with employee details embedded in each record.

---

### 4.4 Get Leave Request by ID

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/leave/:id` |
| **Authorization** | `Admin`, `HR`; or `Employee` (own request) |

**Success Response `200 OK`:** Full leave request object with employee name and department.

---

### 4.5 Review Leave Request (Admin/HR)

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Route** | `/api/leave/:id/review` |
| **Authorization** | `Admin`, `HR` |

**Request Body:**
```json
{
  "status": "Approved",
  "comments": "Approved. Please ensure handover before leave."
}
```

**Validation:**
| Field | Rules |
|---|---|
| `status` | Required, enum: `Approved`, `Rejected` |
| `comments` | Optional, string, max 500 chars |

**Success Response `200 OK`:**
```json
{
  "message": "Leave request updated.",
  "status": "Approved"
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `ALREADY_REVIEWED` | Request is not in `Pending` state |
| `404` | `NOT_FOUND` | Leave request not found |

---

### 4.6 Cancel Leave Request

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Route** | `/api/leave/:id` |
| **Authorization** | `Employee` (own pending requests only) |

**Success Response `200 OK`:**
```json
{
  "message": "Leave request cancelled."
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `400` | `CANNOT_CANCEL` | Request is already approved or rejected |
| `403` | `AUTH_FORBIDDEN` | Not the owner of the request |
| `404` | `NOT_FOUND` | Request not found |

---

## 5. Payroll APIs

> Base path: `/api/payroll`  
> Admin/HR manages salary structures. Employees can view their own payslip.

---

### 5.1 Get Salary Structure

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/payroll/:userId` |
| **Authorization** | `Admin`, `HR`; or `Employee` (own record) |

**Success Response `200 OK`:**
```json
{
  "id": 1,
  "user_id": 2,
  "basic": 60000,
  "hra": 24000,
  "lta": 6000,
  "pf": 7200,
  "other_allowance": 10000,
  "deductions": 2000,
  "gross_salary": 100000,
  "net_salary": 90800
}
```
> `gross_salary` = basic + hra + lta + other_allowance  
> `net_salary` = gross_salary - pf - deductions

---

### 5.2 Create Salary Structure

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Route** | `/api/payroll` |
| **Authorization** | `Admin` only |

**Request Body:**
```json
{
  "user_id": 2,
  "basic": 60000,
  "hra": 24000,
  "lta": 6000,
  "pf": 7200,
  "other_allowance": 10000,
  "deductions": 2000
}
```

**Validation:**
| Field | Rules |
|---|---|
| `user_id` | Required, integer, must exist, no duplicate |
| `basic` | Required, positive float |
| `hra` | Required, non-negative float |
| `lta` | Required, non-negative float |
| `pf` | Required, non-negative float |
| `other_allowance` | Optional, non-negative float, default 0 |
| `deductions` | Optional, non-negative float, default 0 |

**Success Response `201 Created`:** Full salary structure object.

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `409` | `CONFLICT` | Salary structure already exists for this user |
| `404` | `NOT_FOUND` | User not found |

---

### 5.3 Update Salary Structure

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Route** | `/api/payroll/:userId` |
| **Authorization** | `Admin` only |

**Request Body** (all optional):
```json
{
  "basic": 65000,
  "hra": 26000,
  "deductions": 2500
}
```

**Success Response `200 OK`:** Updated salary structure with recalculated `gross_salary` and `net_salary`.

---

### 5.4 Generate Payslip

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/payroll/:userId/payslip` |
| **Authorization** | `Admin`, `HR`; or `Employee` (own) |

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `month` | number | Required. Month (1–12) |
| `year` | number | Required. Year (e.g., 2024) |

**Success Response `200 OK`:**
```json
{
  "employee": {
    "employee_id": "EMP-002",
    "name": "Demo Employee",
    "designation": "Software Engineer",
    "department": "Engineering",
    "joining_date": "2024-01-15"
  },
  "period": { "month": 6, "year": 2024 },
  "earnings": {
    "basic": 60000,
    "hra": 24000,
    "lta": 6000,
    "other_allowance": 10000,
    "gross": 100000
  },
  "deductions": {
    "pf": 7200,
    "other": 2000,
    "total": 9200
  },
  "net_salary": 90800,
  "attendance_summary": {
    "working_days": 22,
    "present": 20,
    "absent": 2,
    "paid_days": 20
  }
}
```

---

## 6. Dashboard APIs

> Base path: `/api/dashboard`  
> Returns aggregated analytics for the dashboard.

---

### 6.1 Admin Dashboard Summary

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/dashboard/admin` |
| **Authorization** | `Admin`, `HR` |

**Success Response `200 OK`:**
```json
{
  "total_employees": 45,
  "present_today": 38,
  "absent_today": 7,
  "on_leave_today": 3,
  "pending_leave_requests": 5,
  "new_employees_this_month": 2,
  "department_summary": [
    { "department": "Engineering", "count": 18 },
    { "department": "HR", "count": 6 }
  ],
  "attendance_trend": [
    { "date": "2024-06-01", "present": 40 },
    { "date": "2024-06-02", "present": 37 }
  ]
}
```

---

### 6.2 Employee Dashboard Summary

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/dashboard/me` |
| **Authorization** | Any authenticated user |

**Success Response `200 OK`:**
```json
{
  "user": {
    "name": "Demo Employee",
    "employee_id": "EMP-002",
    "designation": "Software Engineer",
    "department": "Engineering"
  },
  "attendance_this_month": {
    "present": 18,
    "absent": 2,
    "half_day": 1,
    "total_hours": 162.5
  },
  "leave_balance": {
    "sick": { "total": 10, "used": 2, "remaining": 8 },
    "casual": { "total": 7, "used": 1, "remaining": 6 },
    "annual": { "total": 15, "used": 0, "remaining": 15 }
  },
  "pending_leave_requests": 1,
  "recent_notifications": [
    {
      "id": 3,
      "message": "Your leave request has been approved.",
      "read_flag": false,
      "created_at": "2024-06-03T10:00:00Z"
    }
  ]
}
```

---

### 6.3 Get Notifications

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Route** | `/api/notifications` |
| **Authorization** | Any authenticated user |

**Query Parameters:** `page`, `limit`, `read` (boolean)

**Success Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 3,
      "message": "Your leave request has been approved.",
      "read_flag": false,
      "created_at": "2024-06-03T10:00:00Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 20, "total_pages": 1 }
}
```

---

### 6.4 Mark Notification as Read

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Route** | `/api/notifications/:id/read` |
| **Authorization** | Any authenticated user (own notifications only) |

**Request Body:** None

**Success Response `200 OK`:**
```json
{
  "message": "Notification marked as read."
}
```

**Error Responses:**
| Status | Error Code | Condition |
|---|---|---|
| `403` | `AUTH_FORBIDDEN` | Notification belongs to another user |
| `404` | `NOT_FOUND` | Notification not found |

---

### 6.5 Mark All Notifications as Read

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Route** | `/api/notifications/read-all` |
| **Authorization** | Any authenticated user |

**Success Response `200 OK`:**
```json
{
  "message": "All notifications marked as read.",
  "updated": 5
}
```

---

*End of HRMS API Contracts v1.0.0*
