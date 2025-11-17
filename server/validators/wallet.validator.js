import Joi from 'joi';
import env from '../config/env.js';

export const requestWithdrawalValidation = Joi.object({
  amount: Joi.number()
    .min(env.wallet.minWithdrawal)
    .max(env.wallet.monthlyWithdrawalLimit)
    .required()
    .messages({
      'number.min': `Minimum withdrawal amount is ₦${env.wallet.minWithdrawal.toLocaleString()}`,
      'number.max': `Maximum withdrawal amount is ₦${env.wallet.monthlyWithdrawalLimit.toLocaleString()}`,
      'any.required': 'Amount is required'
    }),
  accountNumber: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Account number must be 10 digits',
    'string.pattern.base': 'Account number must contain only digits',
    'any.required': 'Account number is required'
  }),
  accountName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Account name must be at least 3 characters',
    'string.max': 'Account name cannot exceed 100 characters',
    'any.required': 'Account name is required'
  }),
  bankName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Bank name must be at least 3 characters',
    'string.max': 'Bank name cannot exceed 100 characters',
    'any.required': 'Bank name is required'
  }),
  bankCode: Joi.string().optional()
});
