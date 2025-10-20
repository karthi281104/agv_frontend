import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  fadeDirection: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          fadeDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
    };
    initParticles();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Opacity animation
        particle.opacity += particle.fadeDirection * 0.005;
        if (particle.opacity <= 0.1 || particle.opacity >= 0.8) {
          particle.fadeDirection *= -1;
        }

        // Mouse interaction
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          const force = (120 - distance) / 120;
          particle.vx -= (dx / distance) * force * 0.1;
          particle.vy -= (dy / distance) * force * 0.1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(222, 84%, 5%, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.3;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `hsla(222, 84%, 5%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Add floating geometric shapes
      drawFloatingShapes(ctx, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const drawFloatingShapes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = Date.now() * 0.001;
    
    // Enhanced floating circles with gradient
    for (let i = 0; i < 4; i++) {
      const x = width * (0.2 + i * 0.2) + Math.sin(time + i * 2) * 50;
      const y = height * (0.3 + Math.sin(i) * 0.3) + Math.cos(time + i * 1.5) * 30;
      const size = 20 + Math.sin(time + i) * 8;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `hsla(262, 83%, 58%, 0.15)`);
      gradient.addColorStop(0.7, `hsla(262, 83%, 58%, 0.05)`);
      gradient.addColorStop(1, `hsla(262, 83%, 58%, 0)`);
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add stroke
      ctx.strokeStyle = `hsla(262, 83%, 58%, 0.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Enhanced floating triangles
    for (let i = 0; i < 3; i++) {
      const x = width * (0.6 + i * 0.15) + Math.cos(time + i * 3) * 40;
      const y = height * (0.4 + Math.cos(i) * 0.2) + Math.sin(time + i * 2.5) * 25;
      const size = 15 + Math.cos(time + i) * 5;
      const rotation = time * 0.5 + i * Math.PI / 3;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size, size);
      ctx.lineTo(size, size);
      ctx.closePath();
      
      // Fill with subtle gradient
      const gradient = ctx.createLinearGradient(-size, -size, size, size);
      gradient.addColorStop(0, `hsla(262, 83%, 58%, 0.08)`);
      gradient.addColorStop(1, `hsla(262, 83%, 58%, 0.02)`);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = `hsla(262, 83%, 58%, 0.12)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Enhanced floating hexagons
    for (let i = 0; i < 2; i++) {
      const x = width * (0.1 + i * 0.7) + Math.sin(time + i * 2.5) * 35;
      const y = height * (0.7 + Math.sin(i * 2) * 0.2) + Math.cos(time + i * 1.8) * 20;
      const size = 12 + Math.sin(time + i) * 3;
      const rotation = time * 0.3 + i * 0.5;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Draw hexagon
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const hx = Math.cos(angle) * size;
        const hy = Math.sin(angle) * size;
        if (j === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      
      ctx.strokeStyle = `hsla(262, 83%, 58%, 0.08)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Add some sparkle effects
    for (let i = 0; i < 10; i++) {
      const sparkleTime = time * 2 + i;
      const x = width * Math.random();
      const y = height * Math.random();
      const opacity = Math.abs(Math.sin(sparkleTime)) * 0.3;
      
      if (opacity > 0.2) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(262, 83%, 58%, ${opacity})`;
        ctx.fill();
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;