import Joi from "joi";

const suspensionReasons = [
  "fraud",
  "policy_violation",
  "chargeback_dispute",
  "abuse",
  "other",
];

export const suspendUserValidation = Joi.object({
  reason: Joi.string()
    .valid(...suspensionReasons)
    .required(),
  details: Joi.string().trim().max(500).allow(null, ""),
  resumeAt: Joi.date().greater("now").optional(),
});

export const reactivateUserValidation = Joi.object({
  reason: Joi.string().trim().max(500).allow(null, ""),
});

export const approveSpaceValidation = Joi.object({
  notes: Joi.string().trim().max(500).allow(null, ""),
});

export const rejectSpaceValidation = Joi.object({
  reason: Joi.string().trim().max(500).required(),
});
