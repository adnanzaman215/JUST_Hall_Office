"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";

export default function ApplySeatPage() {
  const router = useRouter();

  // State variables
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [session, setSession] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [paymentSlipNo, setPaymentSlipNo] = useState("");
  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [existingProfilePhotoUrl, setExistingProfilePhotoUrl] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Application status states
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [hasAllocatedRoom, setHasAllocatedRoom] = useState(false);
  const [allocatedRoomNo, setAllocatedRoomNo] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [residenceStatus, setResidenceStatus] = useState<string>("non-resident");

  // Check if student already has an application
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const user = getStoredUser();
        if (!user || !user.student_id) return;

        // Use the new check-status endpoint
        const response = await fetch(`http://localhost:8000/api/applications/check-status/${user.student_id}`);
        if (response.ok) {
          const result = await response.json();
          
          if (result.status === 'Pending') {
            setHasPendingApplication(true);
            setApplicationStatus('Pending');
          } else if (result.status === 'Approved') {
            setHasApprovedApplication(true);
            setApplicationStatus('Approved');
            setAllocatedRoomNo(result.roomNo || 'TBD');
          } else if (result.status === 'Rejected') {
            // Student can apply again
            setApplicationStatus('Rejected');
            setHasPendingApplication(false);
            setHasApprovedApplication(false);
          }
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      }
    };

    checkExistingApplication();
  }, []);

  // Pre-fill form with student profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = getStoredToken();
        const user = getStoredUser();
        
        if (!token || !user) {
          router.push('/');
          return;
        }

        // Fetch profile data
        const profileData = await authAPI.getProfile(token);
        
        console.log('Profile data received:', profileData);
        
        if (profileData?.student) {
          const student = profileData.student;
          const userInfo = profileData.user;
          
          // Pre-fill personal information
          setFullName(userInfo.fullName || "");
          setStudentId(student.studentId || "");
          setDepartment(student.department || "");
          setSession(student.session || "");
          setEmail(userInfo.email || "");
          
          // Pre-fill contact information
          setMobile(student.mobileNumber || "");
          setAddress(student.address || "");
          setFatherName(student.fatherName || "");
          setMotherName(student.motherName || "");
          
          // Pre-fill other details if available
          if (student.dob) {
            const dobDate = new Date(student.dob);
            const formattedDob = dobDate.toISOString().split('T')[0];
            setDob(formattedDob);
          }
          setGender(student.gender || "");
          
          // Set residence status
          setResidenceStatus(student.residenceStatus || "non-resident");
          
          // Check if student already has a room allocated in their profile
          if (student.roomNo) {
            setHasAllocatedRoom(true);
            setAllocatedRoomNo(student.roomNo.toString());
          }
          
          // Set existing profile photo URL if available
          if (student.photoUrl) {
            setExistingProfilePhotoUrl(student.photoUrl);
            // Also set the preview - photoUrl already includes 'profile_photos/' prefix from backend
            const photoUrl = student.photoUrl.startsWith('/') 
              ? `http://localhost:8000${student.photoUrl}` 
              : `http://localhost:8000/media/${student.photoUrl}`;
            setProfilePhotoPreview(photoUrl);
            console.log('📸 Profile photo URL:', photoUrl);
          }
        } else if (profileData?.user) {
          // If no student profile, at least pre-fill user info
          const userInfo = profileData.user;
          setFullName(userInfo.fullName || "");
          setEmail(userInfo.email || "");
          setStudentId(userInfo.studentId || "");
          setDepartment(userInfo.department || "");
        } else {
          console.warn('No profile data available');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [router]);

  // Handle payment slip file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid file (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setError('File size must be less than 1MB');
      return;
    }

    setPaymentSlipFile(file);
    setError(null);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPaymentSlipPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPaymentSlipPreview(null);
    }
  };

  // Handle profile photo selection
  const handleProfilePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (!file) return;

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG or PNG)');
      return;
    }

    // Validate file size (1MB max for profile photos)
    if (file.size > 1 * 1024 * 1024) {
      setError('Profile photo must be less than 1MB');
      return;
    }

    console.log('Setting profile photo...');
    setProfilePhoto(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Preview generated, length:', result?.length);
      setProfilePhotoPreview(result);
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setError('Failed to load image preview');
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Form submitted!');
    setError(null);
    setSuccess(null);

    console.log('Validating fields...');
    console.log({ fullName, studentId, department, session, dob, gender, paymentSlipNo, mobile, email, address, fatherName, motherName, userId, password });

    if (!fullName || !studentId || !department || !session || !dob || !gender || !paymentSlipNo || !mobile || !email || !address || !fatherName || !motherName || !userId || !password) {
      console.log('Validation failed: missing required fields');
      setError("⚠️ Please fill in all required fields.");
      return;
    }

    // Validate userId (alphanumeric, 4-20 characters)
    if (userId.length < 4 || userId.length > 20 || !/^[a-zA-Z0-9_]+$/.test(userId)) {
      console.log('Validation failed: invalid userId');
      setError("⚠️ User ID must be 4-20 characters long and contain only letters, numbers, and underscores.");
      return;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      console.log('Validation failed: password too short');
      setError("⚠️ Password must be at least 6 characters long.");
      return;
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@student\.just\.edu\.bd$/;
    if (!emailPattern.test(email)) {
      console.log('Validation failed: invalid email format. Email:', email);
      setError("⚠️ Email must be in the format: yourname@student.just.edu.bd");
      return;
    }

    if (!paymentSlipFile) {
      console.log('Validation failed: no payment slip file');
      setError("⚠️ Please upload a payment slip image.");
      return;
    }

    // Profile photo is required (either new upload or existing from profile)
    if (!profilePhoto && !existingProfilePhotoUrl) {
      console.log('Validation failed: no profile photo');
      setError("⚠️ Please upload your profile photo for verification.");
      return;
    }

    console.log('All validations passed, proceeding with submission...');

    try {
      setLoading(true);

      console.log('========== FORM SUBMISSION DEBUG ==========');
      console.log('Student ID being submitted:', studentId);
      console.log('Full Name:', fullName);
      console.log('Email:', email);

      // First, upload the payment slip file
      const formData = new FormData();
      formData.append('payment_slip', paymentSlipFile);

      console.log('📤 Uploading payment slip...');
      const uploadRes = await fetch('/api/upload-payment-slip', {
        method: 'POST',
        body: formData,
      });

      console.log('📨 Payment slip upload response status:', uploadRes.status);

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        console.error('❌ Payment slip upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload payment slip');
      }

      const uploadData = await uploadRes.json();
      console.log('✅ Payment slip uploaded:', uploadData);
      const paymentSlipUrl = uploadData.paymentSlipUrl;

      // Upload profile photo only if a new one is provided, otherwise use existing
      let profilePhotoUrl = existingProfilePhotoUrl;
      
      if (profilePhoto) {
        console.log('📤 Uploading profile photo...');
        const profileFormData = new FormData();
        profileFormData.append('profile_photo', profilePhoto);

        const profileUploadRes = await fetch('/api/upload-application-photo', {
          method: 'POST',
          body: profileFormData,
        });

        console.log('📨 Profile photo upload response status:', profileUploadRes.status);

        if (!profileUploadRes.ok) {
          const errorData = await profileUploadRes.json();
          console.error('❌ Profile photo upload failed:', errorData);
          throw new Error(errorData.error || 'Failed to upload profile photo');
        }

        const profileUploadData = await profileUploadRes.json();
        console.log('✅ Profile photo uploaded:', profileUploadData);
        profilePhotoUrl = profileUploadData.profilePhotoUrl;
      } else {
        console.log('ℹ️ Using existing profile photo:', existingProfilePhotoUrl);
      }

      // Then, create the application with the uploaded file URLs
      const requestBody = {
        FullName: fullName,
        StudentId: studentId,
        Department: department,
        Session: session,
        Dob: dob,
        Gender: gender,
        PaymentSlipNo: paymentSlipNo,
        PaymentSlipUrl: paymentSlipUrl,
        ProfilePhotoUrl: profilePhotoUrl,
        Mobile: mobile,
        Email: email,
        Address: address,
        FatherName: fatherName,
        MotherName: motherName,
        FatherOccupation: fatherOccupation || null,
        MotherOccupation: motherOccupation || null,
        HouseholdIncome: householdIncome ? parseFloat(householdIncome) : null,
        UserId: userId,
        Password: password,
      };
      
      console.log('📤 Submitting application to backend...');
      console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
      
      const res = await fetch("http://localhost:8000/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log('📨 Application submission response status:', res.status);
      console.log('📨 Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Application submission failed');
        console.error('❌ Response status:', res.status);
        console.error('❌ Response text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to submit application");
        } catch (parseError) {
          throw new Error(`Failed to submit application: ${res.status} ${errorText}`);
        }
      }
      
      const responseData = await res.json();
      console.log('✅ Application submitted successfully:', responseData);
      
      // Show success message and redirect to track application page with credentials
      setSuccess(`✅ Application submitted successfully! Save your credentials:\nUsername: ${userId}\nPassword: ${password}`);
      setTimeout(() => router.push("/hall-portal/track-application"), 3000);
    } catch (err: any) {
      console.error('❌ Submission error caught:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Full error:', err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while fetching profile data
  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile data...</p>
        </div>
      </main>
    );
  }

  // If student already has a room allocated in their profile, show allocation screen
  if (hasAllocatedRoom) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Room Already Allocated
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              You already have a room allocated to you in the hall.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-blue-600 font-semibold mb-2">YOUR ROOM NUMBER</p>
              <p className="text-5xl font-bold text-blue-700">{allocatedRoomNo}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Residence Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{residenceStatus}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="text-lg font-semibold text-gray-900">Resident</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              You cannot submit a new application as you already have an allocated room. If you have any concerns or need to change your room, please contact the hall administration.
            </p>
            <button
              onClick={() => router.push('/hall-portal')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Hall Portal
            </button>
          </div>
        </div>
      </main>
    );
  }

  // If student has a pending application, show please wait screen
  if (hasPendingApplication) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Your Application is Already Pending
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              You have already submitted an application. You cannot apply again until your current application is reviewed.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-blue-600 font-semibold mb-2">APPLICATION STATUS</p>
              <p className="text-3xl font-bold text-blue-700">Pending Review</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-600 mb-2">What happens next?</p>
              <ul className="text-left text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>The administration will review your application</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You will be notified of any updates via email</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>You can track your application status in the portal</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              You cannot submit another application while your current application is being reviewed. Please be patient.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/hall-portal/track-application')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Track Application
              </button>
              <button
                onClick={() => router.push('/hall-portal')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Portal
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If student has an approved application, show allocation status
  if (hasApprovedApplication) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Seat Already Allocated
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Congratulations! You have been allocated a room in the hall.
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <p className="text-sm text-blue-600 font-semibold mb-2">YOUR ROOM NUMBER</p>
              <p className="text-5xl font-bold text-blue-700">{allocatedRoomNo}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">Approved</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Residence Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{residenceStatus}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              You cannot submit another application as you already have an allocated room. If you have any concerns, please contact the hall administration.
            </p>
            <button
              onClick={() => router.push('/hall-portal')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Hall Portal
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-5">
        {/* Show notice if application was rejected */}
        {applicationStatus === 'Rejected' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your previous application was rejected. You can submit a new application.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Hall Seat Application Form
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Please complete all sections of the form carefully. All fields marked with <span className="text-red-500 font-semibold">*</span> are required.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Personal information pre-filled from your profile
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200 space-y-8"
        >
        {/* Header with Tracking Credentials and Profile Photo */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex justify-between items-start gap-8">
            {/* Left: Tracking Credentials */}
            <div className="flex-1 max-w-md">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Application Tracking Credentials</h3>
              <p className="text-sm text-slate-600 mb-4">Create credentials to track your application status later. These will be sent to your email.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UserName <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="block w-full max-w-xs rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Choose a username (4-20 characters)"
                    minLength={4}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_]+"
                    title="UserName must contain only letters, numbers, and underscores"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Use letters, numbers, and underscores only</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full max-w-xs rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Create a password (min 6 characters)"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
              </div>
            </div>

            {/* Right: Profile Photo */}
            <div className="flex-shrink-0">
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Profile Photo</h3>
              <label className="cursor-pointer group">
                <div className="relative">
                  {profilePhotoPreview ? (
                    <div className="relative w-32 h-32">
                      <img 
                        src={profilePhotoPreview} 
                        alt="Profile photo" 
                        className="w-32 h-32 object-cover rounded-full border-4 border-green-400 shadow-lg bg-white"
                        style={{ display: 'block' }}
                      />
                      {/* Success checkmark */}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-md z-20">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setProfilePhoto(null);
                          setProfilePhotoPreview(null);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md z-20"
                        title="Remove photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-100 transition-all">
                      <svg className="w-10 h-10 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-xs text-blue-600 font-semibold">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProfilePhotoSelect}
                  className="hidden"
                  required
                />
              </label>
              {profilePhoto ? (
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-green-600 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Photo uploaded
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[128px]">{profilePhoto.name}</p>
                </div>
              ) : existingProfilePhotoUrl ? (
                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-blue-600 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pre-filled from profile
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Click to change</p>
                </div>
              ) : (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">Required <span className="text-red-500">*</span></p>
                  <p className="text-xs text-gray-400">Max 1MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 text-sm shadow-md">1</span>
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={fullName}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={studentId}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={department}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={session}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="date"
                value={dob}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={gender}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 text-sm shadow-md">2</span>
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="tel"
                value={mobile}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                pattern="[a-zA-Z0-9._%+-]+@student\.just\.edu\.bd"
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Permanent Address <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <textarea
                value={address}
                readOnly
                disabled
                rows={3}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
          </div>
        </div>

        {/* Family Information Section */}
        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 text-sm shadow-md">3</span>
            Family Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Father's Name <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={fatherName}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Father's Occupation
              </label>
              <input
                type="text"
                value={fatherOccupation}
                onChange={(e) => setFatherOccupation(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="e.g. Teacher, Business, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mother's Name <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-blue-600">(From Profile)</span>
              </label>
              <input
                type="text"
                value={motherName}
                readOnly
                disabled
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-700 bg-gray-100 cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mother's Occupation
              </label>
              <input
                type="text"
                value={motherOccupation}
                onChange={(e) => setMotherOccupation(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="e.g. Housewife, Doctor, etc."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Household Income (Annual)
              </label>
              <input
                type="number"
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Enter annual household income in BDT"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="border-b border-slate-200 pb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 text-sm shadow-md">4</span>
            Payment Information
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Slip No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={paymentSlipNo}
                onChange={(e) => setPaymentSlipNo(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="Enter payment slip number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Payment Slip <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <label className="flex flex-col items-center px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {paymentSlipFile ? (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600">{paymentSlipFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Click to upload payment slip</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 1MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                  />
                </label>
                {paymentSlipPreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative">
                      <img 
                        src={paymentSlipPreview} 
                        alt="Payment slip preview" 
                        className="max-w-xs rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ maxHeight: '200px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlipFile(null);
                          setPaymentSlipPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => router.push("/hall-portal")}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
        </form>
      </div>
    </main>
  );
}
