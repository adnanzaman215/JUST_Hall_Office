// Authentication utility functions
export interface User {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  department: string;
  isAdmin?: boolean;
  isSuperuser?: boolean;
  isVerified?: boolean;
  role?: string;
  studentProfile?: {
    studentId: string;
    department: string;
    session: string;
    roomNo: number;
    photoUrl?: string;
  };
  student?: {
    studentId: string;
    department: string;
    session: string;
    roomNo: number;
    dob: string;
    gender: string;
    bloodGroup: string;
    fatherName: string;
    motherName: string;
    mobileNumber: string;
    emergencyNumber: string;
    address: string;
    photoUrl?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Local storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Get token from localStorage
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Store token in localStorage
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Get user from localStorage
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Store user in localStorage
export function storeUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Remove user from localStorage
export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!(getStoredToken() && getStoredUser());
}

// Get current auth state
export function getAuthState(): AuthState {
  const token = getStoredToken();
  const user = getStoredUser();
  return {
    token,
    user,
    isAuthenticated: !!(token && user),
  };
}

// Clear all auth data
export function clearAuthData(): void {
  removeToken();
  removeUser();
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
}
