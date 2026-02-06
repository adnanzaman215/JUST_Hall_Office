# Payment System Testing Guide

## Prerequisites

1. **Backend running**: `cd backend && dotnet run`
2. **Frontend running**: `cd frontend && npm run dev`
3. **Database**: MySQL running with migrations applied

## Testing Steps

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd Just-Hall/backend
dotnet run
```
Should see: `Now listening on: http://localhost:5062`

**Terminal 2 - Frontend:**
```bash
cd Just-Hall/frontend
npm run dev
```
Should see: `Local: http://localhost:3000`

### 2. Test Student Payment Flow

#### A. Login as Student
1. Go to http://localhost:3000
2. Click "Login" in the navbar
3. Login with student credentials
4. Navigate to Hall Portal

#### B. Access Payment Page
1. In Hall Portal, you should see **"Hall Fee Payments"** card
2. Click **"Make Payment"** button
3. Should navigate to `/hall-portal/payments`

#### C. View Payment Dues
1. **Payment Dues tab** shows:
   - Current year payment status
   - Required amount: ৳15,000
   - Paid amount
   - Due amount
   - Status badge (Paid/Due)

#### D. Upload Payment Receipt
1. Click **"Upload Receipt"** tab
2. Fill in the form:
   - Payment Type: Yearly Fee
   - Amount: 15000
   - Payment Year: 2026
   - Bank Name: e.g., "Sonali Bank"
   - Transaction ID: e.g., "TXN123456789"
   - Payment Date: Select date
   - Receipt file: Upload PDF/JPG/PNG
3. Click **"Submit Payment Receipt"**
4. Should see success message: "Payment submitted successfully! Waiting for verification."
5. Automatically switches to "Payment History" tab

#### E. View Payment History
1. **Payment History tab** displays:
   - All your payments
   - Status badges (Pending/Verified/Rejected)
   - Payment details
   - View Receipt link
   - Verification information

### 3. Test Staff Payment Verification Flow

#### A. Login as Staff/Admin
1. Logout from student account
2. Login with staff credentials
3. Navigate to Hall Portal

#### B. Access Verification Page
1. In Hall Portal (Admin view), you should see **"Verify Payments"** card
2. Click **"Verify Payments"** button
3. Should navigate to `/hall-portal/verify-payments`

#### C. View Payment Dashboard
1. **Summary Cards** show:
   - Total Payments
   - Pending Payments
   - Verified Payments
   - Rejected Payments

#### D. Filter Payments
1. Use filter buttons:
   - All
   - Pending
   - Verified
   - Rejected

#### E. Verify/Reject Payment
1. Find a pending payment
2. Click **"View Receipt"** to see the uploaded file
3. Options:
   - Click **"Approve"** → Confirm approval
   - Click **"Reject"** → Enter rejection reason → Confirm

#### F. Verify Success
1. After approval/rejection, payment status updates immediately
2. Success message appears
3. Summary cards update
4. Student will see updated status in their payment history

## Common Issues & Solutions

### Issue 1: "Student profile not found"
**Solution**: 
- User needs to complete their student profile first
- Go to Profile section and fill in all required information

### Issue 2: Can't see payment buttons
**Solution**:
- Clear browser cache
- Logout and login again
- Check user role (Student vs Staff)

### Issue 3: Receipt file not uploading
**Solution**:
- Check file size (should be < 10MB)
- Use supported formats: PDF, JPG, JPEG, PNG
- Check backend media folder permissions

### Issue 4: CORS errors in console
**Solution**:
- Verify backend is running on port 5062
- Check appsettings.json includes frontend URL
- Restart backend server

### Issue 5: 401 Unauthorized
**Solution**:
- Token may have expired
- Logout and login again
- Check JWT configuration in backend

## API Endpoints Reference

### Student Endpoints
- `GET /api/payments/dues` - Get payment dues
- `GET /api/payments/my-payments` - Get payment history
- `POST /api/payments/create` - Submit payment receipt

### Staff/Admin Endpoints
- `GET /api/payments/all` - Get all payments (with filters)
- `GET /api/payments/summary` - Get payment statistics
- `POST /api/payments/verify` - Verify/reject payment

### Common Endpoints
- `GET /api/payments/{id}` - Get specific payment details

## File Locations

### Backend
- Controller: `backend/Controllers/PaymentsController.cs`
- Model: `backend/Models/Payment.cs`
- DTOs: `backend/DTOs/PaymentDTOs.cs`
- Upload folder: `backend/media/payment_receipts/`

### Frontend
- Student page: `frontend/src/app/hall-portal/payments/page.tsx`
- Staff page: `frontend/src/app/hall-portal/verify-payments/page.tsx`
- Portal hub: `frontend/src/app/hall-portal/page.tsx`
- Auth context: `frontend/src/context/auth-context.tsx`

## Expected Behavior

### For Students:
✅ Can upload payment receipts with bank details
✅ Can view payment status (Pending/Verified/Rejected)
✅ Can see payment history
✅ Can view payment dues for current year
✅ Can see rejection reasons if payment rejected

### For Staff/Admin:
✅ Can view all student payments
✅ Can filter by status
✅ Can view receipt files
✅ Can approve payments
✅ Can reject payments with reasons
✅ Can view payment statistics

## Testing Checklist

- [ ] Backend server running on port 5062
- [ ] Frontend server running on port 3000
- [ ] Database migrations applied
- [ ] Can login as student
- [ ] Can see "Hall Fee Payments" card in student portal
- [ ] Can access `/hall-portal/payments` page
- [ ] Can upload payment receipt
- [ ] Can view payment history
- [ ] Can login as staff/admin
- [ ] Can see "Verify Payments" card in admin portal
- [ ] Can access `/hall-portal/verify-payments` page
- [ ] Can filter payments by status
- [ ] Can view receipt files
- [ ] Can approve payment
- [ ] Can reject payment with reason
- [ ] Student sees updated status after verification

## Success Indicators

1. **No console errors** in browser developer tools
2. **API calls return 200 OK** status
3. **Receipt files** are saved in `backend/media/payment_receipts/`
4. **Database records** created in `payments_payment` table
5. **Real-time updates** after verification
6. **File uploads** working correctly
7. **Authentication** working properly

If all checklist items pass, the payment system is fully connected and operational! 🎉
