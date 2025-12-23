# Seat Management System - Implementation Summary

## Overview
The seat management system allows administrators to assign hall seats to approved students. The system provides a visual interface showing floor maps with rooms and individual seats.

## System Architecture

### Hall Configuration
- **Rooms per floor**: 28 rooms
- **Seats per room**: 4 seats
- **Total seats per floor**: 112 seats (28 × 4)
- **Room layout**: 7 columns × 4 rows grid
- **Seat layout per room**: 2 × 2 grid

## Backend Implementation

### 1. Database Model
**File**: `backend/Models/SeatAllocation.cs`

```csharp
[Table("seat_allocations")]
public class SeatAllocation
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Required]
    [Column("floor_number")]
    public int FloorNumber { get; set; }
    
    [Required]
    [Column("room_number")]
    public int RoomNumber { get; set; }
    
    [Required]
    [Column("seat_number")]
    public int SeatNumber { get; set; }
    
    [Required]
    [Column("application_id")]
    public int ApplicationId { get; set; }
    
    [Column("assigned_at")]
    public DateTime AssignedAt { get; set; }
    
    [ForeignKey("ApplicationId")]
    public Application? Application { get; set; }
}
```

### 2. DTOs
**File**: `backend/DTOs/SeatDTOs.cs`

- **SeatAllocationDto**: Response object with student details
- **AssignSeatRequest**: Request object for seat assignment
- **RoomInfoDto**: Room information with occupancy status
- **FloorMapDto**: Complete floor map with all rooms

### 3. API Controller
**File**: `backend/Controllers/SeatsController.cs`

#### Endpoints:

1. **GET** `/api/seats/approved-applicants`
   - Returns list of approved students without seat assignments
   - Used to populate the sidebar in the UI

2. **GET** `/api/seats/floor/{floorNumber}`
   - Returns complete floor map with room and seat occupancy
   - Includes student details for occupied seats
   - Returns data for all 28 rooms on the specified floor

3. **POST** `/api/seats/assign`
   - Assigns a seat to a student
   - Validates:
     - Seat number (1-4)
     - Room number (1-28)
     - Application status (must be "Approved")
     - Student doesn't already have a seat
     - Seat is not already occupied
   
4. **GET** `/api/seats/{id}`
   - Get specific seat allocation details

5. **DELETE** `/api/seats/{id}`
   - Remove a seat allocation

6. **GET** `/api/seats/statistics`
   - Returns overall statistics
   - Occupied seats count
   - Approved students without seats
   - Per-floor statistics

### 4. Database Migration
**Migration**: `20251223041547_AddSeatAllocations`

Created `seat_allocations` table with:
- Auto-incrementing ID
- Floor, room, and seat numbers
- Foreign key to `hallcore_application`
- Assignment timestamp
- Index on application_id
- Cascade delete

## Frontend Implementation

### 1. Manage Seats Page
**File**: `frontend/src/app/hall-portal/manage-seat/page.tsx`

#### Layout:
```
┌─────────────────────────────────────────────────────┐
│                    Header / Back Button              │
├───────────────┬─────────────────────────────────────┤
│               │   Floor Selector (1-5)               │
│   Approved    ├─────────────────────────────────────┤
│   Students    │                                      │
│   Sidebar     │   Room Grid (7 × 4)                  │
│               │   Each room: 2 × 2 seat layout       │
│   (Clickable) │                                      │
│               │   Legend: Green = Available          │
│               │          Red = Occupied              │
└───────────────┴─────────────────────────────────────┘
```

#### Features:

1. **Student Sidebar** (Left)
   - Shows all approved students without seats
   - Displays profile photo, name, student ID, department
   - Click to select a student for assignment
   - Selected student highlighted in blue

2. **Floor Selector**
   - Buttons for floors 1-5
   - Active floor highlighted with gradient
   - Shows occupancy statistics for selected floor

3. **Room Grid**
   - 28 rooms displayed in 7 × 4 grid
   - Each room shows:
     - Room number
     - Occupancy count (e.g., "2/4")
     - 4 seats in 2 × 2 layout
   
4. **Seat Buttons**
   - Green: Available seat (clickable)
   - Red: Occupied seat
   - Clicking occupied seat shows student info
   - Clicking available seat opens assignment modal

5. **Assignment Modal**
   - Shows selected floor, room, and seat
   - Displays selected student details
   - Confirm or cancel assignment
   - Validates student selection

#### User Flow:
1. Admin selects a floor
2. System loads and displays all 28 rooms on that floor
3. Admin clicks on an available (green) seat
4. Admin selects a student from the sidebar
5. Admin confirms assignment
6. System validates and creates assignment
7. UI refreshes to show updated occupancy

### 2. Dashboard Integration
**File**: `frontend/src/app/hall-portal/page.tsx`

- Added router import and initialization
- Made "Manage Seats" button clickable
- Button navigates to `/hall-portal/manage-seat`
- Card shows features:
  - Allocate seats to students
  - Monitor seat availability
  - Update seat assignments

## API Integration

### Base URL
```
http://localhost:8000/api/seats
```

### Example Requests:

#### Get Approved Applicants
```javascript
GET http://localhost:8000/api/seats/approved-applicants
Response: [
  {
    id: 1,
    fullName: "John Doe",
    studentId: "2021001",
    department: "Computer Science",
    session: "2021-22",
    profilePhotoUrl: "/media/profile_photos/john.jpg",
    email: "john@example.com",
    mobile: "01712345678"
  }
]
```

