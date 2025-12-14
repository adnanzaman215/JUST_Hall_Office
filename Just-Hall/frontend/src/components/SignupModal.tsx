"use client";
import React, { useState } from "react";
import { useUI } from "../context/ui-store";
import { useRouter } from "next/navigation";
import { authAPI } from "../lib/api";
import { storeToken, storeUser, validateEmail, validatePassword } from "../lib/auth";

export default function SignupModal() {
  const { isSignupOpen, closeSignup, openLogin } = useUI();
  const router = useRouter();

  // form state
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // registration submit handler
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!fullName || !studentId || !email || !pw || !cpw) {
        setError("All fields are required.");
        return;
      }

      // Validate department only for students
      if (role === "student" && !department) {
        setError("Department is required for students.");
        return;
      }

      // Validate university email format based on role
      let emailPattern: RegExp;
      let emailExample: string;
      
      if (role === "student") {
        emailPattern = /^[a-zA-Z0-9._-]+@student\.just\.edu\.bd$/;
        emailExample = "something@student.just.edu.bd";
      } else if (role === "staff") {
        emailPattern = /^[a-zA-Z0-9._-]+@staff\.just\.edu\.bd$/;
        emailExample = "something@staff.just.edu.bd";
      } else {
        emailPattern = /^[a-zA-Z0-9._-]+@teacher\.just\.edu\.bd$/;
        emailExample = "something@teacher.just.edu.bd";
      }
      
      if (!emailPattern.test(email)) {
        setError(`Please use your ${role} email address (e.g., ${emailExample})`);
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      const passwordValidation = validatePassword(pw);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || "Password validation failed.");
        return;
      }

      if (pw !== cpw) {
        setError("Passwords do not match.");
        return;
      }

      // Call registration API
      console.log('About to call authAPI.register with data:', {
        fullName: fullName,
        studentId: studentId,
        department,
        email,
        password: pw,
        role: "student",
      });
      
      const response = await authAPI.register({
        fullName: fullName,
        studentId: studentId,
        department,
        email,
        password: pw,
        role: role,
      });

      console.log('Registration response received:', response);

      // Store authentication data
      storeToken(response.token);
      
      // Merge role-specific data into user object
      const userWithRoleData = {
        ...response.user,
        full_name: response.user.full_name || fullName,
        student_id: response.user.student_id || studentId,
        department: response.user.department || (role === 'student' ? department : ''),
        role: role,
        student: response.student,
        staff: response.staff,
        admin: response.admin
      };
      
      storeUser(userWithRoleData);

      console.log("Registration successful:", response);
      console.log("Stored user data:", userWithRoleData);

      // Close modal and redirect to profile completion page
      closeSignup();
      router.push("/profile");
      
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle login link
  function handleLoginLink() {
    closeSignup();
    openLogin();
  }

  if (!isSignupOpen) return null;

  return (
    <>
      {/* Backdrop with blur + dim */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeSignup}
      />
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Student Registration"
      >
        <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
          {/* Left pane – brand/visual */}
          <div className="relative hidden md:block bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 text-white p-8">
            <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center mix-blend-overlay opacity-50" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold">Registration</h2>
              <p className="mt-2 text-white/85">
                Create your hall account to continue.
              </p>
              <p className="mt-10 text-xs text-white/70">
                Tip: Use your official university email.
              </p>
            </div>
          </div>

          {/* Right pane – form */}
          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Sign Up</h3>
              <button
                onClick={closeSignup}
                type="button"
                className="rounded-full border p-1.5 text-slate-500 hover:bg-slate-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                  placeholder="e.g., Md. Rahim Uddin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {role === "student" ? "Student ID *" : role === "staff" ? "Employee ID *" : "Admin ID *"}
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                  placeholder={role === "student" ? "e.g., 202012345" : role === "staff" ? "e.g., EMP-2021-001" : "e.g., ADMIN-001"}
                  required
                />
              </div>
              {role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="EEE">Electrical & Electronic Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                    <option value="BBA">Business Administration</option>
                    <option value="ENG">English</option>
                    <option value="MATH">Mathematics</option>
                    <option value="PHY">Physics</option>
                    <option value="CHEM">Chemistry</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                  placeholder={role === "student" ? "something@student.just.edu.bd" : role === "staff" ? "something@staff.just.edu.bd" : "something@teacher.just.edu.bd"}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={cpw}
                    onChange={(e) => setCpw(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
              ) : null}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSignup}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "Creating Account..." : "Register"}
                </button>
              </div>
            </form>

            {/* Small hint for login */}
            <p className="mt-4 text-xs text-slate-500">
              Already have an account? 
              <button 
                onClick={handleLoginLink}
                className="text-cyan-700 hover:text-cyan-800 font-medium ml-1 transition-colors duration-200"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}