# Seat Assignment Fix

## Problem

The seat assignment feature was failing because of a **database schema mismatch**:

- The `users_student.room_no` column was defined as `INT`
- But the backend code stores seat designations like **"230B1"**, **"230B2"**, **"230C1"**, **"230C2"**
- You cannot store strings in an INT column!

## Solution

Change the `users_student.room_no` column from `INT` to `VARCHAR(20)`.

## How to Apply the Fix

### Option 1: Run the PowerShell Script (Recommended)

```powershell
cd Just-Hall\backend
.\fix-room-column.ps1
```

The script will:
1. Locate your MySQL installation
2. Ask for your MySQL root password
3. Apply the database fix automatically

### Option 2: Run SQL Manually

1. Open **MySQL Workbench** or MySQL command line
2. Connect to the `justhall` database
3. Run this command:

```sql
USE justhall;

ALTER TABLE users_student 
MODIFY COLUMN room_no VARCHAR(20) NULL;
```

4. Verify the change:

```sql
DESCRIBE users_student;
```

You should see `room_no` as `varchar(20)` instead of `int`.

## After Applying the Fix

1. **Restart the backend server**:
   ```powershell
   cd Just-Hall\backend
   dotnet run
   ```

2. **Test seat assignment**:
   - Go to the manage-seat page
   - Select an approved applicant
   - Click on a room with available seats
   - Confirm the assignment

## What Changed

The following files were updated to prevent this issue in future setups:

- ✅ `database-setup.sql` - Initial schema now uses VARCHAR(20)
- ✅ `add-residence-status.sql` - Migration now uses VARCHAR(20)
- ✅ `fix-room-no-column.sql` - New fix script for existing databases
- ✅ `fix-room-column.ps1` - PowerShell script to apply the fix

## Technical Details

### Room Designation Format

Rooms are assigned with the following format:
- **230B1** = Room 230, Balcony, Seat 1
- **230B2** = Room 230, Balcony, Seat 2
- **230C1** = Room 230, Corridor, Seat 1
- **230C2** = Room 230, Corridor, Seat 2

Each room has 4 seats: 2 Balcony (B) and 2 Corridor (C).

### Backend Logic

The `SeatsController.AssignSeat()` method:
1. Finds the next available seat in the requested room
2. Creates a full designation (e.g., "230B1")
3. Updates both:
   - `student.RoomNo` in `users_student` table
   - `application.RoomNo` in `hallcore_application` table

Both columns must be VARCHAR(20) to store these designations.

## Troubleshooting

### Error: "MySQL not found"
- Install MySQL or add it to your PATH
- Or use Option 2 to run SQL manually

### Error: "Access denied"
- Check your MySQL root password
- Make sure MySQL server is running

### Still not working?
Check the backend server output for errors:
```powershell
cd Just-Hall\backend
dotnet run
```

Look for database-related error messages when trying to assign a seat.
