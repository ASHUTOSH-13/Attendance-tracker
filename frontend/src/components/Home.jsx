import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import './Home.css';

const Home = () => {
    const [initializing, setInitializing] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [recognitionResult, setRecognitionResult] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const videoRef = useRef();
    const canvasRef = useRef();
    const streamRef = useRef();

    // Initialize Face-API models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Make sure to copy face-api.js models to your public folder

            try {
                await Promise.all([
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
                ]);

                setInitializing(false);
                console.log('Face recognition models loaded');

                // Fetch users with face data
                fetchUsers();
            } catch (error) {
                console.error('Error loading models:', error);
                setMessage('Error loading face recognition models');
            }
        };

        loadModels();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Fetch all users with their face descriptors
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/users');

            // Convert stored descriptor arrays back to Float32Array for face-api
            const usersWithDescriptors = response.data.users.map(user => ({
                ...user,
                faceDescriptor: user.faceDescriptor ? new Float32Array(user.faceDescriptor) : null
            }));

            setUsers(usersWithDescriptors);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Error loading user data');
            setLoading(false);
        }
    };

    // Start camera and facial recognition
    const startCamera = async () => {
        if (initializing) {
            setMessage('Face recognition models are still loading...');
            return;
        }

        try {
            // Reset previous results
            setRecognitionResult(null);
            setMessage('Requesting camera access...');

            // First check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support camera access. Please use a modern browser.');
            }

            // Set camera active first to ensure video element is rendered
            setCameraActive(true);

            // Wait for the next render cycle to ensure video element is mounted
            await new Promise(resolve => setTimeout(resolve, 0));

            // Access webcam with basic constraints first
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
            } catch (initialError) {
                // If basic constraints fail, try with specific constraints
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    }
                });
            }

            console.log('Camera stream obtained:', stream);
            streamRef.current = stream;

            // Ensure video element exists and is ready
            if (!videoRef.current) {
                throw new Error('Video element not found');
            }

            // Set the video source
            videoRef.current.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve, reject) => {
                if (!videoRef.current) {
                    reject(new Error('Video element not found'));
                    return;
                }

                const timeout = setTimeout(() => {
                    reject(new Error('Video stream timeout'));
                }, 5000);

                videoRef.current.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    resolve();
                };

                videoRef.current.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };
            });

            setMessage('Camera active. Please position your face in the frame.');

        } catch (error) {
            console.error('Detailed camera error:', error);
            let errorMessage = 'Error accessing camera. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please grant camera permissions in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera device found. Please connect a camera and try again.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is in use by another application. Please close other apps using the camera.';
            } else if (error.message === 'Video stream timeout') {
                errorMessage += 'Camera stream took too long to initialize. Please try again.';
            } else {
                errorMessage += error.message;
            }

            setMessage(errorMessage);
            setCameraActive(false);

            // Clean up any partial stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    // Perform face recognition
    const recognizeFace = async () => {
        if (!videoRef.current || !cameraActive || users.length === 0) {
            setMessage('Camera not active or no users loaded');
            return;
        }

        setLoading(true);
        setMessage('Analyzing face...');

        try {
            // Create face matcher with loaded users
            const labeledDescriptors = users
                .filter(user => user.faceDescriptor)
                .map(user => {
                    return new faceapi.LabeledFaceDescriptors(
                        user._id, // Use user ID as label
                        [user.faceDescriptor] // Face descriptor for comparison
                    );
                });

            if (labeledDescriptors.length === 0) {
                setMessage('No face data available for recognition');
                setLoading(false);
                return;
            }

            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 distance threshold

            // Get current frame from video
            const detections = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setMessage('No face detected. Please ensure your face is clearly visible.');
                setLoading(false);
                return;
            }

            // Match detected face against our database
            const match = faceMatcher.findBestMatch(detections.descriptor);

            // If we have a match (not 'unknown')
            if (match.label !== 'unknown') {
                const userId = match.label;
                const matchedUser = users.find(user => user._id === userId);

                if (matchedUser) {
                    try {
                        // Mark attendance
                        const response = await axios.post('http://localhost:5000/api/attendance/mark', { userId });

                        setRecognitionResult({
                            success: true,
                            user: matchedUser,
                            message: response.data.message || 'Attendance marked successfully!'
                        });
                    } catch (error) {
                        console.error('Error marking attendance:', error);
                        setRecognitionResult({
                            success: false,
                            message: error.response?.data?.error || 'Error marking attendance'
                        });
                    }
                } else {
                    setRecognitionResult({
                        success: false,
                        message: 'User matched but not found in database'
                    });
                }
            } else {
                setRecognitionResult({
                    success: false,
                    message: 'Face not recognized. Please register first.'
                });
            }
        } catch (error) {
            console.error('Error during face recognition:', error);
            setRecognitionResult({
                success: false,
                message: 'Error during face recognition'
            });
        }

        setLoading(false);
        stopCamera(); // Stop camera after recognition
    };

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setShowLogin(false);
        setMessage('Welcome back, ' + user.name + '!');
        // Navigate to dashboard after successful login
        window.location.href = '/dashboard';
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setMessage('');
    };

    return (
        <div className="home-container">
            <div className="header">
                <h2>Attendance System</h2>
                <div className="auth-buttons">
                    {currentUser ? (
                        <>
                            <span className="welcome-text">Welcome, {currentUser.name}</span>
                            <button onClick={handleLogout} className="auth-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setShowLogin(true)} className="auth-button">
                                Login
                            </button>
                            <button onClick={() => setShowRegister(true)} className="auth-button">
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showLogin ? (
                <Login onLogin={handleLoginSuccess} />
            ) : showRegister ? (
                <Register />
            ) : (
                <>
                    {!cameraActive ? (
                        <button
                            className="attendance-button"
                            onClick={startCamera}
                            disabled={initializing || loading}
                        >
                            {initializing ? 'Loading Face Recognition...' : 'Mark Your Attendance'}
                        </button>
                    ) : (
                        <div className="camera-container">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', maxWidth: '640px' }}
                                onLoadedMetadata={() => {
                                    console.log('Video metadata loaded');
                                    setMessage('Camera active. Please position your face in the frame.');
                                }}
                                onError={(e) => {
                                    console.error('Video error:', e);
                                    setMessage('Error with video stream. Please try again.');
                                }}
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            <div className="camera-controls">
                                <button onClick={recognizeFace} disabled={loading}>
                                    {loading ? 'Processing...' : 'Verify Face'}
                                </button>
                                <button onClick={stopCamera}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {message && <p className="message">{message}</p>}

                    {recognitionResult && (
                        <div className={`result ${recognitionResult.success ? 'success' : 'failure'}`}>
                            {recognitionResult.success ? (
                                <>
                                    <h3>Attendance Marked!</h3>
                                    <p>Welcome, {recognitionResult.user.name}</p>
                                    <img
                                        src={`http://localhost:5000${recognitionResult.user.profileImage}`}
                                        alt="Profile"
                                        className="profile-thumbnail"
                                    />
                                    <p>{recognitionResult.message}</p>
                                </>
                            ) : (
                                <>
                                    <h3>Recognition Failed</h3>
                                    <p>{recognitionResult.message}</p>
                                </>
                            )}
                        </div>
                    )}

                    {!currentUser && (
                        <div className="welcome-message">
                            <h3>Welcome to the Attendance System</h3>
                            <p>You can mark your attendance using face recognition. Login or register to access additional features.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home; 