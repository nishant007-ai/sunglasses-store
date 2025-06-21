import { FilesetResolver, FaceLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision";

let video = document.getElementById("videoElement");
let canvas = document.getElementById("canvasElement");
let ctx = canvas.getContext("2d");
let sunglasses = new Image();
sunglasses.src = "sunglasses.png"; // Add your sunglasses image here

async function loadFaceLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    return await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/models/face_landmarker.task" },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO"
    });
}

async function startCamera() {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
}

async function detectFace() {
    const faceLandmarker = await loadFaceLandmarker();
    
    function processFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        let detections = faceLandmarker.detectForVideo(video, performance.now());
        if (detections.faceLandmarks.length > 0) {
            let nose = detections.faceLandmarks[0][1];  // Nose landmark
            ctx.drawImage(sunglasses, nose.x * canvas.width - 50, nose.y * canvas.height - 40, 100, 50);
        }
        requestAnimationFrame(processFrame);
    }
    processFrame();
}

startCamera();
detectFace();
