import { useEffect, useRef } from 'react';

interface AnimatedGridProps {
  spacing?: number;
  opacity?: number;
  animationSpeed?: number;
}

const AnimatedGrid = ({ 
  spacing = 40, 
  opacity = 0.1, 
  animationSpeed = 1 
}: AnimatedGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001 * animationSpeed;
      const { width, height } = canvas;
      
      // Draw animated grid
      ctx.strokeStyle = `hsla(262, 83%, 58%, ${opacity})`;
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      for (let x = 0; x < width; x += spacing) {
        const wave = Math.sin(time + x * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(x + wave, 0);
        ctx.lineTo(x - wave, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += spacing) {
        const wave = Math.cos(time + y * 0.01) * 10;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(width, y - wave);
        ctx.stroke();
      }
      
      // Add intersection points with subtle glow
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const waveX = Math.sin(time + x * 0.01) * 10;
          const waveY = Math.cos(time + y * 0.01) * 10;
          const pointOpacity = (Math.sin(time + x * 0.02 + y * 0.02) + 1) * 0.5 * opacity * 2;
          
          if (pointOpacity > 0.05) {
            ctx.beginPath();
            ctx.arc(x + waveX, y + waveY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(262, 83%, 58%, ${pointOpacity})`;
            ctx.fill();
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spacing, opacity, animationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default AnimatedGrid;