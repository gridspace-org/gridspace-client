import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';

interface SignupData {
  fullname: string;
  email: string;
  password: string;
  phoneNumber: string;
  profilePic?: File;
}

interface SigninCredentials {
  email: string;
  password: string;
}

interface ProfileData {
  fullname?: string;
  phonenumber?: string;
  profilePic?: File;
}

interface OnboardingData {
  role: string;
  purposes?: string[];
  location?: string;
  profilePic?: File;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

interface ResetData {
  token: string;
  password: string;
}

interface GoogleAuthData {
  idToken: string;
}

type ApiResponse<T = unknown> = { message?: string } & {
  [key: string]: unknown;
} & T;

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "https://gridspace-server.onrender.com/api";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://grid-production-cb89.up.railway.app/api";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Always include cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth headers
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        console.error("API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message,
        });
        
        // Check if error is 401 and we haven't already tried to refresh
        // AND the failed request is not the refresh-token or signin endpoint itself
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/refresh-token') &&
          !originalRequest.url?.includes('/auth/signin')
        ) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await this.axiosInstance.post('/auth/refresh-token', {}, {
              _skipAuthRefresh: true // Custom flag to skip interceptor on this request
            } as any);
            const newToken = response.data?.data?.accessToken;
            
            if (newToken) {
              // Update token in localStorage
              localStorage.setItem('authToken', newToken);
              
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Retry the original request with new token
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - redirect to login or clear auth
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('authToken');
            // You might want to redirect to login page here
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle responses
  private async handleResponse<T>(response: AxiosResponse): Promise<T> {
    console.log("API Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });

    return response.data as T;
  }

  // Helper method to handle errors
  private handleError(error: unknown): never {
    console.error("API Error in handleError:", error);

    let errorMessage = "Server error occurred";

    if (isAxiosError(error)) {
      const data: unknown = error.response?.data;
      const maybeRecord = (val: unknown): val is Record<string, unknown> =>
        typeof val === 'object' && val !== null;
      const serverMessage = maybeRecord(data)
        ? (typeof data.message === 'string' ? data.message : undefined) ||
          (typeof (data as Record<string, unknown>).error === 'string' ? (data as Record<string, unknown>).error as string : undefined)
        : undefined;
      errorMessage = serverMessage || error.message || errorMessage;
      console.log("Extracted server message:", serverMessage);
    } else if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }

    console.log("Final error message:", errorMessage);
    throw new Error(errorMessage);
  }

  // Auth endpoints
  async signup(userData: SignupData): Promise<ApiResponse> {
    try {
      console.log("Signup request:", { ...userData, password: "***" });
      console.log("API URL:", `${this.axiosInstance.defaults.baseURL}/auth/signup`);

      const response = await this.axiosInstance.post('/auth/signup', {
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
        phonenumber: userData.phoneNumber,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error("Signup error caught:", error);
      this.handleError(error);
    }
  }

  async signin(credentials: SigninCredentials): Promise<ApiResponse> {
    try {
      console.log("Signin request:", {
        url: `${this.axiosInstance.defaults.baseURL}/auth/signin`,
        email: credentials.email,
        hasPassword: !!credentials.password,
      });

      const response = await this.axiosInstance.post('/auth/signin', credentials);

      console.log("Raw signin response:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error("Signin error caught:", error);
      this.handleError(error);
    }
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.axiosInstance.get('/auth/profile');
    return this.handleResponse(response);
  }

  async updateProfile(profileData: ProfileData): Promise<ApiResponse> {
    const formData = new FormData();

    if (profileData.fullname) formData.append("fullname", profileData.fullname);
    if (profileData.phonenumber)
      formData.append("phonenumber", profileData.phonenumber);
    if (profileData.profilePic)
      formData.append("profilePic", profileData.profilePic);

    const response = await this.axiosInstance.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return this.handleResponse(response);
  }

  async completeOnboarding(
    onboardingData: OnboardingData
  ): Promise<ApiResponse> {
    const formData = new FormData();

    formData.append("role", onboardingData.role);
    if (onboardingData.purposes) {
      formData.append("purposes", JSON.stringify(onboardingData.purposes));
    }
    if (onboardingData.location) {
      formData.append("location", onboardingData.location);
    }
    if (onboardingData.profilePic) {
      formData.append("profilePic", onboardingData.profilePic);
    }

    const response = await this.axiosInstance.post('/auth/onboarding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return this.handleResponse(response);
  }

  async changePassword(passwordData: PasswordData): Promise<ApiResponse> {
    const response = await this.axiosInstance.put('/auth/change-password', passwordData);
    return this.handleResponse(response);
  }

  async requestPasswordReset(
    email: string
  ): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/auth/request-password-reset', { email });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async resetPassword(resetData: ResetData): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/auth/reset-password', { 
        token: resetData.token, 
        newPassword: resetData.password 
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async verifyPasswordResetOtp(
    email: string,
    otp: string
  ): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/auth/verify-password-reset-otp', { email, otp });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async requestEmailVerification(email: string): Promise<ApiResponse> {
    const response = await this.axiosInstance.post('/auth/request-email-verification', { email });
    return this.handleResponse(response);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await this.axiosInstance.post('/auth/verify-email', { token });
    return this.handleResponse(response);
  }

  async refreshToken(): Promise<ApiResponse> {
    const response = await this.axiosInstance.post('/auth/refresh-token');
    return this.handleResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.axiosInstance.post('/auth/logout');
    return this.handleResponse(response);
  }

  async deleteAccount(password: string): Promise<ApiResponse> {
    const response = await this.axiosInstance.delete('/auth/account', { 
      data: { password } 
    });
    return this.handleResponse(response);
  }

  // Google OAuth endpoints
  async googleAuth(googleData: GoogleAuthData): Promise<ApiResponse> {
    console.log("Google Auth request:", {
      url: `${this.axiosInstance.defaults.baseURL}/auth/google`,
      hasIdToken: !!googleData.idToken,
    });

    const response = await this.axiosInstance.post('/auth/google', googleData);
    return this.handleResponse(response);
  }

  async getGoogleAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    const response = await this.axiosInstance.get('/auth/google/url');
    return this.handleResponse(response);
  }
}

const apiService = new ApiService();
export default apiService;
