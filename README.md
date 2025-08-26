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
│   │   └── user.controller.js  # User registration & auth logic
│   ├── db/              # Database configuration
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # MongoDB models
│   │   └── user.models.js      # User schema definition
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
│       ├── apiError.js       # Custom error handling
│       ├── apiResponse.js    # Standardized responses
│       └── asyncHandler.js   # Async error wrapper
├── public/              # Static files
└── package.json         # Dependencies and scripts
```

## � Current Development Status

### ✅ Completed Features
- **Project Setup**: Environment configuration, database connection
- **Error Handling**: Custom ApiError class and asyncHandler utility
- **User Validation**: Input validation for registration with comprehensive checks
- **Duplicate Prevention**: Email and username uniqueness validation

### 🔄 In Progress
- **User Registration**: File upload handling and password hashing
- **Authentication**: JWT token generation and verification
- **File Management**: Cloudinary integration for avatar/cover images

### 📋 Next Steps
- Complete user registration flow
- Implement login functionality
- Add password reset capabilities
- Build video upload system

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.