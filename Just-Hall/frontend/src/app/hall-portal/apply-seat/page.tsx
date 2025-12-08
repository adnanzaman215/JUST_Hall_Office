"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid file (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
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

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName || !studentId || !department || !session || !dob || !gender || !paymentSlipNo || !mobile || !email || !address || !fatherName || !motherName) {
      setError("⚠️ Please fill in all required fields.");
      return;
    }

    if (!paymentSlipFile) {
      setError("⚠️ Please upload a payment slip image.");
      return;
    }

    try {
      setLoading(true);

      // First, upload the payment slip file
      const formData = new FormData();
      formData.append('payment_slip', paymentSlipFile);

      const uploadRes = await fetch('/api/upload-payment-slip', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Failed to upload payment slip');
      }

      const uploadData = await uploadRes.json();
      const paymentSlipUrl = uploadData.paymentSlipUrl;

      // Then, create the application with the uploaded file URL
      const res = await fetch("http://localhost:8000/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          student_id: studentId,
          department,
          session,
          dob,
          gender,
          payment_slip_no: paymentSlipNo,
          payment_slip_url: paymentSlipUrl,
          mobile,
          email,
          address,
          father_name: fatherName,
          mother_name: motherName,
          father_occupation: fatherOccupation || null,
          mother_occupation: motherOccupation || null,
          household_income: householdIncome ? parseFloat(householdIncome) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit application");
      }
      
      setSuccess("✅ Application submitted successfully!");
      setTimeout(() => router.push("/hall-portal"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-extrabold">Hall Seat Application Form</h1>
        <p className="mt-2 text-sky-100">
          Please complete all sections of the form carefully. All fields marked with * are required.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md space-y-8"
      >
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
        <div className="border-b pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
            Personal Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="e.g. 210101"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="e.g. Computer Science"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="e.g. 2021-2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="e.g. 01712345678"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Permanent Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter your complete permanent address"
                required
              />
            </div>
          </div>
        </div>

        {/* Family Information Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
            Family Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter father's name"
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
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="e.g. Teacher, Business, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mother's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter mother's name"
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
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
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
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter annual household income in BDT"
                min="0"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">4</span>
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
                className="block w-full rounded-lg border-gray-300 border px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition"
                placeholder="Enter payment slip number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Payment Slip <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <label className="flex flex-col items-center px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200">
                  <div className="flex flex-col items-center space-y-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {paymentSlipFile ? (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-cyan-600">{paymentSlipFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Click to upload payment slip</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</p>
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
            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg hover:from-cyan-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </main>
  );
}
