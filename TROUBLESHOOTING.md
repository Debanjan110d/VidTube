# 🛠️ Troubleshooting Guide - VidTube Project

## Table of Contents
- [Common Startup Issues](#common-startup-issues)
- [MongoDB Connection Problems](#mongodb-connection-problems)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Prevention Best Practices](#prevention-best-practices)
- [Quick Fixes](#quick-fixes)

---

## Common Startup Issues

### 🔴 Problem: Application Crashes on Startup

**Symptoms:**
- Server fails to start
- MongoDB connection errors
- Environment variables showing as `undefined`
- Error: "Invalid scheme, expected connection string to start with mongodb://"

---

## MongoDB Connection Problems

### Issue 1: Invalid MongoDB URI Format

**❌ Incorrect:**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.cqo5rmk.mongodb.net
```

**✅ Correct:**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.cqo5rmk.mongodb.net
```

**Cause:** 
- Angle brackets `< >` are placeholder indicators in documentation, not actual syntax
- MongoDB driver expects literal username and password values

**Solution:**
Replace `<username>` and `<password>` with your actual MongoDB Atlas credentials without angle brackets.

---

## Environment Configuration Issues

### Issue 2: Wrong .env File Path

**❌ Incorrect:**
```javascript
dotenv.config({
    path: '../.env'  // Looking in parent directory
})
```

**✅ Correct:**
```javascript
dotenv.config({
    path: './src/.env'  // Correct path from project root
})
```

**Cause:**
- Script runs from project root directory
- Relative path `../` points to parent directory instead of `src/` subdirectory
- dotenv cannot find the `.env` file

**Solution:**
Use the correct relative path from where the script is executed (project root).

### Issue 3: Missing Required Environment Variables

**❌ Problem:**
```env
# CORS_ORIGIN=http://localhost:3000  (commented out)
```

**✅ Solution:**
```env
CORS_ORIGIN=http://localhost:3000  # Active configuration
```

**Cause:**
- CORS middleware expects `process.env.CORS_ORIGIN` to be defined
- Commented variables are ignored by dotenv
- Undefined CORS origin can cause cross-origin request failures

### Issue 4: Extra Spaces in Environment Variables

**❌ Problematic:**
```env
PORT = 8000
MONGO_URI = mongodb+srv://...
```

**✅ Better:**
```env
PORT=8000
MONGO_URI=mongodb+srv://...
```

**Cause:**
- Some environment parsers are sensitive to extra whitespace
- Inconsistent formatting can lead to parsing issues

---

## Prevention Best Practices

### 1. Environment File Management
```env
# ✅ Use clear, descriptive comments
PORT=8000  # Server port number

# ✅ No trailing slashes or spaces
MONGO_URI=mongodb+srv://user:pass@cluster.net

# ✅ Document security considerations
CORS_ORIGIN=http://localhost:3000  # Frontend URL for CORS
```

### 2. Path Configuration
```javascript
// ✅ Use absolute paths or well-documented relative paths
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '.env')
});
```

### 3. Environment Validation
```javascript
// ✅ Validate critical environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'CORS_ORIGIN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    process.exit(1);
}
```

### 4. MongoDB URI Best Practices
```env
# ✅ Complete URI format
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# ✅ Local development fallback
MONGO_URI_LOCAL=mongodb://localhost:27017/vidtube_dev

# ✅ Connection options (optional)
MONGO_URI=mongodb+srv://user:pass@cluster.net/db?retryWrites=true&w=majority
```

---

## Quick Fixes

### Debug Environment Loading
Add temporary debugging to verify environment variables:
```javascript
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'LOADED' : 'MISSING');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
```

### Test MongoDB Connection
```javascript
// Test connection with detailed error logging
connectDB()
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        // Start server only after successful DB connection
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
```

### Verify File Paths
```bash
# Check if .env file exists and is readable
ls -la src/.env
cat src/.env
```

---

## Error Reference

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| `Invalid scheme, expected connection string to start with "mongodb://"` | Malformed MongoDB URI | Check URI format, remove angle brackets |
| `Environment variables showing as undefined` | Wrong .env path or file not found | Verify dotenv path configuration |
| `ENOTFOUND` or DNS errors | Incorrect cluster URL | Verify MongoDB Atlas cluster URL |
| `Authentication failed` | Wrong username/password | Check MongoDB Atlas credentials |
| `Cannot read properties of undefined` | Missing environment variables | Ensure all required vars are set |

---

## Getting Help

If you encounter issues not covered here:

1. **Check the console output** for specific error messages
2. **Verify your .env file** exists and has correct formatting
3. **Test MongoDB connection** separately using MongoDB Compass
4. **Review this troubleshooting guide** for similar issues
5. **Check the project logs** for detailed error information

---

## Project Structure Reference
```
project-yt/
├── src/
│   ├── .env              # Environment variables (THIS FILE)
│   ├── .env.sample       # Environment template
│   ├── index.js          # Entry point (dotenv config here)
│   ├── app.js            # Express app configuration
│   └── db/
│       └── index.js      # MongoDB connection logic
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

Remember: Always keep your `.env` file secure and never commit it to version control!
