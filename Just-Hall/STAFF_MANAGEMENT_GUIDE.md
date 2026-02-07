# Staff Management & Role Request System - Complete Guide

## Overview
This guide documents the complete implementation of the Staff Management and Role Request/Approval Workflow system for the JUST Hall Office Management System.

---

## 🎯 Features Implemented

### 1. **Admin Staff Management Module**
Location: `/admin/staff`

**Features:**
- View all registered staff members in a professional table layout
- Real-time statistics dashboard showing:
  - Total staff count
  - Active staff count
  - Teaching staff count
  - Non-Teaching staff count
- Advanced filtering and search:
  - Search by name, email, or employee ID
  - Filter by staff type (Teaching, Non-Teaching, Administrative, Hall Staff)
  - Filter by status (Active, Inactive, On Leave, Suspended)
- Staff information display:
  - Profile photo
  - Full name and email
  - Employee ID
  - Staff type (color-coded badges)
  - Service role/designation
  - Status (color-coded badges)
  - Contact number
  - Joining date
- Quick actions:
  - View detailed staff information
  - Direct link to Role Requests management

**Access:** Admin users only

**Navigation:** 
- Admin dropdown menu → "Manage Staff"
- Direct URL: `http://localhost:3000/admin/staff`

---

### 2. **Role Request System (Staff Side)**
Location: Staff Profile Form (`/profile` for staff users)

**Features:**
- Read-only Service Role field (staff cannot directly edit)
- "Request Role" or "Request Change" button to submit role requests
- Request submission modal with:
  - Requested Role field (required)
  - Remarks field (optional)
  - Submit/Cancel buttons
- Real-time status display:
  - Shows "Pending" badge when request is awaiting review
  - Shows requested role name
  - Button disabled during pending requests
- Success/error message display
- Automatic refresh after submission

**Workflow:**
1. Staff opens their profile
2. Clicks "Request Role" button next to Service Role field
3. Fills in requested role (e.g., "Hall Provost", "Assistant Provost")
4. Optionally adds remarks explaining the request
5. Submits request
6. System shows pending status
7. Staff waits for admin approval

**Access:** Staff users only

---

### 3. **Role Request Management (Admin Side)**
Location: `/admin/role-requests`

**Features:**
- Comprehensive role requests dashboard
- Status filter tabs:
  - All requests
  - Pending requests (with count badge)
  - Approved requests (with count badge)
  - Rejected requests (with count badge)
- Request information table showing:
  - Staff name
  - Requested role
  - Status (color-coded badges)
  - Request date/time
  - Staff remarks (if provided)
- Action buttons for pending requests:
  - **Approve** (green button)
  - **Reject** (red button)
- Review modal with:
  - Staff details display
  - Requested role display
  - Original request remarks
  - Review remarks field (optional)
  - Confirm/Cancel buttons
- Reviewed requests show:
  - Review date
  - Review remarks (if provided)
- Auto-update of staff designation when approved

**Workflow:**
1. Admin navigates to Role Requests page
2. Views all pending requests
3. Clicks "Approve" or "Reject" on a request
4. Modal opens with request details
5. Admin optionally adds review remarks
6. Confirms decision
7. System updates:
   - Request status changes to Approved/Rejected
   - If approved, staff's designation automatically updates
   - Request moves to appropriate tab
   - Audit trail recorded (reviewed by, reviewed at, remarks)

**Access:** Admin users only

**Navigation:**
- Admin dropdown menu → "Role Requests"
- Admin Staff Management page → "Role Requests" button
- Direct URL: `http://localhost:3000/admin/role-requests`

---

## 🗄️ Database Schema

### Table: `staff_role_requests`

```sql
CREATE TABLE staff_role_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    requested_role VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    remarks TEXT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    review_remarks TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_staff_id (staff_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at),
    
    FOREIGN KEY (staff_id) REFERENCES users_staff(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users_user(id) ON DELETE SET NULL
);
```

**Fields:**
- `id` - Primary key
- `staff_id` - Foreign key to users_staff table
- `requested_role` - Role being requested (e.g., "Hall Provost")
- `status` - Request status: Pending, Approved, or Rejected
- `remarks` - Optional remarks from staff member
- `requested_at` - Timestamp when request was submitted
- `reviewed_by` - User ID of admin who reviewed (nullable)
- `reviewed_at` - Timestamp when request was reviewed (nullable)
- `review_remarks` - Optional remarks from reviewing admin
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

---

## 🔌 API Endpoints

### Staff Role Requests

#### 1. Submit Role Request
```
POST /api/role-requests
Authorization: Bearer {token}
Role: staff

Body:
{
    "requestedRole": "Hall Provost",
    "remarks": "Optional explanation" // nullable
}

Response:
{
    "success": true,
    "message": "Role request submitted successfully",
    "request": { ... }
}
```

