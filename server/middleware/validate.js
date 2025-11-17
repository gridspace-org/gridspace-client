const validate = (schema) => (req, res, next) => {
  let dataToValidate = req.body;

  // If files are present, add their information to the data to be validated
  if (req.files && req.files.length > 0) {
    dataToValidate = {
      ...req.body,
      images: req.files.map((file) => file.path),
    }; // Assuming 'images' is the field name for files
  }

  const { error, value } = schema.validate(dataToValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res
      .status(400)
      .json({ success: false, message: "Validation Error", errors });
  }

  // Update req.body with validated values
  logger.info("Validation middleware updating req.body", {
    originalBody: req.body,
    validatedValue: value,
    hasValue: !!value,
  });
  req.body = value;
  next();
};
export default validate;
