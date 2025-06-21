import * as facemesh from '@mediapipe/face_mesh';

const faceMesh = new facemesh.FaceMesh();
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
  console.log(results.multiFaceLandmarks); // Get facial landmark coordinates
});

export default faceMesh;
