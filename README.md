# PostgreSQL API with Node.js and Express

A RESTful API built with Node.js, Express, and PostgreSQL, featuring user authentication, post management, and comprehensive test coverage.

## Features

- **User Authentication**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - User registration and login
  - Profile management (view, update, delete)

- **Post Management**
  - Create, read, update, and delete posts
  - Tag support for posts
  - Pagination for post listings
  - Author-based post filtering

- **Security**
  - Input validation using express-validator
  - CORS protection
  - Secure password requirements
  - JWT token validation with user existence check

- **Testing**
  - Comprehensive test suite using Jest
  - Test database isolation
  - Coverage reporting
  - Authentication flow testing
  - CRUD operation testing
  - Error handling verification

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/postgresql-api.git
   cd postgresql-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and JWT secret:
   ```
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name
   JWT_SECRET=your_jwt_secret
   ```

5. Create a test database and update `.env.test`:
   ```
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name_test
   JWT_SECRET=your_test_jwt_secret
   ```

6. Run database migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Running Tests
```bash
npm test
```

To run tests with coverage report:
```bash
npm run test:coverage
```

## API Documentation

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}
```

### User Profile

#### Get user profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update user profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "new@example.com"
}
```

#### Delete user profile
```http
DELETE /api/users/profile
Authorization: Bearer <token>
```

### Posts

#### Create a post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content of my post",
  "tags": ["tech", "programming"]
}
```

#### Get all posts
```http
GET /api/posts
```

#### Get posts with pagination
```http
GET /api/posts?page=1&limit=10
```

#### Get post by ID
```http
GET /api/posts/:id
```

#### Update a post
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Post",
  "content": "Updated content",
  "tags": ["updated", "tags"]
}
```

#### Delete a post
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

## Test Coverage

The project includes a comprehensive test suite covering:

- Authentication flows (registration, login)
- User profile management
- Post CRUD operations
- Input validation
- Error handling
- Security measures

Run `npm run test:coverage` to generate a coverage report.

## Error Handling

The API uses a consistent error handling format:

```json
{
  "status": "error",
  "message": "Error message",
  "code": 400
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 