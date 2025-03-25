import * as faceapi from 'face-api.js';

// Initialize Face-API models
export const loadFaceRecognitionModels = async () => {
    const MODEL_URL = '/models';

    try {
        await Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        ]);

        console.log('Face recognition models loaded');
        return true;
    } catch (error) {
        console.error('Error loading models:', error);
        throw error;
    }
};

// Process uploaded image
export const processUploadedImage = async (file) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    const detections = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detections) {
        throw new Error('No face detected in the uploaded image');
    }

    return {
        imageUrl,
        faceDescriptor: detections.descriptor
    };
};

// Start camera
export const startCamera = async () => {
    try {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
        } catch (initialError) {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }
            });
        }

        return stream;
    } catch (error) {
        console.error('Detailed camera error:', error);
        throw error;
    }
};

// Capture face from camera
export const captureFaceFromCamera = async (videoRef, canvasRef) => {
    if (!videoRef.current || !canvasRef.current) {
        throw new Error('Camera not ready');
    }

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Draw current video frame on canvas
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Convert canvas to blob
    const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/jpeg'));
    const file = new File([blob], 'captured-face.jpg', { type: 'image/jpeg' });

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);

    // Detect face in the captured image
    const detections = await faceapi.detectSingleFace(canvasRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detections) {
        throw new Error('No face detected in the captured image');
    }

    return {
        file,
        imageUrl,
        faceDescriptor: detections.descriptor
    };
};

// Get error message for camera errors
export const getCameraErrorMessage = (error) => {
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

    return errorMessage;
}; 