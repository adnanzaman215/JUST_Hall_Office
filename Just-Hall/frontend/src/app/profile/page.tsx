"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { getStoredToken, getStoredUser, storeUser } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";
import ClearCacheButton from "@/components/ClearCacheButton";
import StudentProfileForm from "@/components/StudentProfileForm";
import StaffProfileForm from "@/components/StaffProfileForm";
import AdminProfileForm from "@/components/AdminProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuth();

  const [role, setRole] = useState("");
  const [initialData, setInitialData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check authentication and pre-fill user data
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    console.log('Profile page loaded. Token:', token);
    console.log('User object:', user);
    
    if (!token || !user) {
      console.log('No token or user found, redirecting to login');
      router.push('/');
      return;
    }

    // Set role from stored user
    const userRole = user.role || "student";
    setRole(userRole.toLowerCase());

    // Fetch profile data from API
    fetchProfileData(token, user, userRole);
  }, [router]);

  const fetchProfileData = async (token: string, user: any, userRole: string) => {
    try {
      setLoading(true);
      
      // Fetch fresh profile data from backend
      const profileData = await authAPI.getProfile(token);
      console.log('Fetched profile data:', profileData);

      // Prepare initial data based on profile response
      const data: any = {
        fullName: user.fullName || user.full_name || "",
        email: user.email || "",
        role: userRole,
      };

      // Add role-specific data from API response
      if (userRole.toLowerCase() === "student" && profileData?.student) {
        data.studentId = profileData.student.studentId || "";
        data.department = profileData.student.department || "";
        data.session = profileData.student.session || "";
        data.roomNo = profileData.student.roomNo;
        data.dob = profileData.student.dob || "";
        data.gender = profileData.student.gender || "";
        data.bloodGroup = profileData.student.bloodGroup || "";
        data.fatherName = profileData.student.fatherName || "";
        data.motherName = profileData.student.motherName || "";
        data.mobileNumber = profileData.student.mobileNumber || "";
        data.emergencyNumber = profileData.student.emergencyNumber || "";
        data.address = profileData.student.address || "";
        data.photoUrl = profileData.student.photoUrl || null;
      } else if (userRole.toLowerCase() === "staff" && profileData?.staff) {
        data.employeeId = profileData.staff.employeeId || "";
        data.department = profileData.staff.department || "";
        data.designation = profileData.staff.designation || "";
        data.dob = profileData.staff.dob || "";
        data.gender = profileData.staff.gender || "";
        data.bloodGroup = profileData.staff.bloodGroup || "";
        data.qualification = profileData.staff.qualification || "";
        data.mobileNumber = profileData.staff.mobileNumber || "";
        data.emergencyNumber = profileData.staff.emergencyNumber || "";
        data.address = profileData.staff.address || "";
        data.photoUrl = profileData.staff.photoUrl || null;
      } else if (userRole.toLowerCase() === "admin" && profileData?.admin) {
        data.adminId = profileData.admin.adminId || "";
        data.department = profileData.admin.department || "";
        data.designation = profileData.admin.designation || "";
        data.dob = profileData.admin.dob || "";
        data.gender = profileData.admin.gender || "";
        data.mobileNumber = profileData.admin.mobileNumber || "";
        data.address = profileData.admin.address || "";
        data.photoUrl = profileData.admin.photoUrl || null;
      } else {
        // Fallback for users without complete profile data
        data.studentId = user.studentId || user.student_id || "";
        data.department = user.department || "";
      }

      setInitialData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  // Handle form submission
  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = getStoredToken();
    if (!token) {
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting profile data...');
      const response = await authAPI.completeProfileWithPhoto(formData, token);
      console.log('Profile completion response:', response);
      
      if (response.success) {
        setSuccessMessage(response.message || "Profile updated successfully!");
        
        // Update stored user data
        const currentUser = getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            isVerified: true,
          };
          storeUser(updatedUser);
          updateUser(updatedUser);
        }
        
        // Only redirect and logout for initial profile completion
        // If already verified, just stay on the page with success message
        if (!currentUser?.isVerified) {
          // Initial profile completion - redirect to login
          setTimeout(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            router.push('/?registration=complete');
          }, 2000);
        } else {
          // Profile edit - just refresh the data
          const token = getStoredToken();
          const user = getStoredUser();
          if (token && user) {
            setTimeout(() => {
              fetchProfileData(token, user, user.role || "student");
            }, 1500);
          }
        }
      } else {
        setError(response.message || "Failed to save the profile.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to save the profile.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Header */}
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold">
              {role === "student" ? "Student Profile" : role === "staff" ? "Staff Profile" : "Admin Profile"}
            </h1>
            <p className="mt-2 text-sky-100">Please complete your profile by filling in the details below.</p>
          </div>
          <div className="text-right">
            <ClearCacheButton />
            <p className="text-xs text-sky-200 mt-1">Clear cache if data not loading</p>
          </div>
        </div>
      </section>

      {/* Role-specific profile form */}
      {role === "student" && (
        <StudentProfileForm
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={loading}
          error={error}
          successMessage={successMessage}
        />
      )}

      {role === "staff" && (
        <StaffProfileForm
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={loading}
          error={error}
          successMessage={successMessage}
        />
      )}

      {role === "admin" && (
        <AdminProfileForm
          onSubmit={handleSubmit}
          initialData={initialData}
          loading={loading}
          error={error}
          successMessage={successMessage}
        />
      )}
    </main>
  );
}
