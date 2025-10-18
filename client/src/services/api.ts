import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface SignupData {
  fullname: string;
  email: string;
  password: string;
  phonenumber: string;
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
  process.env.NEXT_PUBLIC_API_URL || "https://gridspace-backend.onrender.com/api";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
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

    // Add response interceptor for logging only
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message,
        });
        
        // Don't throw here - let individual methods handle errors
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
  private handleError(error: any): never {
    console.error("API Error in handleError:", error);
    
    // Extract server error message from response data
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    const errorMessage = serverMessage || error.message || "Server error occurred";
    
    console.log("Extracted server message:", serverMessage);
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
        phonenumber: userData.phonenumber,
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
  ): Promise<ApiResponse<{ resetToken: string }>> {
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