#### 2. Get My Role Requests
```
GET /api/role-requests/my-requests
Authorization: Bearer {token}
Role: staff

Response:
{
    "roleRequests": [
        {
            "id": 1,
            "requestedRole": "Hall Provost",
            "status": "Pending",
            "remarks": "...",
            "requestedAt": "2026-02-07T10:30:00",
            ...
        }
    ]
}
```

#### 3. Get All Role Requests (Admin)
```
GET /api/role-requests?status=Pending
Authorization: Bearer {token}
Role: admin

Query Parameters:
- status (optional): Filter by Pending, Approved, or Rejected

Response:
{
    "requests": [
        {
            "id": 1,
            "staffId": 5,
            "staffName": "John Doe",
            "requestedRole": "Hall Provost",
            "status": "Pending",
            ...
        }
    ]
}
```

#### 4. Review Role Request (Admin)
```
PUT /api/role-requests/{id}/review
Authorization: Bearer {token}
Role: admin

Body:
{
    "status": "Approved", // or "Rejected"
    "reviewRemarks": "Optional review comments" // nullable
}

Response:
{
    "success": true,
    "message": "Role request approved successfully"
}

Note: When approved, staff designation is automatically updated
```

#### 5. Delete Role Request
```
DELETE /api/role-requests/{id}
Authorization: Bearer {token}
Role: staff

Constraints: Only pending requests can be deleted

Response:
{
    "success": true,
    "message": "Role request deleted successfully"
}
```

### Staff Management

#### Get All Staff Members (Admin)
```
GET /api/users/staff/all
Authorization: Bearer {token}
Role: admin

Response:
{
    "staff": [
        {
            "id": 1,
            "userId": 5,
            "employeeId": "EMP001",
            "staffType": "Teaching",
            "designation": "Hall Provost",
            "status": "Active",
            "joiningDate": "2024-01-15",
            "user": {
                "id": 5,
                "email": "staff@example.com",
                "fullName": "John Doe",
                "role": "staff"
            },
            ...
        }
    ]
}
```

---

## 🎨 UI Components

### Frontend Files Created/Modified

1. **`/admin/staff/page.tsx`** (NEW)
   - Complete staff management dashboard
   - Search and filtering functionality
   - Statistics cards
   - Professional table layout with badges

2. **`/admin/role-requests/page.tsx`** (NEW)
   - Role requests management interface
   - Status filtering tabs
   - Approve/reject modals
   - Real-time updates

3. **`/components/StaffProfileForm.tsx`** (MODIFIED)
   - Added read-only service role field
   - Implemented role request button
   - Created role request modal
   - Added pending status display
   - Integrated with API

4. **`/components/Navbar.tsx`** (MODIFIED)
   - Added "Manage Staff" link in admin dropdown
   - Added "Role Requests" link in admin dropdown
   - Organized admin menu items

### Backend Files Created/Modified

1. **`Models/StaffRoleRequest.cs`** (NEW)
   - Entity model with navigation properties
   - Audit trail fields

2. **`DTOs/RoleRequestDTOs.cs`** (NEW)
   - RoleRequestDto
   - CreateRoleRequestDto
   - ReviewRoleRequestDto
   - Response DTOs

3. **`Controllers/RoleRequestsController.cs`** (NEW)
   - Complete CRUD operations
   - Authorization checks
   - Auto-update logic for approvals

4. **`Controllers/UsersController.cs`** (MODIFIED)
   - Added GetAllStaff endpoint for admin

5. **`Data/ApplicationDbContext.cs`** (MODIFIED)
   - Added StaffRoleRequests DbSet
   - Configured entity relationships and indexes

---

## 🔐 Security & Authorization

### Role-Based Access Control

**Staff Users:**
- ✅ Can submit role requests
- ✅ Can view their own requests
- ✅ Can delete their pending requests
- ❌ Cannot approve/reject requests
- ❌ Cannot view other staff's requests
- ❌ Cannot directly edit service role

**Admin Users:**
- ✅ Can view all role requests
- ✅ Can approve/reject role requests
- ✅ Can view all staff members
- ✅ Can filter and search staff
- ❌ Cannot submit role requests (staff-only feature)

### Validation Rules

1. **Request Submission:**
   - Must be authenticated as staff
   - Requested role is required
   - Cannot submit if pending request exists

2. **Request Review:**
   - Must be authenticated as admin
   - Only pending requests can be reviewed
   - Status must be "Approved" or "Rejected"

3. **Request Deletion:**
   - Must be authenticated as staff
   - Only pending requests can be deleted
   - Cannot delete reviewed requests

---

## 📊 Status Badges & Color Coding

### Request Status
- 🟡 **Pending** - Yellow/Amber badge
- 🟢 **Approved** - Green badge
- 🔴 **Rejected** - Red badge

### Staff Type
- 🔵 **Teaching** - Blue badge
- 🟣 **Non-Teaching** - Purple badge
- 🔷 **Administrative** - Indigo badge
- 🔶 **Hall Staff** - Cyan badge

### Staff Status
- 🟢 **Active** - Green badge
- ⚪ **Inactive** - Gray badge
- 🟡 **OnLeave** - Amber badge
- 🔴 **Suspended** - Red badge

