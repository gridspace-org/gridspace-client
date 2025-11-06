# Security Hardening & Refactor Plan

This document outlines a plan to improve the security, structure, and maintainability of the Gridspace server, organized by priority.

## P1: Critical Priority

### 1. Secure Token Transmission

*   **Risk:** JWTs are currently passed in the URL, exposing them to browser history and server logs.
*   **Recommendation:** Use `httpOnly` cookies to securely transmit JWTs. This prevents client-side JavaScript from accessing the token, mitigating XSS attacks.
*   **Links:**
    *   [Express `res.cookie()` documentation](https://expressjs.com/en/api.html#res.cookie)
    *   [OWASP - HttpOnly](https://owasp.org/www-community/HttpOnly)
*   **Installation:** `npm install cookie-parser`
*   **Implementation Outline:**
    1.  Add the `cookie-parser` middleware to `app.js`.
    2.  In `controllers/authController.js`, modify the `googleCallback` function to set an `httpOnly` cookie.
    3.  Refactor the `authenticate` middleware in `middleware/auth.js` to extract the token from the cookie.

### 2. Ensure Database Connection Before Server Start

*   **Risk:** The server may start accepting requests before the database connection is established, leading to a race condition and potential errors.
*   **Recommendation:** Modify the application startup sequence to ensure the MongoDB connection is successfully established before the server begins listening for requests.
*   **Implementation Outline:**
    1.  Modify `server.js` to use a top-level `await` to call an async `startServer` function that first connects to the database and then starts the server.

### 3. Centralized Input Validation

*   **Risk:** Manual validation is error-prone, inconsistent, and leads to code duplication.
*   **Recommendation:** Create a centralized validation middleware using `Joi` to enforce schemas for all incoming requests.
*   **Links:**
    *   [Joi Documentation](https://joi.dev/api/)
*   **Implementation Outline:**
    1.  Create a generic validation middleware in `middleware/validate.js`.
    2.  Refactor all routes in the `routes/` directory to use this middleware.
    3.  Create Joi schemas in the `validators/` directory for all routes that are currently unvalidated.

### 4. Regular Dependency Scanning

*   **Risk:** Using third-party dependencies with known vulnerabilities.
*   **Recommendation:** Regularly run `npm audit` to scan for vulnerabilities and integrate this check into your CI/CD pipeline.
*   **Links:**
    *   [npm audit documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
*   **Implementation Outline:**
    1.  Add a script to your `package.json` to run the audit.
    2.  In your CI/CD pipeline configuration, add a step to run this script.

### 5. JWT Secret Strength Check

*   **Risk:** A weak JWT secret can be easily brute-forced.
*   **Recommendation:** Implement a startup check to ensure the JWT secret meets minimum complexity requirements.
*   **Links:**
    *   [check-password-complexity on npm](https://www.npmjs.com/package/check-password-complexity)
*   **Installation:** `npm install check-password-complexity`
*   **Implementation Outline:**
    In `app.js`, before starting the server, validate the `JWT_SECRET` from your environment variables.

## P2: Medium Priority

### 1. Robust Input Sanitization

*   **Risk:** The current custom sanitization logic is not robust and can be easily bypassed.
*   **Recommendation:** Replace the custom `sanitizeInput` middleware with a dedicated and battle-tested library like `express-validator`.
*   **Links:**
    *   [express-validator Sanitization](https://express-validator.github.io/docs/sanitization.html)
*   **Installation:** `npm install express-validator`
*   **Implementation Outline:**
    1.  Remove the custom `sanitizeInput` middleware from `app.js`.
    2.  In your route definitions, chain sanitization methods after validation.

### 2. API Versioning

*   **Risk:** Without versioning, making changes to the API in the future can break existing clients.
*   **Recommendation:** Introduce API versioning by adding a version number to the base path of all API routes (e.g., `/api/v1`).
*   **Implementation Outline:**
    1.  In `app.js`, group all the API routes under a versioned base path like `/api/v1`.
    2.  Update the frontend application and API documentation to use the new versioned routes.

### 3. Controller Refactoring

*   **Risk:** Large controllers that handle many different concerns are difficult to maintain and test.
*   **Recommendation:** Refactor large controllers like `authController.js` into smaller, more focused controllers based on their domain.
*   **Implementation Outline:**
    1.  Identify distinct functionalities within large controllers.
    2.  Create new, smaller controller files for each of these functionalities.
    3.  Move the relevant functions to the new controller files and update the routes.

### 4. Custom Error Class

*   **Risk:** The current error handling relies on checking error names, which can be brittle.
*   **Recommendation:** Create a custom `AppError` class that extends the built-in `Error` class for more structured error handling.
*   **Implementation Outline:**
    1.  Create a `utils/AppError.js` file that defines the custom error class.
    2.  Refactor the application to throw `AppError` instances.
    3.  Update the global error handling middleware to specifically handle `AppError` instances.

### 5. Gitignore for `.env`

*   **Risk:** The `.env` file, which contains secrets, could be accidentally committed to version control.
*   **Recommendation:** Add `.env` to the `.gitignore` file in the `gridspace-client/server` directory as a safeguard.
*   **Implementation:**
    Add `.env` to `gridspace-client/server/.gitignore`.

## P3: Low Priority

### 1. Admin Action Logging Middleware

*   **Risk:** Duplicated code for logging admin actions is error-prone and hard to maintain.
*   **Recommendation:** Create a middleware that logs admin actions to centralize the logging logic.
*   **Implementation Outline:**
    1.  Create a middleware `middleware/adminActionLog.js`.
    2.  Design the middleware to run after the main controller logic.
    3.  Apply this middleware to the admin routes.

### 2. Production-Ready Logging

*   **Risk:** Logging only to the console can result in the loss of important log data in a production environment.
*   **Recommendation:** Add a file transport to `winston` for production environments to ensure logs are persisted.
*   **Links:**
    *   [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)
*   **Installation:** `npm install winston-daily-rotate-file`
*   **Implementation Outline:**
    In `config/logger.js`, add a file transport that only runs in production.

### 3. PII Redaction in Logs

*   **Risk:** Accidental logging of Personally Identifiable Information (PII) or other sensitive data.
*   **Recommendation:** Implement a custom `winston` format to automatically redact sensitive fields from logs.
*   **Implementation Outline:**
    In `config/logger.js`, create a redaction format and add it to the logger.

### 4. Configuration for Hardcoded Values

*   **Risk:** Hardcoded values make the application less flexible and harder to configure.
*   **Recommendation:** Move hardcoded values to a dedicated configuration file or to environment variables.
*   **Implementation Outline:**
    1.  Create a `config/appConfig.js` file for application-level constants.
    2.  Move values like pagination limits and cron job schedules to this config file or to environment variables.

---

### Expected Benefits of Implementing This Plan:

*   **Improved Security:** By addressing the identified vulnerabilities, the application will be more resilient to common web attacks such as XSS, CSRF, and brute-force attacks.
*   **Enhanced Maintainability:** Centralizing validation and error handling logic will make the codebase easier to understand, maintain, and extend.
*   **Increased Consistency:** Enforcing a consistent approach to validation and sanitization will reduce bugs and improve data integrity.
*   **Better Developer Experience:** A more structured and modular codebase is easier for developers to work with, leading to faster development cycles and fewer errors.
*   **Safer JWT Handling:** Moving JWTs to `httpOnly` cookies provides a significant security enhancement over storing them in local storage.
*   **Improved Reliability:** Ensuring the database is connected before the server starts will prevent race conditions and make the application more reliable.
*   **Future-Proofing:** API versioning provides a clear path for future development and prevents breaking changes for existing clients.