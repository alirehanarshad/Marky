'use client';

import React, { useRef, useEffect } from 'react';

export default function SoundWaveVisualizer({ stream, isRecording }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!isRecording || !stream || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const render = () => {
        analyser.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw 24 dynamic audio bars with Marky Brand Gradient
        const barCount = 24;
        const barWidth = 3;
        const gap = (width - barCount * barWidth) / (barCount - 1);

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * (height - 4));

          const x = i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          // Marky Brand Gradient (Indigo -> Purple -> Coral)
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          // Left bars more indigo/violet, right bars more pink/coral
          const factor = i / barCount;
          if (factor < 0.35) {
            gradient.addColorStop(0, '#4239C4');
            gradient.addColorStop(1, '#7A5DBB');
          } else if (factor < 0.7) {
            gradient.addColorStop(0, '#7A5DBB');
            gradient.addColorStop(1, '#A73B9D');
          } else {
            gradient.addColorStop(0, '#D97FA5');
            gradient.addColorStop(1, '#F0A09F');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }

        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
    } catch (err) {
      console.warn('Audio visualizer error:', err);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={30}
      className="w-44 h-7 block"
    />
  );
}