---

## 🚀 Testing Guide

### Test as Staff User

1. **Login as staff member:**
   - Email: `rahim@staff.just.edu.bd` or any staff account
   
2. **Navigate to Profile:**
   - Click profile dropdown → "My Profile"
   - Click "Edit Profile" button
   
3. **Test Role Request:**
   - Locate "Service Role" field (should be read-only)
   - Click "Request Role" button
   - Fill in requested role (e.g., "Hall Provost")
   - Optionally add remarks
   - Click "Submit Request"
   - Verify success message appears
   - Verify button now shows "Pending"
   - Verify pending status message appears

### Test as Admin User

1. **Login as admin:**
   - Email: `admin@admin.com` or any admin account
   
2. **Access Staff Management:**
   - Click profile dropdown → "Manage Staff"
   - Verify all staff members are displayed
   - Test search functionality
   - Test filters (staff type, status)
   - Check statistics cards
   
3. **Access Role Requests:**
   - Click profile dropdown → "Role Requests"
   - OR click "Role Requests" button on Staff Management page
   - Verify pending requests are shown
   - Click on status tabs (All, Pending, Approved, Rejected)
   
4. **Approve/Reject Request:**
   - Click "Approve" or "Reject" on a pending request
   - Verify modal opens with request details
   - Add review remarks (optional)
   - Click confirm button
   - Verify success message
   - Verify request moves to appropriate tab
   - *If approved:* Go to Staff Management → Verify designation updated

---

## 🔄 Workflow Diagrams

### Staff Role Request Flow
```
Staff Login
    │
    ├─> Navigate to Profile
    │
    ├─> Click "Request Role" button
    │
    ├─> Fill request form (role + optional remarks)
    │
    ├─> Submit request
    │
    ├─> System creates record with status="Pending"
    │
    ├─> Staff sees pending badge
    │
    └─> Wait for admin review
```

### Admin Review Flow
```
Admin Login
    │
    ├─> Navigate to "Role Requests"
    │
    ├─> View all pending requests
    │
    ├─> Select a request
    │
    ├─> Choose Approve or Reject
    │
    ├─> Add review remarks (optional)
    │
    ├─> Confirm decision
    │
    ├─> System updates:
    │   ├─> Request status → Approved/Rejected
    │   ├─> ReviewedBy → Admin User ID
    │   ├─> ReviewedAt → Current timestamp
    │   └─> IF Approved: Staff designation → Requested Role
    │
    └─> Staff sees updated role on their profile
```

---

## 💡 Usage Scenarios

### Scenario 1: New Staff Member Requesting First Role
```
1. New staff member "Dr. Ahmed" registers account
2. Completes profile (designation field empty)
3. Clicks "Request Role" button
4. Requests "Hall Provost" with remark: "10 years experience"
5. Admin reviews and approves
6. Dr. Ahmed's designation automatically becomes "Hall Provost"
```

### Scenario 2: Staff Member Requesting Role Change
```
1. Existing staff "Mr. Rahman" has designation "Assistant Provost"
2. Clicks "Request Change" button
3. Requests "Senior Assistant Provost"
4. Admin reviews and rejects with remark: "Position not available"
5. Mr. Rahman sees rejection and existing designation remains unchanged
```

### Scenario 3: Admin Managing Multiple Requests
```
1. Admin sees 5 pending role requests
2. Filters by staff type "Teaching"
3. Reviews each request individually
4. Approves 3 requests, rejects 2
5. All approved staff see updated designations immediately
```

---

## 🐛 Troubleshooting

### Issue: Role request button not visible
**Solution:** Ensure you're logged in as a staff user and viewing the profile form, not the view-only page.

### Issue: Cannot submit request
**Solution:** Check if you already have a pending request. Only one pending request allowed at a time.

### Issue: Admin cannot see role requests
**Solution:** Verify you're logged in as admin role. Check browser console for API errors.

### Issue: Designation not updating after approval
**Solution:** Check database foreign keys are correct. Verify StaffId matches in both tables.

---

## 📝 Notes

- Only **one pending request** per staff member is allowed at a time
- Requests are **automatically ordered** by newest first
- **Audit trail** is maintained for all approvals/rejections
- Service role field is **read-only** to enforce approval workflow
- Staff can **delete their pending requests** if they change their mind
- **Email notifications** can be added in future updates

---

## 🎓 Best Practices

1. **For Staff:**
   - Provide clear remarks explaining why you need the role
   - Wait for review before submitting another request
   - Check notification for approval status

2. **For Admins:**
   - Review requests promptly to avoid delays
   - Provide constructive feedback in review remarks
   - Use filters to efficiently manage large volumes
   - Verify staff credentials before approving sensitive roles

---

## 📞 Support

For issues or questions:
- Check this guide first
- Review API documentation above
- Check browser console for errors
- Verify authentication token is valid
- Ensure database migrations are applied

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0  
**System:** JUST Hall Office Management System
