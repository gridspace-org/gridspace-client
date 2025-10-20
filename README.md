# GridSpace

A comprehensive platform for finding and booking workspaces, built as a full-stack application with Next.js frontend and Node.js/Express backend.

## Project Structure

This is a monorepo containing:

- `client/` - Next.js frontend application
- `server/` - Node.js/Express backend API

## Environment Setup

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and update the variables with your actual configurations (see server/README.md for details)

4. The server is now ready to run with `npm run dev` or `npm start`

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if applicable):
   - Check for any `.env.example` files and copy to `.env`
   - Configure as needed

4. The client is now ready to run with `npm run dev`

## Deployment

For development, set `NODE_ENV=development` or omit it.

For production:
- Set `NODE_ENV=production` in `.env` files
- Use `npm start` instead of `npm run dev`

Consult the individual READMEs in `server/` and `client/` directories for detailed deployment instructions.

## Contributing

Please ensure the `.gitignore` file excludes sensitive files like `.env` from being committed to version control.
