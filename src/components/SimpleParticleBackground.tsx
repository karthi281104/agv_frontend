import { useEffect, useRef } from 'react';

interface SimpleParticleBackgroundProps {
  density?: 'low' | 'medium' | 'high';
  color?: string;
}

const SimpleParticleBackground = ({ 
  density = 'low', 
  color = 'hsl(var(--primary))' 
}: SimpleParticleBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particleCount = density === 'low' ? 15 : density === 'medium' ? 25 : 35;
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full opacity-20 animate-pulse';
      
      // Random size
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation
      particle.style.animationDelay = `${Math.random() * 3}s`;
      particle.style.animationDuration = `${2 + Math.random() * 3}s`;
      
      // Add floating animation
      const keyframes = `
        @keyframes float-${i} {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-${10 + Math.random() * 10}px) translateX(${5 + Math.random() * 10}px); }
          50% { transform: translateY(-${5 + Math.random() * 15}px) translateX(-${5 + Math.random() * 10}px); }
          75% { transform: translateY(-${15 + Math.random() * 5}px) translateX(${10 + Math.random() * 5}px); }
        }
      `;
      
      // Add keyframes to document
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      particle.style.animation += `, float-${i} ${8 + Math.random() * 12}s ease-in-out infinite`;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [density, color]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default SimpleParticleBackground;