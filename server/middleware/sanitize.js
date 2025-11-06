import { body, param, query } from 'express-validator';

const sanitizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/[&<>"']/g, (char) => {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return replacements[char] || char;
  });
};

const sanitizeRequest = [
  body('*').customSanitizer(sanitizeString),
  body('*.*').customSanitizer(sanitizeString),
  query('*').customSanitizer(sanitizeString),
  query('*.*').customSanitizer(sanitizeString),
  param('*').customSanitizer(sanitizeString),
  (req, res, next) => next()
];

export default sanitizeRequest;
