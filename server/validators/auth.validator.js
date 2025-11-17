import Joi from "joi";

export const signupSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phonenumber: Joi.string().required(),
});

export const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export const requestEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resendEmailVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyPasswordResetOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const googleAuthSchema = Joi.object({
  idToken: Joi.string().required(),
});

export const completeOnboardingSchema = Joi.object({
  fullname: Joi.string().required().min(2).max(100).messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name cannot exceed 100 characters",
  }),
  role: Joi.string().valid("user", "host").required().messages({
    "any.required": "Role is required",
    "string.empty": "Role cannot be empty",
    "any.only": 'Role must be either "user" or "host"',
  }),
  bio: Joi.when("role", {
    is: "host",
    then: Joi.string().required().min(10).max(500).messages({
      "string.empty": "Bio is required for hosts",
      "string.min": "Bio must be at least 10 characters",
      "string.max": "Bio cannot exceed 500 characters",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  company: Joi.string().allow("").optional().max(100).messages({
    "string.max": "Company name cannot exceed 100 characters",
  }),
  phonenumber: Joi.when("role", {
    is: "host",
    then: Joi.string()
      .required()
      .pattern(/^[0-9\-+()\s]+$/)
      .messages({
        "string.empty": "Phone number is required for hosts",
        "string.pattern.base": "Please enter a valid phone number",
      }),
    otherwise: Joi.string().allow("").optional(),
  }),
  location: Joi.when("role", {
    is: "host",
    then: Joi.string().required().min(5).max(200).messages({
      "string.empty": "Location is required for hosts",
      "string.min": "Location must be at least 5 characters",
      "string.max": "Location cannot exceed 200 characters",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  // Allow file uploads (handled by multer, not validated here)
  profilePic: Joi.any().optional(),
}).options({ allowUnknown: true });

export const updateProfileSchema = Joi.object({
  fullname: Joi.string().optional(),
  phonenumber: Joi.string().optional(),
  profilePic: Joi.string().uri().optional(), // Assuming profilePic will be a URL after upload
});

export const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
});