#### Get Floor Map
```javascript
GET http://localhost:8000/api/seats/floor/1
Response: {
  floorNumber: 1,
  totalRooms: 28,
  occupiedRooms: 5,
  totalSeats: 112,
  occupiedSeats: 15,
  rooms: [
    {
      floorNumber: 1,
      roomNumber: 1,
      occupiedSeats: 2,
      availableSeats: 2,
      allocations: [
        {
          id: 1,
          floorNumber: 1,
          roomNumber: 1,
          seatNumber: 1,
          applicationId: 5,
          studentName: "John Doe",
          studentId: "2021001",
          department: "CSE",
          profilePhotoUrl: "/media/profile_photos/john.jpg",
          assignedAt: "2024-01-15T10:30:00Z"
        }
      ]
    },
    // ... 27 more rooms
  ]
}
```

#### Assign Seat
```javascript
POST http://localhost:8000/api/seats/assign
Body: {
  floorNumber: 1,
  roomNumber: 5,
  seatNumber: 3,
  applicationId: 10
}
Response: {
  id: 25,
  floorNumber: 1,
  roomNumber: 5,
  seatNumber: 3,
  applicationId: 10,
  studentName: "Jane Smith",
  studentId: "2021002",
  department: "EEE",
  profilePhotoUrl: "/media/profile_photos/jane.jpg",
  assignedAt: "2024-01-15T11:00:00Z"
}
```

## Validation Rules

### Backend Validation:
1. **Seat number**: Must be 1-4
2. **Room number**: Must be 1-28
3. **Application status**: Must be "Approved"
4. **Duplicate check**: Student cannot have multiple seats
5. **Occupancy check**: Seat must not already be occupied
6. **Application exists**: Application ID must be valid

### Frontend Validation:
1. Student must be selected before assignment
2. Visual feedback for occupied vs available seats
3. Error messages displayed via alerts
4. UI refreshes after successful assignment

## Color Scheme

### Matches site theme:
- **Primary gradient**: Teal → Cyan → Blue
- **Background**: Slate-50 → Blue-50 → White gradient
- **Available seats**: Green (hover: darker green)
- **Occupied seats**: Red
- **Selected items**: Blue
- **Success state**: Green
- **Warning state**: Yellow

## Database Schema

### seat_allocations table
```sql
CREATE TABLE seat_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  floor_number INT NOT NULL,
  room_number INT NOT NULL,
  seat_number INT NOT NULL,
  application_id INT NOT NULL,
  assigned_at DATETIME(6) NOT NULL,
  FOREIGN KEY (application_id) 
    REFERENCES hallcore_application(id) 
    ON DELETE CASCADE,
  INDEX idx_application_id (application_id)
);
```

## Testing Checklist

- [x] Backend builds successfully
- [x] Database migration applied
- [x] API endpoints accessible
- [ ] Test approved applicants endpoint
- [ ] Test floor map endpoint with different floors
- [ ] Test seat assignment (success case)
- [ ] Test validation (duplicate assignment)
- [ ] Test validation (occupied seat)
- [ ] Test validation (invalid seat/room numbers)
- [ ] Frontend page loads
- [ ] Student list displays correctly
- [ ] Floor selector works
- [ ] Room grid displays correctly
- [ ] Seat colors display correctly
- [ ] Assignment modal works
- [ ] Assignment completes successfully
- [ ] UI refreshes after assignment
- [ ] Navigation from dashboard works

## Future Enhancements

1. **Seat Reassignment**
   - Allow moving students between seats
   - Track seat change history

2. **Room Information**
   - Room amenities (AC, balcony, etc.)
   - Room type (corner, facing, etc.)

3. **Bulk Operations**
   - Import seat assignments from Excel
   - Export current allocations
   - Auto-assign based on criteria

4. **Advanced Filtering**
   - Filter students by department
   - Filter students by session
   - Search by student ID/name

5. **Visual Enhancements**
   - Actual floor plan images
   - Drag-and-drop assignment
   - Seat heatmap (usage over time)

6. **Notifications**
   - Email student when seat assigned
   - SMS notification
   - Portal notification

7. **Reports**
   - Occupancy reports by floor
   - Department-wise distribution
   - Session-wise allocation stats

8. **Seat History**
   - Track previous occupants
   - Maintenance history
   - Vacancy history

## Files Modified/Created

### Backend:
- ✅ `Models/SeatAllocation.cs` (created)
- ✅ `DTOs/SeatDTOs.cs` (created)
- ✅ `Controllers/SeatsController.cs` (created)
- ✅ `Data/ApplicationDbContext.cs` (modified - added DbSet)
- ✅ `Migrations/20251223041547_AddSeatAllocations.cs` (created)

### Frontend:
- ✅ `src/app/hall-portal/manage-seat/page.tsx` (created)
- ✅ `src/app/hall-portal/page.tsx` (modified - added navigation)

## How to Use

### For Administrators:

1. **Access the Page**
   - Log in as admin
   - Click "Manage Seats" from the Hall Portal dashboard

2. **Select Floor**
   - Click on floor buttons (1-5)
   - View occupancy statistics

3. **View Room Status**
   - Green seats = available
   - Red seats = occupied
   - Room number and occupancy shown

4. **Assign a Seat**
   - Click a student from the left sidebar
   - Click an available (green) seat
   - Confirm assignment in modal

5. **View Occupied Seat Details**
   - Click on red (occupied) seat
   - See student information in alert

## Troubleshooting

### Seat not assigning:
- Check student is approved
- Verify seat is not occupied
- Check student doesn't already have a seat
- View browser console for errors

### Students not showing:
- Verify applications are approved
- Check backend API is running
- Verify database connection

### Floor map not loading:
- Check backend is running on port 8000
- Verify migration was applied
- Check browser network tab for errors
