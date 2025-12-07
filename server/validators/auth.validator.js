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
  role: Joi.string().valid('user', 'host', 'admin').required().messages({
    'any.required': 'Role is required',
    'string.empty': 'Role cannot be empty',
    'any.only': 'Role must be one of: user, host, admin'
  }),
  purposes: Joi.alternatives()
    .try(
      Joi.string(), // Allow JSON string from FormData
      Joi.array().items(Joi.string()) // Allow array
    )
    .optional()
    .messages({
      'array.base': 'Purposes must be an array of strings'
    }),
  location: Joi.string().optional().max(200).messages({
    'string.max': 'Location cannot exceed 200 characters'
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
