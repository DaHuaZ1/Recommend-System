//This CAPTCHA design idea is referenced at: https://www.bilibili.com/video/BV1T64y1f7kM.
import { useRef, useEffect } from 'react';

const CanvasCaptcha = ({ text }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Basic Style
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Character Drawing
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.font = `${24 + Math.random() * 6}px monospace`;
      ctx.fillStyle = `rgb(${50 + Math.random()*100},${50 + Math.random()*100},${50 + Math.random()*100})`;
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.save();
      ctx.translate(20 + i * 22, 30);
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Disturbance line
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Disturbance point
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

  }, [text]);

  return (
    <canvas
      role="img"
      ref={canvasRef}
      width={100}
      height={40}
      style={{
        border: '1px dashed #ccc',
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        userSelect: 'none'
      }}
    />
  );
};

export default CanvasCaptcha;
