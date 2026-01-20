import React, { useRef, useEffect } from 'react';

const SkeletonOverlay = ({ poseData, width, height }) => {
    const canvasRef = useRef(null);

    // MediaPipe Pose Landmark Connections
    const CONNECTIONS = [
        [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Upper body
        [11, 23], [12, 24], // Torso
        [23, 24], // Hips
        [23, 25], [24, 26], [25, 27], [26, 28], // Legs
        [27, 29], [28, 30], [29, 31], [30, 32]  // Feet
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        if (!poseData || !poseData.landmarks || poseData.landmarks.length === 0) return;

        const landmarks = poseData.landmarks;
        const feedback = poseData.feedback;
        const color = feedback?.color === 'red' ? '#FF4545' : '#00FF94'; // Red or Green

        // Helper to get coordinates
        const getCoord = (index) => {
            const lm = landmarks[index];
            if (!lm) return { x: 0, y: 0 };
            return { x: lm.x * width, y: lm.y * height };
        };

        // Draw Connections
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';

        CONNECTIONS.forEach(([startIdx, endIdx]) => {
            const start = getCoord(startIdx);
            const end = getCoord(endIdx);

            // Check visibility threshold if needed, but MediaPipe usually handles it well
            if (landmarks[startIdx].visibility > 0.5 && landmarks[endIdx].visibility > 0.5) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        });

        // Draw Landmarks
        ctx.fillStyle = '#FFFFFF';
        landmarks.forEach((lm) => {
            if (lm.visibility > 0.5) {
                const x = lm.x * width;
                const y = lm.y * height;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
        });



    }, [poseData, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 pointer-events-none"
        />
    );
};

export default SkeletonOverlay;
