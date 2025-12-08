"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, StudentProfile as ApiStudentProfileBase } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";

/* ---------------- Types ---------------- */
interface User {
  id: string;
  fullName: string;
  studentId?: string;   // make optional (older payloads may not include)
  department?: string;   // make optional
  email: string;
  isVerified?: boolean;
}

/** Extend backend StudentProfile type to also carry optional studentId/department if returned */
type ApiStudentProfile = ApiStudentProfileBase & {
  studentId?: string;
  department?: string;
};

/* ---------------- Form-only type (never stores nulls in inputs) ---------------- */
type StudentProfileForm = {
  session: string;
  roomNo: number | null; // allow empty in UI as null
  dob: string;            // UI keeps string ("" when empty)
  gender: string;
  bloodGroup: string;
  fatherName: string;
  motherName: string;
  mobileNumber: string;
  emergencyNumber: string;
  address: string;
  photoUrl?: string | null;
};

const EMPTY_FORM: StudentProfileForm = {
  session: "",
  roomNo: null,
  dob: "",
  gender: "",
  bloodGroup: "",
  fatherName: "",
  motherName: "",
  mobileNumber: "",
  emergencyNumber: "",
  address: "",
  photoUrl: null,
};

// Canonical "empty" API copy (for display)
const EMPTY_API_PROFILE: ApiStudentProfile = {
  session: "",
  roomNo: 0,
  dob: null,
  gender: "",
  bloodGroup: "",
  fatherName: "",
  motherName: "",
  mobileNumber: "",
  emergencyNumber: "",
  address: "",
  photoUrl: null,
  studentId: undefined,
  department: undefined,
};

/* ---------------- Normalizers ---------------- */
function normalizeApiProfile(p?: ApiStudentProfile | null): ApiStudentProfile {
  // Ensure we always hold a complete, non-undefined object in state
  return {
    session: p?.session ?? "",
    roomNo: typeof p?.roomNo === "number" ? p!.roomNo : 0,
    dob: p?.dob ?? null,
    gender: p?.gender ?? "",
    bloodGroup: p?.bloodGroup ?? "",
    fatherName: p?.fatherName ?? "",
    motherName: p?.motherName ?? "",
    mobileNumber: p?.mobileNumber ?? "",
    emergencyNumber: p?.emergencyNumber ?? "",
    address: p?.address ?? "",
    photoUrl: p?.photoUrl ?? null,
    // carry these if present from backend
    studentId: p?.studentId,
    department: p?.department,
  };
}

function normalizeToForm(p?: ApiStudentProfile | null): StudentProfileForm {
  if (!p) return { ...EMPTY_FORM };
  
  // Format date by removing time component if present
  let formattedDob = p.dob ?? "";
  if (formattedDob && formattedDob.includes('T')) {
    formattedDob = formattedDob.split('T')[0];
  }
  
  return {
    session: p.session ?? "",
    roomNo: p.roomNo === 0 ? null : p.roomNo ?? null,
    dob: formattedDob, // null -> ""
    gender: p.gender ?? "",
    bloodGroup: p.bloodGroup ?? "",
    fatherName: p.fatherName ?? "",
    motherName: p.motherName ?? "",
    mobileNumber: p.mobileNumber ?? "",
    emergencyNumber: p.emergencyNumber ?? "",
    address: p.address ?? "",
    photoUrl: p.photoUrl ?? null,
  };
}

/* ---------------- Convert form -> API update payload ---------------- */
function toUpdatePayload(form: StudentProfileForm) {
  return {
    session: form.session,
    roomNo: form.roomNo ?? 0,                  // backend default is 0
    dob: form.dob === "" ? null : form.dob,      // "" -> null
    gender: form.gender,
    bloodGroup: form.bloodGroup,
    fatherName: form.fatherName,
    motherName: form.motherName,
    mobileNumber: form.mobileNumber,
    emergencyNumber: form.emergencyNumber,
    address: form.address,
    // photoUrl is handled via upload endpoint
  };
}

