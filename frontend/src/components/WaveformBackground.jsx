import React, { useEffect, useRef } from 'react';
import './WaveformBackground.css';

const WaveformBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;

    // Define the properties of the waves
    const waves = [
      {
        amplitude: 90,
        frequency: 0.008,
        phase: 0,
        color: 'rgba(59, 130, 246, 0.15)',
        speed: 0.015,
      },
      {
        amplitude: 70,
        frequency: 0.01,
        phase: 1.5,
        color: 'rgba(59, 130, 246, 0.2)',
        speed: 0.02,
      },
      {
        amplitude: 50,
        frequency: 0.015,
        phase: 3,
        color: 'rgba(96, 165, 250, 0.25)',
        speed: 0.025,
      },
      {
        amplitude: 30,
        frequency: 0.02,
        phase: 4.5,
        color: 'rgba(147, 197, 253, 0.3)',
        speed: 0.03,
      },
    ];

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerY = canvas.height / 2;

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < canvas.width; x++) {
          const y =
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.cos(x * wave.frequency * 0.5 + wave.phase) * (wave.amplitude * 0.4) +
            centerY;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        wave.phase += wave.speed;
      });

      frameId = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} id="waveform-canvas" />;
};

export default WaveformBackground; 