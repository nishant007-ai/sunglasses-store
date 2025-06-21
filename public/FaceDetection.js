import React, { useRef, useEffect } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import * as tf from "@tensorflow/tfjs-core";
import { FaceMesh } from "@mediapipe/face_mesh";

const FaceDetection = ({ sunglassesImg }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      const video = videoRef.current;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
      }
    };

    setupCamera();
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
      );

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const processFrame = async () => {
        if (!video || video.readyState !== 4) {
          requestAnimationFrame(processFrame);
          return;
        }

        const faces = await model.estimateFaces(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (faces.length > 0) {
          const keypoints = faces[0].keypoints;
          const leftEye = keypoints[33]; // Adjust if needed
          const rightEye = keypoints[263];

          // Draw Sunglasses on Eyes
          const img = new Image();
          img.src = sunglassesImg;
          img.onload = () => {
            const width = rightEye.x - leftEye.x;
            const height = width / 2; // Adjust size
            ctx.drawImage(img, leftEye.x - width * 0.3, leftEye.y - height / 2, width * 1.6, height * 1.6);
          };
        }

        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    detectFace();
  }, [sunglassesImg]);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "auto" }}></video>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
    </div>
  );
};

export default FaceDetection;
// Load Face API
const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvasElement");
const ctx = canvas.getContext("2d");
const registerFaceBtn = document.getElementById("registerFace");

let storedFaceDescriptor = null; // To store the registered face

// Load models
async function loadFaceAPI() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models'); // For better face detection
}

// Start video stream
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error("Error accessing webcam:", err));
}

// Register face
async function registerFace() {
    const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
    if (detections) {
        storedFaceDescriptor = detections.descriptor;
        alert("Face registered successfully!");
    } else {
        alert("No face detected. Try again.");
    }
}

// Match face for login
async function loginWithFace() {
    const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
    if (detections && storedFaceDescriptor) {
        const distance = faceapi.euclideanDistance(detections.descriptor, storedFaceDescriptor);
        if (distance < 0.6) {  // 0.6 is a good threshold
            alert("Face recognized! Logging in...");
            window.location.href = "dashboard.html"; // Redirect to next page
        } else {
            alert("Face not recognized. Try again.");
        }
    } else {
        alert("No face detected. Try again.");
    }
}

// Event Listeners
registerFaceBtn.addEventListener("click", registerFace);
video.addEventListener('play', () => {
    setInterval(loginWithFace, 5000); // Check face every 5 sec
});

// Load API and start video
loadFaceAPI().then(startVideo);
