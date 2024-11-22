# User Management CRUD API

A serverless CRUD API built with Cloudflare Workers and D1 database for managing users. This API provides endpoints for creating, reading, updating, and deleting user records.

## Features

- Serverless architecture using Cloudflare Workers
- D1 SQLite database integration
- Password hashing using bcryptjs
- Complete test suite using Vitest
- TypeScript support

## API Endpoints

### GET /api/users
- Retrieves all users
- Returns user data excluding passwords

### GET /api/users/:id
- Retrieves a specific user by ID
- Returns 404 if user not found

### POST /api/users
- Creates a new user
- Required fields: name, email, password
- Returns 201 on success
- Returns 400 if required fields are missing

### PUT /api/users/:id
- Updates an existing user
- Optional fields: name, email, password
- Returns 200 on success
- Returns 500 if update fails

### DELETE /api/users/:id
- Deletes a user by ID
- Returns 200 on success
- Returns 500 if deletion fails

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

4. Deploy to Cloudflare:
```bash
npm run deploy
```

## Environment Setup

Make sure you have the following in your `wrangler.toml`:
- D1 database configuration
- Appropriate bindings and permissions

## Technology Stack

- Cloudflare Workers
- D1 Database (SQLite)
- TypeScript
- bcryptjs for password hashing
- Vitest for testing

## Development

To generate TypeScript types for Cloudflare bindings:
```bash
npm run cf-typegen
```

## License

MIT

## Contributing

Feel free to submit issues and pull requests.
