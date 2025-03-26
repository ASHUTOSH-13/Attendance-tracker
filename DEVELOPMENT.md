# Development Guide

This guide provides detailed information for developers working on the Face Recognition-based Attendance System.

## Development Environment Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- npm or yarn package manager

### Initial Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-system
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your_jwt_secret_here
```

## Development Workflow

### Frontend Development

The frontend is built with React and Vite. Key directories:

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── assets/        # Static assets
│   ├── utils/         # Utility functions
│   └── App.jsx        # Main application component
```

#### Running the Frontend
```bash
cd frontend
npm run dev
```

#### Building for Production
```bash
npm run build
```

### Backend Development

The backend is built with Node.js and Express. Key files:

```
backend/
├── index.js           # Main application entry point
├── uploads/           # Directory for uploaded files
└── package.json       # Dependencies and scripts
```

#### Running the Backend
```bash
cd backend
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Code Style Guide

### JavaScript/JSX Style

- Use ES6+ features
- Use functional components in React
- Follow the Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add comments for complex logic

Example:
```javascript
// Good
const UserProfile = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await updateUserProfile(user);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <form onSubmit={handleSubmit}>
        {/* Form content */}
      </form>
    </div>
  );
};

// Bad
const up = ({ u }) => {
  const [l, sl] = useState(false);
  const hs = async (e) => {
    e.preventDefault();
    sl(true);
    try {
      await updateUserProfile(u);
    } catch (err) {
      console.error(err);
    } finally {
      sl(false);
    }
  };
  return (
    <div>
      <h2>{u.name}</h2>
      <form onSubmit={hs}>
        {/* Form content */}
      </form>
    </div>
  );
};
```

### CSS Style

- Use CSS Modules for component-specific styles
- Follow BEM naming convention
- Use meaningful class names
- Keep styles modular and reusable

Example:
```css
/* Good */
.user-profile {
  padding: 20px;
  border-radius: 8px;
}

.user-profile__header {
  margin-bottom: 16px;
}

.user-profile__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Bad */
.up {
  padding: 20px;
  border-radius: 8px;
}

.h {
  margin-bottom: 16px;
}

.f {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

## Testing

### Frontend Testing

Run frontend tests:
```bash
cd frontend
npm test
```

### Backend Testing

Run backend tests:
```bash
cd backend
npm test
```

## Git Workflow

1. Create a new branch for each feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: add your feature description"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## Common Issues and Solutions

### MongoDB Connection Issues

If you can't connect to MongoDB:
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. Verify MongoDB port is not blocked

### Face Recognition Issues

If face recognition is not working:
1. Check camera permissions
2. Verify face-api.js models are loaded
3. Ensure good lighting conditions
4. Check image quality and size

### File Upload Issues

If file uploads fail:
1. Check file size limits
2. Verify file types
3. Ensure upload directory exists
4. Check file permissions

## Performance Optimization

### Frontend Optimization

1. Use React.memo for expensive components
2. Implement lazy loading
3. Optimize images
4. Use proper caching strategies

### Backend Optimization

1. Implement rate limiting
2. Use proper indexing in MongoDB
3. Implement caching where appropriate
4. Optimize file upload handling

## Security Best Practices

1. Never commit sensitive data
2. Use environment variables for secrets
3. Implement proper input validation
4. Use HTTPS in production
5. Regular security audits

## Deployment

### Frontend Deployment

1. Build the application:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` directory to your hosting service

### Backend Deployment

1. Set up production environment variables
2. Use PM2 or similar for process management
3. Set up proper logging
4. Configure SSL/TLS

## Monitoring and Logging

1. Use proper error logging
2. Implement performance monitoring
3. Set up alerts for critical issues
4. Regular backup procedures

## Contributing

1. Follow the code style guide
2. Write meaningful commit messages
3. Include tests for new features
4. Update documentation as needed
5. Create detailed pull requests

## Resources

- [React Documentation](https://reactjs.org/)
- [Node.js Documentation](https://nodejs.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Face-API.js Documentation](https://github.com/justadudewhohacks/face-api.js) 