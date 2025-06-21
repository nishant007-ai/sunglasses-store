const loadOpenCV = () => {
    let script = document.createElement("script");
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.onload = () => {
        console.log("OpenCV.js loaded!");
        detectFace("faceImage", "faceCanvas");  // Ensure OpenCV is loaded before running
    };
    document.body.appendChild(script);
};
loadOpenCV();

function detectFace(imageId, canvasId) {
    let img = document.getElementById(imageId);
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext("2d");

    // Ensure image is fully loaded
    img.onload = () => {
        let src = cv.imread(img);
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        let faceCascade = new cv.CascadeClassifier();
        faceCascade.load('/public/haarcascade_frontalface_default.xml', () => {
            let faces = new cv.RectVector();
            let msize = new cv.Size(200, 200);
            faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

            for (let i = 0; i < faces.size(); i++) {
                let face = faces.get(i);
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
                ctx.strokeRect(face.x, face.y, face.width, face.height);
            }

            // Cleanup memory
            src.delete(); gray.delete(); faces.delete(); faceCascade.delete();
        });
    };
}