export default function MyProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<ApiStudentProfile>(EMPTY_API_PROFILE);
  const [editForm, setEditForm] = useState<StudentProfileForm>(EMPTY_FORM);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Derived display helpers
  const displayRoom = useMemo(() => {
    const v = studentProfile.roomNo;
    return v === null || v === undefined || v === 0 ? "Not provided" : String(v);
  }, [studentProfile.roomNo]);

  useEffect(() => {
    const token = getStoredToken();
    const userData = getStoredUser();
    if (!token || !userData) {
      router.push("/");
      return;
    }
    setUser(userData);
    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // If your helper is authAPI.profile(token), switch to that.
      const profileData = await authAPI.getProfile(token); // typed: { user, student }
      const canonical = normalizeApiProfile(profileData?.student);
      setStudentProfile(canonical);

      // keep form in sync when not editing
      if (!isEditing) {
        setEditForm(normalizeToForm(canonical));
      }

      // Also refresh stored user with latest values if backend now includes student_id/department
      if (profileData?.user) {
        setUser((prev) => ({
          ...(prev || {}),
          ...profileData.user,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterEdit = () => {
    setEditForm(normalizeToForm(studentProfile));
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditForm(normalizeToForm(studentProfile));
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const token = getStoredToken();
      if (!token) throw new Error("No authentication token found");

      // 1) Skip API call if nothing changed
      const currentPayload = toUpdatePayload(normalizeToForm(studentProfile));
      const editedPayload = toUpdatePayload(editForm);

      const clean = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

      if (JSON.stringify(clean(currentPayload)) === JSON.stringify(clean(editedPayload))) {
        setIsEditing(false);
        setSuccessMessage("No changes to save.");
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      // 2) Attempt update; your helper signature might be (payload, token)
      await authAPI.updateProfile(editedPayload, token);

      // 3) Refresh canonical copy and finish nicely
      await fetchProfile(token);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Generic input change for form fields
  const handleInputChange = <K extends keyof StudentProfileForm>(
    field: K,
    value: StudentProfileForm[K]
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // Numeric/nullable handler for roomNo
  const handleRoomChange = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      handleInputChange("roomNo", null);
      return;
    }
    const n = Number(trimmed);
    handleInputChange("roomNo", Number.isFinite(n) ? n : null);
  };

  // Read-mode helper for DOB
  const dobValue = isEditing ? editForm.dob : (studentProfile.dob ?? "");
  
  // Format date for display (remove time component)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    // If it's an ISO datetime, extract just the date part
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };
  
  const displayDob = formatDate(studentProfile.dob);

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
    <div className="min-h-screen bg-black-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">
                View and manage your profile information
              </p>
            </div>
            {isEditing ? (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={handleEnterEdit}
                className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
              Profile Picture
            </h3>

            <div className="flex items-center gap-6">
              <ProfilePictureUpload
                currentPhotoUrl={studentProfile.photoUrl ?? undefined}
                onUploadSuccess={async (photoUrl) => {
                  // Update local state immediately
                  setStudentProfile((prev) => ({ ...prev, photoUrl: photoUrl }));
                  // Refetch profile to ensure data is in sync
                  const token = getStoredToken();
                  if (token) {
                    await fetchProfile(token);
                  }
                }}
              />

              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {user?.fullName || "User"}
                </h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  {(user?.studentId || studentProfile.studentId || "—")} • {(user?.department || studentProfile.department || "—")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information (immutable) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h3>

                <LabeledValue label="Full Name" value={user?.fullName || "Not provided"} />
                <LabeledValue
                  label="Student ID"
                  value={user?.studentId || studentProfile.studentId || "Not provided"}
                />
                <LabeledValue
                  label="Department"
                  value={user?.department || studentProfile.department || "Not provided"}
                />
                <LabeledValue label="Email" value={user?.email || "Not provided"} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.session}
                      onChange={(e) => handleInputChange("session", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 2023-24"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.session || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.roomNo ?? ""}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 101"
                      inputMode="numeric"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {displayRoom}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Personal Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {displayDob || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.gender || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.bloodGroup}
                      onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.bloodGroup || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fatherName}
                      onChange={(e) => handleInputChange("fatherName", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Father's full name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.fatherName || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.motherName}
                      onChange={(e) => handleInputChange("motherName", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mother's full name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.motherName || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., +880123456789"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {studentProfile.mobileNumber || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-width fields */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.emergencyNumber}
                    onChange={(e) => handleInputChange("emergencyNumber", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Emergency contact number"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {studentProfile.emergencyNumber || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Complete address"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900 min-h-[80px]">
                    {studentProfile.address || "Not provided"}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="p-3 bg-gray-50 rounded-lg text-gray-900">{value}</div>
    </div>
  );
}