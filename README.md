# Book Management API

A NestJS-based REST API for managing books with user authentication, built with TypeScript and Supabase integration. This project demonstrates modern web development practices including containerization, authentication, file uploads, and thorough testing.

## Features

- 🔐 JWT Authentication
- 📚 CRUD operations for books
- 🖼️ Image upload for book covers
- 🔒 User-specific book management
- 🐳 Docker support with hot-reload
- ✅ Unit and E2E tests

## Tech Stack

- NestJS
- TypeScript
- Supabase (Database & Storage)
- Docker
- JWT Authentication
- bcrypt for password hashing
- Jest for testing

## Prerequisites

- Node.js v20 or higher
- Docker Desktop

## Getting Started

### Using Docker

1. Clone the repository
2. Create `.env` file with required variables (see below)
3. Run the application:

```powershell
docker compose up --build
```

The API will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Local Development

1. Install dependencies:

```powershell
npm install
```

2. Compile and run the project:

```powershell
npm run start
```

## Testing

```powershell
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## API Documentation

### Authentication Endpoints

- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user

### Books Endpoints (Authenticated)

- GET `/books` - Get all books
- GET `/books/:id` - Get specific book
- POST `/books` - Create new book
- PATCH `/books/:id` - Update book
- DELETE `/books/:id` - Delete book
