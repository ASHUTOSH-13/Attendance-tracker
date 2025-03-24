const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL = 'https://github.com/justadudewhohacks/face-api.js/tree/master/weights';
const MODELS = [
    'face_detection_model-weights_manifest.json',
    'face_detection_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1'
];

const modelsDir = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

// Download each model file
MODELS.forEach(model => {
    const filePath = path.join(modelsDir, model);
    const fileUrl = `${MODEL_URL}/${model}`;

    https.get(fileUrl, (response) => {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded: ${model}`);
        });
    }).on('error', (err) => {
        console.error(`Error downloading ${model}:`, err.message);
    });
}); 