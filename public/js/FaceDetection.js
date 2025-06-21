// Load Face API from CDN
const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvasElement");
const ctx = canvas.getContext("2d");

// Load face detection model
async function loadFaceAPI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
}

// Start video stream
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Error accessing webcam:", err));
}

// Detect faces in real-time
async function detectFace() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, detections);
}

// Run everything
video.addEventListener('play', () => {
    setInterval(detectFace, 100);
});

// Load API and start video
loadFaceAPI().then(startVideo);
