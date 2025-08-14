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
│   ├── db/              # Database configuration
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
├── public/              # Static files
└── package.json         # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.