import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import './Register.css';

const Register = () => {
    const [initializing, setInitializing] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profileImage: null
    });
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Initialize Face-API models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';

            try {
                await Promise.all([
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
                ]);

                setInitializing(false);
                console.log('Face recognition models loaded');
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

    // Start camera
    const startCamera = async () => {
        if (initializing) {
            setMessage('Face recognition models are still loading...');
            return;
        }

        try {
            setMessage('Requesting camera access...');
            setCameraActive(true); // Set camera active first to render video element

            // Request camera with specific constraints
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            });

            console.log('Camera stream obtained:', stream);
            streamRef.current = stream;

            // Wait for the next render cycle to ensure video element is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setMessage('Camera started successfully');
                } else {
                    throw new Error('Video element not found');
                }
            }, 0);

        } catch (error) {
            console.error('Detailed camera error:', error);
            let errorMessage = 'Error accessing camera. ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Please grant camera permissions in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera device found. Please connect a camera and try again.';
            } else if (error.name === 'NotReadableError') {
                errorMessage += 'Camera is in use by another application. Please close other apps using the camera.';
            } else {
                errorMessage += error.message;
            }

            setMessage(errorMessage);
            setCameraActive(false);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('Track stopped:', track.kind);
                });
                setCameraActive(false);
                setMessage('Camera stopped');
            } catch (error) {
                console.error('Error stopping camera:', error);
            }
        }
    };

    // Capture face and generate descriptor
    const captureFace = async () => {
        if (!videoRef.current || !cameraActive) {
            setMessage('Camera not active');
            return;
        }

        setLoading(true);
        setMessage('Capturing face...');

        try {
            // Get current frame from video
            const detections = await faceapi.detectSingleFace(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setMessage('No face detected. Please ensure your face is clearly visible.');
                setLoading(false);
                return;
            }

            // Convert video frame to blob for profile image
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

            canvas.toBlob(blob => {
                setFormData(prev => ({
                    ...prev,
                    profileImage: blob
                }));
                setFaceDescriptor(Array.from(detections.descriptor));
                setMessage('Face captured successfully!');
            }, 'image/jpeg');

            setLoading(false);
            stopCamera();
        } catch (error) {
            console.error('Error capturing face:', error);
            setMessage('Error capturing face');
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faceDescriptor || !formData.profileImage) {
            setMessage('Please capture your face first');
            return;
        }

        setLoading(true);
        setMessage('Registering user...');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('profileImage', formData.profileImage);
            formDataToSend.append('faceDescriptor', JSON.stringify(faceDescriptor));

            const response = await axios.post('http://localhost:5000/api/users/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Registration successful! You can now use the attendance system.');
            setFormData({ name: '', email: '', profileImage: null });
            setFaceDescriptor(null);
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage(error.response?.data?.error || 'Error registering user');
        }

        setLoading(false);
    };

    return (
        <div className="register-container">
            <h2>Register New User</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                    />
                </div>

                <div className="camera-section">
                    <div className="camera-container" style={{ display: cameraActive ? 'block' : 'none' }}>
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
                            <button
                                type="button"
                                onClick={captureFace}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Capture Face'}
                            </button>
                            <button
                                type="button"
                                onClick={stopCamera}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                    {!cameraActive && (
                        <button
                            type="button"
                            className="camera-button"
                            onClick={startCamera}
                            disabled={initializing}
                        >
                            {initializing ? 'Loading...' : 'Start Camera'}
                        </button>
                    )}
                </div>

                {message && <p className="message">{message}</p>}

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading || !faceDescriptor || !formData.profileImage}
                >
                    {loading ? 'Registering...' : 'Register User'}
                </button>
            </form>
        </div>
    );
};

export default Register; 