import { body, param, query } from "express-validator";

const sanitizeString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  // Skip sanitization for ISO 8601 date strings
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
  if (isoDateRegex.test(value)) {
    return value;
  }

  // Skip sanitization for email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(value)) {
    return value;
  }

  // NoSQL injection protection - only replace MongoDB operators at the start
  // This prevents $gt, $ne, etc. while preserving valid dots in values
  let sanitized = value.replace(/^\$/, "_DOLLAR_").replace(/^\./, "_DOT_");

  // XSS protection
  sanitized = sanitized.replace(/[&<>"']/g, (char) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[char] || char;
  });

  return sanitized;
};

const sanitizeRequest = [
  body("*").customSanitizer(sanitizeString),
  body("*.*").customSanitizer(sanitizeString),
  query("*").customSanitizer(sanitizeString),
  query("*.*").customSanitizer(sanitizeString),
  param("*").customSanitizer(sanitizeString),
  (req, res, next) => next(),
];

export default sanitizeRequest;
