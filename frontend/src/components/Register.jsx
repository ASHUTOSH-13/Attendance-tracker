import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Register.css';
import {
    loadFaceRecognitionModels,
    processUploadedImage,
    startCamera,
    captureFaceFromCamera,
    getCameraErrorMessage
} from '../utils/faceRecognitionUtils';

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
    const [previewImage, setPreviewImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize Face-API models
    useEffect(() => {
        const initializeModels = async () => {
            try {
                await loadFaceRecognitionModels();
                setInitializing(false);
            } catch (error) {
                console.error('Error loading models:', error);
                setMessage('Error loading face recognition models');
            }
        };

        initializeModels();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Handle image upload
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            setMessage('Processing uploaded image...');

            const { imageUrl, faceDescriptor } = await processUploadedImage(file);
            setPreviewImage(imageUrl);
            setFaceDescriptor(faceDescriptor);
            setFormData(prev => ({ ...prev, profileImage: file }));
            setMessage('Face detected successfully! You can now submit the form.');
        } catch (error) {
            console.error('Error processing uploaded image:', error);
            setMessage('Error processing image. Please ensure it contains a clear face.');
            setPreviewImage(null);
            setFaceDescriptor(null);
            setFormData(prev => ({ ...prev, profileImage: null }));
        } finally {
            setLoading(false);
        }
    };

    // Start camera
    const handleStartCamera = async () => {
        if (initializing) {
            setMessage('Face recognition models are still loading...');
            return;
        }

        try {
            setMessage('Requesting camera access...');
            setCameraActive(true);

            await new Promise(resolve => setTimeout(resolve, 0));

            const stream = await startCamera();
            console.log('Camera stream obtained:', stream);
            streamRef.current = stream;

            if (!videoRef.current) {
                throw new Error('Video element not found');
            }

            videoRef.current.srcObject = stream;

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
            setMessage(getCameraErrorMessage(error));
            setCameraActive(false);

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

    // Capture face from camera
    const handleCaptureFace = async () => {
        try {
            setLoading(true);
            setMessage('Capturing face...');

            const { file, imageUrl, faceDescriptor } = await captureFaceFromCamera(videoRef, canvasRef);
            setPreviewImage(imageUrl);
            setFaceDescriptor(faceDescriptor);
            setFormData(prev => ({ ...prev, profileImage: file }));
            setMessage('Face captured successfully! You can now submit the form.');
            stopCamera();
        } catch (error) {
            console.error('Error capturing face:', error);
            setMessage('Error capturing face. Please try again.');
            setPreviewImage(null);
            setFaceDescriptor(null);
            setFormData(prev => ({ ...prev, profileImage: null }));
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!faceDescriptor || !formData.profileImage) {
            setMessage('Please capture or upload a face image first');
            return;
        }

        try {
            setLoading(true);
            setMessage('Registering user...');

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('profileImage', formData.profileImage);
            formDataToSend.append('faceDescriptor', JSON.stringify(Array.from(faceDescriptor)));

            const response = await axios.post('http://localhost:5000/api/users/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('User registered successfully!');
            setFormData({ name: '', email: '', profileImage: null });
            setFaceDescriptor(null);
            setPreviewImage(null);
        } catch (error) {
            console.error('Error registering user:', error);
            setMessage(error.response?.data?.message || 'Error registering user');
        } finally {
            setLoading(false);
        }
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

                <div className="image-section">
                    <div className="image-preview">
                        {previewImage && (
                            <img src={previewImage} alt="Preview" className="preview-image" />
                        )}
                    </div>

                    <div className="image-options">
                        <div className="camera-section">
                            {!cameraActive ? (
                                <button
                                    type="button"
                                    className="camera-button"
                                    onClick={handleStartCamera}
                                    disabled={initializing}
                                >
                                    {initializing ? 'Loading...' : 'Capture from Camera'}
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
                                        <button
                                            type="button"
                                            onClick={handleCaptureFace}
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
                            )}
                        </div>

                        <div className="upload-section">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                className="upload-button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                            >
                                Upload Image
                            </button>
                        </div>
                    </div>
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