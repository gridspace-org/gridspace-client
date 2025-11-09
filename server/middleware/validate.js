const validate = (schema) => (req, res, next) => {
  let dataToValidate = req.body;

  // If files are present, add their information to the data to be validated
  if (req.files && req.files.length > 0) {
    dataToValidate = { ...req.body, images: req.files.map(file => file.path) }; // Assuming 'images' is the field name for files
  }

  const { error } = schema.validate(dataToValidate, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }
  next();
};
export default validate;
