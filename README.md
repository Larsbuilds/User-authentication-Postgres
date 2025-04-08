# PostgreSQL Node.js Example

This is a simple Node.js application that demonstrates how to connect to and interact with a PostgreSQL database.

## Setup

1. Make sure PostgreSQL is running:
```bash
brew services start postgresql@17
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your database credentials and JWT secret:
```bash
cp .env.example .env
```
Then update the values in `.env`:
```bash
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the application:
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Authentication

### Register
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"newuser","email":"newuser@example.com","password":"Password123!"}' http://localhost:3000/register
```

### Login
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"newuser@example.com","password":"Password123!"}' http://localhost:3000/login
```

The login and register endpoints will return a JWT token that should be included in subsequent requests in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Available Endpoints

### Users
- `GET /users` - Get all users (requires authentication)
- `POST /users` - Create a new user (requires authentication)
  ```json
  {
    "username": "newuser",  // 3-50 chars, letters, numbers, underscores only
    "email": "newuser@example.com",  // Valid email format, max 255 chars
    "password": "Password123!"  // Optional, min 8 chars, requires uppercase, lowercase, number, and special char
  }
  ```
- `DELETE /users/:userId` - Delete a user and their posts (requires authentication)
- `GET /users/:userId/posts` - Get all posts by a specific user (requires authentication)

### Posts
- `GET /posts` - Get all posts with author information (requires authentication)
- `GET /posts/:postId` - Get a single post with author information (requires authentication)
- `POST /posts` - Create a new post (requires authentication)
  ```json
  {
    "author_id": 1,  // Must be a positive integer, must exist
    "title": "New Post",  // 1-255 chars, letters, numbers, spaces, basic punctuation
    "content": "This is the content",  // 1-10000 chars
    "tags": ["nodejs", "postgresql"]  // Optional, max 5 tags, letters, numbers, hyphens only
  }
  ```
- `PUT /posts/:postId` - Update a post (requires authentication)
  ```json
  {
    "title": "Updated Title",  // 1-255 chars, letters, numbers, spaces, basic punctuation
    "content": "Updated content",  // 1-10000 chars
    "tags": ["updated", "tags"]  // Optional, max 5 tags, letters, numbers, hyphens only
  }
  ```
- `DELETE /posts/:postId` - Delete a post (requires authentication)

## Validation Rules

### User Validation
- Username:
  - Must be between 3 and 50 characters
  - Can only contain letters, numbers, and underscores
  - Will be converted to lowercase
  - Must be unique
- Email:
  - Must be a valid email format
  - Will be normalized (lowercase, etc.)
  - Must be less than 255 characters
  - Must be unique
- Password (optional):
  - Must be at least 8 characters long
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
  - Must contain at least one special character

### Post Validation
- Title:
  - Must be between 1 and 255 characters
  - Can only contain letters, numbers, spaces, and basic punctuation
- Content:
  - Must be between 1 and 10000 characters
  - Will be escaped for security
- Author ID:
  - Must be a positive integer
  - Must exist in the users table
- Tags (optional):
  - Must be an array
  - Maximum 5 tags allowed
  - Each tag can only contain letters, numbers, and hyphens
  - Tags will be converted to lowercase

### ID Parameters
- User ID and Post ID:
  - Must be positive integers
  - Must exist in their respective tables

### Query Parameters
- Page:
  - Must be a positive integer
- Limit:
  - Must be between 1 and 100
- Sort:
  - Must be one of: created_at, updated_at, title
- Order:
  - Must be either asc or desc

## Error Responses

### Authentication Errors
```json
{
  "error": "Authentication token required"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### Validation Errors
```json
{
  "errors": [
    {
      "field": "username",
      "message": "Username must be between 3 and 50 characters",
      "value": "a"
    }
  ]
}
```

## Testing with curl

### Authentication
Register a new user:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"newuser","email":"newuser@example.com","password":"Password123!"}' http://localhost:3000/register
```

Login:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"newuser@example.com","password":"Password123!"}' http://localhost:3000/login
```

### Users
Get all users (requires token):
```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/users
```

Create a new user (requires token):
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d '{"username":"newuser","email":"newuser@example.com","password":"Password123!"}' http://localhost:3000/users
```

Delete a user (requires token):
```bash
curl -X DELETE -H "Authorization: Bearer <your_token>" http://localhost:3000/users/1
```

Get posts by user (requires token):
```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/users/1/posts
```

### Posts
Get all posts (requires token):
```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/posts
```

Get a single post (requires token):
```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/posts/1
```

Create a new post (requires token):
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d '{"author_id":1,"title":"New Post","content":"Hello!","tags":["nodejs","postgresql"]}' http://localhost:3000/posts
```

Update a post (requires token):
```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <your_token>" -d '{"title":"Updated Title","content":"Updated content","tags":["updated","tags"]}' http://localhost:3000/posts/1
```

Delete a post (requires token):
```bash
curl -X DELETE -H "Authorization: Bearer <your_token>" http://localhost:3000/posts/1
``` 