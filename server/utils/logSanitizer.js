const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'pwd',
  'token',
  'auth',
  'authorization',
  'authorizationheader',
  'access_token',
  'refresh_token',
  'secret',
  'apikey',
  'api_key',
  'api-key',
  'otp',
  'code',
  'pin',
  'credential',
  'credentials'
]);

const emailRegex = /([a-z0-9._%+-])([a-z0-9._%+-]*)(@[a-z0-9.-]+\.[a-z]{2,})/gi;
const tokenRegex = /\b([a-f0-9]{32,}|eyJ[a-zA-Z0-9._-]+)\b/g; // matches long hex strings or JWT-like tokens

const maskEmail = (match, firstChar, middle, domain) => {
  if (!middle) {
    return `${firstChar}***${domain}`;
  }
  const visible = Math.min(2, middle.length);
  const maskedSection = '*'.repeat(Math.max(middle.length - visible, 3));
  return `${firstChar}${middle.slice(0, visible)}${maskedSection}${domain}`;
};

const redactString = (value) => {
  let sanitized = value;
  sanitized = sanitized.replace(emailRegex, maskEmail);
  sanitized = sanitized.replace(tokenRegex, '[REDACTED]');
  return sanitized;
};

const sanitizeValue = (value, key = '') => {
  const normalizedKey = key.toLowerCase();

  if (SENSITIVE_KEYS.has(normalizedKey)) {
    return '[REDACTED]';
  }

  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? redactString(value) : value;
  }

  if (value instanceof Error) {
    const sanitizedError = new Error(redactString(value.message));
    sanitizedError.name = value.name;
    sanitizedError.stack = value.stack ? redactString(value.stack) : undefined;
    return sanitizedError;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  const sanitized = {};
  for (const [nestedKey, nestedValue] of Object.entries(value)) {
    sanitized[nestedKey] = sanitizeValue(nestedValue, nestedKey);
  }
  return sanitized;
};

export const sanitizeLogEntry = (info) => {
  if (!info || typeof info !== 'object') {
    return info;
  }

  const sanitizedInfo = info;

  if (info.message) {
    sanitizedInfo.message = sanitizeValue(info.message, 'message');
  }

  for (const key of Object.keys(info)) {
    if (key === 'message') continue;
    sanitizedInfo[key] = sanitizeValue(info[key], key);
  }

  return sanitizedInfo;
};

export default sanitizeLogEntry;
