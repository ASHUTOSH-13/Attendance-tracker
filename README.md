# Face Recognition-based Attendance System

A modern, secure, and efficient attendance management system that uses face recognition technology to mark attendance. This system eliminates the need for manual attendance tracking and provides a seamless experience for both users and administrators.

## Features

- 🔐 Secure user authentication
- 👤 Face recognition for attendance marking
- 📊 Real-time attendance tracking
- 📱 Responsive dashboard
- 📈 Attendance reports and analytics
- 🔒 Secure file handling
- 🎨 Modern and intuitive UI

## Tech Stack

### Frontend
- React.js
- Vite
- CSS Modules
- Face-API.js (for face recognition)

### Backend
- Node.js
- Express.js
- MongoDB
- Multer (for file uploads)
- bcrypt (for password hashing)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-system
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd ../backend
npm install
```

4. Set up MongoDB:
- Ensure MongoDB is running on your system
- The application will connect to `mongodb://localhost:27017/attendance-system` by default

## Running the Application

1. Start the Backend Server:
```bash
cd backend
npm start
```
The server will run on `http://localhost:5000`

2. Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

## Project Structure

```
attendance-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── assets/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── uploads/
│   ├── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login

### Attendance
- `POST /api/attendance/mark` - Mark attendance using face recognition
- `GET /api/attendance/:userId` - Get attendance report for a user

### User Management
- `GET /api/users` - Get all users (for face recognition)
- `GET /api/users/dashboard/:userId` - Get user dashboard data

## Security Features

- Password hashing using bcrypt
- Secure file upload handling
- CORS protection
- Input validation
- Error handling
- Secure session management

## Usage Guide

1. **Registration**
   - Navigate to the registration page
   - Fill in your details
   - Upload a clear face photo
   - Complete the registration process

2. **Login**
   - Enter your email and password
   - Access your dashboard

3. **Marking Attendance**
   - Navigate to the attendance section
   - Allow camera access
   - Position your face in the frame
   - Wait for face recognition confirmation

4. **Viewing Reports**
   - Access the dashboard
   - View attendance history
   - Download attendance reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

## Acknowledgments

- Face-API.js for face recognition capabilities
- MongoDB for database management
- React and Node.js communities for their excellent tools and libraries 