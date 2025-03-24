const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/attendance-system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, required: true },
    faceDescriptor: { type: Array }, // Store face descriptors for recognition
    attendance: [{
        date: { type: Date, default: Date.now },
        status: { type: String, default: 'present' }
    }]
});

const User = mongoose.model('User', userSchema);

// Set up storage for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Serve static files
app.use('/uploads', express.static('uploads'));

// API Routes
// 1. Register a new user with face image
app.post('/api/users/register', upload.single('profileImage'), async (req, res) => {
    try {
        const { name, email, faceDescriptor } = req.body;

        const user = new User({
            name,
            email,
            profileImage: `/uploads/${req.file.filename}`,
            faceDescriptor: JSON.parse(faceDescriptor)
        });

        await user.save();
        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 2. Get all users with their face data for recognition
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('name email profileImage faceDescriptor');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 3. Mark attendance for a user
app.post('/api/attendance/mark', async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Create today's date without time
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if attendance already marked for today
        const attendanceToday = user.attendance.find(a => {
            const attendanceDate = new Date(a.date);
            attendanceDate.setHours(0, 0, 0, 0);
            return attendanceDate.getTime() === today.getTime();
        });

        if (attendanceToday) {
            return res.status(400).json({ success: false, error: 'Attendance already marked for today' });
        }

        // Add attendance for today
        user.attendance.push({ date: today, status: 'present' });
        await user.save();

        res.status(200).json({ success: true, message: 'Attendance marked successfully', user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 4. Get attendance report for a user
app.get('/api/attendance/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, attendance: user.attendance });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 