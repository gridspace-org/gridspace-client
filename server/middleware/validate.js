const validate = (schema) => (req, res, next) => {
  let dataToValidate = { ...req.body };

  // Normalize array field names from FormData (field[] -> field)
  Object.keys(dataToValidate).forEach(key => {
    if (key.endsWith('[]')) {
      const normalizedKey = key.slice(0, -2);
      dataToValidate[normalizedKey] = Array.isArray(dataToValidate[key])
        ? dataToValidate[key]
        : [dataToValidate[key]];
      delete dataToValidate[key];
    }
  });

  // Parse timeSlots if it's a JSON string
  if (dataToValidate.timeSlots && typeof dataToValidate.timeSlots === 'string') {
    try {
      dataToValidate.timeSlots = JSON.parse(dataToValidate.timeSlots);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid timeSlots format', 
        errors: ['timeSlots must be a valid JSON array'] 
      });
    }
  }

  // If files are present, add their information to the data to be validated
  if (req.files && req.files.length > 0) {
    dataToValidate = { ...dataToValidate, images: req.files.map(file => file.path) }; // Assuming 'images' is the field name for files
  }

  const { error } = schema.validate(dataToValidate, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors });
  }
  
  // Update req.body with normalized data for the controller
  req.body = dataToValidate;
  
  next();
};
export default validate;
