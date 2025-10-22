import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiService from "../../services/api";

interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  fullname?: string;
  role: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  profilePic?: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
  onboardingCompleted?: boolean;
  purposes?: string[];
  location?: string;
  createdAt?: string | number | Date;
  [key: string]: unknown;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

interface ResetData {
  token: string;
  password: string;
}

// Type guards
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isAuthResponse = (value: unknown): value is AuthResponse => {
  if (!isRecord(value)) return false;
  const maybeUser = value.user;
  const maybeToken = value.token;
  return (
    typeof maybeToken === "string" &&
    isRecord(maybeUser) &&
    (typeof maybeUser.id === "string" || typeof maybeUser._id === "string") &&
    typeof maybeUser.email === "string" &&
    typeof maybeUser.role === "string" &&
    (typeof maybeUser.isVerified === "boolean" ||
      typeof maybeUser.emailVerified === "boolean" ||
      typeof maybeUser.isVerified === "undefined" ||
      typeof maybeUser.emailVerified === "undefined")
  );
};

// Helper function to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

// Initial state
const initialState: AuthState = {
  user: null,
  token: getLocalStorageItem("authToken"),
  isAuthenticated: !!getLocalStorageItem("authToken"),
  loading: false,
  error: null,
};

interface SignupData {
  fullname: string;
  email: string;
  password: string;
  phonenumber: string;
  profilePic?: File;
}

interface OnboardingData {
  role: string;
  purposes?: string[];
  location?: string;
  profilePic?: File;
}

interface GoogleAuthData {
  idToken: string;
}

// Async thunks
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData: SignupData, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(userData);
      if (!isAuthResponse(response)) {
        throw new Error("Invalid response from server");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
      }
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const signin = createAsyncThunk(
  "auth/signin",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.signin(credentials);
      if (!isAuthResponse(response)) {
        throw new Error("Invalid response from server");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
      }
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (googleData: GoogleAuthData, { rejectWithValue }) => {
    try {
      const response = await apiService.googleAuth(googleData);
      if (!isAuthResponse(response)) {
        throw new Error("Invalid response from server");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
      }
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Google authentication failed";
      return rejectWithValue(message);
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getProfile();
      return response as { user: User };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const completeOnboarding = createAsyncThunk(
  "auth/completeOnboarding",
  async (onboardingData: OnboardingData, { rejectWithValue }) => {
    try {
      const response = await apiService.completeOnboarding(onboardingData);
      return response as { user: User };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

interface ProfileUpdateData {
  fullname?: string;
  phonenumber?: string;
  profilePic?: File;
}

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: ProfileUpdateData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(profileData);
      return response as { user: User };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: PasswordData, { rejectWithValue }) => {
    try {
      const response = await apiService.changePassword(passwordData);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.requestPasswordReset(email);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData: ResetData, { rejectWithValue }) => {
    try {
      const response = await apiService.resetPassword(resetData);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  "auth/requestEmailVerification",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.requestEmailVerification(email);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyEmail(token);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.refreshToken();
      if (!isAuthResponse(response)) {
        throw new Error("Invalid response from server");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
      }
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      return null;
    } catch (error: unknown) {
      // Even if logout fails on server, clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "auth/deleteAccount",
  async (password: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteAccount(password);
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("reduxState");
      }
    },
    hydrate: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signup.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Signin
      .addCase(signin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signin.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        googleAuth.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProfile.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.error = null;
        }
      )
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        completeOnboarding.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.error = null;
        }
      )
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.error = null;
        }
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request Email Verification
      .addCase(requestEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.error = null;
        }
      )
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth, hydrate } = authSlice.actions;
export default authSlice.reducer;
