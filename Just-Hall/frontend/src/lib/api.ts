// src/lib/api.ts

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "http://localhost:8000/api";
const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

function join(base: string, endpoint: string) {
  const e = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${e}`;
}

/* ================== TYPES ================== */

export interface StudentProfile {
  session: string;
  roomNo: number;               // backend uses integer (0 default)
  dob: string | null;            // "YYYY-MM-DD" or null
  gender: string;
  bloodGroup: string;
  fatherName: string;
  motherName: string;
  mobileNumber: string;
  emergencyNumber: string;
  address: string;
  photoUrl?: string | null;     // ImageField URL or null
}

export type StudentProfileUpdate =
  Partial<Omit<StudentProfile, "dob">> & { dob?: string | null };

export interface ProfileResponse {
  student: StudentProfile | null;
}

export interface AuthUser {
  id: string | number;
  email: string;
  fullName?: string;
  studentId?: string;
  department?: string;
  isVerified?: boolean;
  student?: StudentProfile | null;
}

export interface AuthTokensResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface UploadPhotoResponse {
  photoUrl: string;
}

/* ================== CORE REQUEST ================== */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = join(API_BASE_URL, endpoint);

  const config: RequestInit = {
    credentials: options.credentials ?? "omit",
    mode: options.mode ?? "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, config);
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  const parseJSON = () => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  };

  if (!contentType.includes("application/json")) {
    const snippet = text.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(
      `Non-JSON response ${res.status} from ${url}. First bytes: ${snippet}`
    );
  }

  const data = parseJSON();

  if (!res.ok) {
    let msg =
      (data && (data.detail || data.error || data.message)) ||
      `HTTP ${res.status} at ${url}`;

    if (
      data &&
      typeof data === "object" &&
      !("detail" in data) &&
      !("error" in data) &&
      !("message" in data)
    ) {
      const parts: string[] = [];
      for (const [key, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          parts.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          parts.push(`${key}: ${val}`);
        }
      }
      if (parts.length) msg = parts.join(" | ");
    }
    throw new Error(msg);
  }

  return data as T;
}

/* Small helper that tries a sequence of fetch attempts and returns the first success */
async function tryJsonSequence<T>(attempts: Array<() => Promise<Response>>): Promise<T> {
  const errors: string[] = [];
  for (const attempt of attempts) {
    const res = await attempt();
    const ct = res.headers.get("content-type") || "";
    const body = await res.text();

    if (res.ok) {
      if (!body) return null as unknown as T;
      if (!ct.includes("application/json")) {
        // success but non-JSON? try to parse safest; else throw
        try { return JSON.parse(body) as T; } catch {
          throw new Error("Success but non-JSON response from server.");
        }
      }
      return JSON.parse(body) as T;
    }

    // collect a readable error and continue to next attempt on 404/405
    const snippet = body.slice(0, 200).replace(/\s+/g, " ");
    errors.push(`${res.status} ${res.statusText} (ct=${ct}) ${snippet}`);
    if (![404, 405].includes(res.status)) {
      // not a route/method mismatch → stop and throw
      throw new Error(errors.join(" || "));
    }
  }
  throw new Error(errors.join(" || "));
}

/* ========== AUTH API (JWT) ========== */

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    // Use the Next.js API proxy route instead of calling backend directly
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Login failed");
    }

    const data = await response.json();
    return { 
      token: data.access, 
      refresh: data.refresh, 
      user: data.user,
      student: data.student 
    };
  },

  register: async (userData: {
    fullName: string;
    studentId: string;
    department: string;
    email: string;
    password: string;
    role: string;
  }) => {
    // Convert snake_case to camelCase for .NET API
    const payload = {
      fullName: userData.full_name,
      studentId: userData.student_id,
      department: userData.department,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    };

    // Use the Next.js API proxy route instead of calling backend directly
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Registration failed");
    }

    const data = await response.json();
    return { 
      token: data.access, 
      refresh: data.refresh, 
      user: data.user,
      student: data.student 
    };
  },

  completeProfile: async (profileData: StudentProfileUpdate, accessToken: string) => {
    // Use the Next.js API proxy route instead of calling backend directly
    const response = await fetch("/api/complete-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Profile completion failed");
    }

    return await response.json();
  },

  completeProfileWithPhoto: async (formData: FormData, accessToken: string) => {
    // Use the Next.js API proxy route for file upload
    const response = await fetch("/api/complete-profile", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Profile completion failed");
    }

    return await response.json();
  },

  getProfile: async (accessToken: string) => {
    // Use Next.js API route to avoid CORS issues
    const response = await fetch("/api/profile", {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Failed to fetch profile");
    }

    return response.json();
  },

  /**
   * Robust update that tries PATCH → PUT on /profile/,
   * then common fallbacks some backends use.
   */
  // put this inside export const authAPI = { ... }
  updateProfile: async (profileData: StudentProfileUpdate, accessToken: string) => {
    // We’ll do raw fetch here so we can treat certain backend responses as success
    const url = join(API_BASE_URL, "/users/auth/profile");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const body = JSON.stringify(profileData);

    // Try PATCH first; if 405, try PUT. If the server returns
    // "Profile already completed", treat it as success and just refetch.
    const tryOnce = async (method: "PATCH" | "PUT") => {
      const res = await fetch(url, { method, headers, body });
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();

      // Parse JSON if possible
      let json: any = null;
      if (ct.includes("application/json") && text) {
        try { json = JSON.parse(text); } catch { }
      }

      // 200-range -> success
      if (res.ok) {
        return json as ProfileResponse;
      }

      // 405 → method not allowed: signal caller to try the other verb
      if (res.status === 405) {
        throw new Error("__METHOD_NOT_ALLOWED__");
      }

      // 400 with "Profile already completed" → treat as success
      const msg =
        (json && (json.detail || json.error || json.message)) ||
        text ||
        `HTTP ${res.status}`;
      if (/profile already completed/i.test(msg)) {
        // Refetch canonical profile and return it as a success
        return await authAPI.getProfile(accessToken);
      }

      // Any other error: throw a readable message
      throw new Error(msg);
    };

    try {
      // 1) PATCH
      return await tryOnce("PATCH");
    } catch (e: any) {
      if (String(e?.message) === "__METHOD_NOT_ALLOWED__") {
        // 2) fallback to PUT
        return await tryOnce("PUT");
      }
      // rethrow other errors
      throw e;
    }
  },


  logout: async (_accessToken: string) => {
    return { message: "Logged out" };
  },

  /**
   * Robust upload that tries several common routes:
   *  - /users/auth/upload-profile-picture/
   *  - /users/upload-profile-picture/
   *  - /users/auth/profile/upload-profile-picture/
   *  - /users/auth/profile/photo/
   */
  uploadProfilePicture: async (file: File, accessToken: string) => {
    const candidates = [
      "/users/auth/upload-profile-picture/",
      "/users/upload-profile-picture/",
      "/users/auth/profile/upload-profile-picture/",
      "/users/auth/profile/photo/",
    ];

    const attempts = candidates.map((path) => {
      const url = join(API_BASE_URL, path);
      const formData = new FormData();
      formData.append("profile_picture", file);
      return () =>
        fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` }, // no content-type; browser sets boundary
          body: formData,
        });
    });

    return tryJsonSequence<UploadPhotoResponse>(attempts);
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ message?: string; detail?: string }>(
      "/users/auth/forgot-password/",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },
};

/* ========== NOTICES API ========== */
export const noticesAPI = {
  // Get all notices
  getNotices: async () => {
    return apiRequest<any[]>('/notices/');
  },

  // Get notice by ID
  getNotice: async (id: string) => {
    return apiRequest<any>(`/notices/${id}/`);
  },

  // Create notice (admin only)
  createNotice: async (noticeData: any, token: string) => {
    return apiRequest<any>('/notices/', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(noticeData),
    });
  },
};

export default apiRequest;
