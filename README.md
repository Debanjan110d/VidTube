# VidTube

A YouTube-inspired video platform built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-yt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `src/.env.sample` to `src/.env`
   - Configure your MongoDB connection and other settings

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📋 Environment Setup

Make sure to configure these environment variables in `src/.env`:

```env
PORT=8000
CORS_ORIGIN=http://localhost:3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
```

## 🛠️ Troubleshooting

**Having issues getting started?** Check our comprehensive troubleshooting guide:

👉 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** 

Common issues covered:
- MongoDB connection problems
- Environment configuration errors
- Server startup failures
- CORS configuration issues

## 📁 Project Structure

```
project-yt/
├── src/
│   ├── .env              # Environment variables
│   ├── index.js          # Application entry point
│   ├── app.js            # Express app configuration
│   ├── constants.js      # Application constants
│   ├── controllers/      # Route controllers
│   │   ├── user.controller.js    # User auth & management logic
│   │   └── healthcheck.controller.js  # Health check endpoint
│   ├── db/              # Database configuration
│   ├── middlewares/     # Custom middlewares
│   │   ├── auth.middleware.js    # JWT authentication middleware
│   │   ├── multer.middleware.js  # File upload middleware
│   │   └── error.middleware.js   # Global error handler
│   ├── models/          # MongoDB models
│   │   ├── user.models.js        # User schema with auth methods
│   │   ├── video.models.js       # Video schema
│   │   └── ...other models
│   ├── routes/          # API routes
│   │   ├── user.route.js         # User authentication routes
│   │   └── healthcheck.route.js  # Health check routes
│   └── utils/           # Utility functions
│       ├── apiError.js           # Custom error handling
│       ├── apiResponse.js        # Standardized responses
│       ├── asyncHandler.js       # Async error wrapper
│       └── cloudinary.js         # File upload utility
├── public/              # Static files
└── package.json         # Dependencies and scripts
```

## 🚧 Current Development Status

### ✅ Completed Features
- **Project Setup**: Environment configuration, database connection
- **Error Handling**: Custom ApiError class and asyncHandler utility
- **User Authentication**: Complete registration, login, logout, and token refresh system
- **JWT Middleware**: Authentication middleware for protected routes
- **File Upload System**: Multer + Cloudinary integration for avatar/cover images
- **User Validation**: Input validation for registration with comprehensive checks
- **Duplicate Prevention**: Email and username uniqueness validation
- **Database Models**: User, Video, Comment, Like models with relationships
- **Environment Management**: Robust dotenv configuration with fallbacks
- **Cookie Security**: HttpOnly cookies with environment-based secure flags
- **Token Management**: Access and refresh token generation with JWT

### 🔄 In Progress
- **Video Upload System**: Planning video model and upload endpoints
- **User Profile Management**: Profile update and avatar change functionality

### 📋 Next Steps
- Implement video upload and streaming functionality
- Add comment and like systems for videos
- Build playlist management features
- Add search and recommendation systems

### 🛠️ Recent Fixes & Updates

**September 2, 2025:**
- **Authentication System**: Complete JWT-based authentication implementation
- **Middleware Creation**: Built verifyJWT middleware for protected routes
- **Route Protection**: Secured logout endpoint with authentication middleware
- **Token Management**: Multiple token source support (cookies, body, headers)
- **Cookie Security**: HttpOnly cookies with environment-based configuration

**September 1, 2025:**
- **User Authentication**: Implemented registration, login, logout, refresh token endpoints
- **File Upload Integration**: Connected Cloudinary with user avatar/cover uploads
- **JWT Implementation**: Access and refresh token generation with secure storage
- **Error Enhancement**: Improved error handling across authentication flow

**August 28, 2025:**
- **Environment Loading**: Fixed dotenv configuration and variable loading issues
- **MongoDB Connection**: Resolved duplicate database name in connection string
- **Cloudinary Upload**: Fixed file path normalization for cross-platform compatibility
- **Multer Configuration**: Fixed field name mapping for file uploads
- **Error Middleware**: Corrected syntax and added proper JSON responses

## �🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🔧 Development Notes

### User Controller Validation
The user registration includes robust validation:

```javascript
// Validates all required fields are present and not empty/whitespace
if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
}

// Prevents duplicate users by checking email and username
const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})
```

**Key Features:**
- Optional chaining (`?.`) for safe property access
- `Array.some()` for efficient validation checking
- MongoDB `$or` operator for duplicate prevention
- Consistent error handling with custom ApiError class

### Route Setup & Debugging (August 27, 2025)

**Recent Progress:**
- Multer middleware (`upload`) exported as a named export and correctly imported in routes
- User route file (`user.route.js`) set up with Express Router
- Fixed export error: `SyntaxError: Export 'userRoute' is not defined in module` by ensuring router is declared before export
- Fixed reference error: `ReferenceError: upload is not defined` by importing `upload` middleware

**Debugging Tips:**
- Always declare and initialize variables before exporting
- Use named imports for named exports (e.g., `{ upload }`)
- Read error messages for file and line number clues
- Restart nodemon after making code changes

**Next Steps:**
- Implement user registration route logic
- Continue improving error handling and validation in routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.