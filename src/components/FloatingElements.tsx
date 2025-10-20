import { useEffect, useRef, useCallback } from 'react';

interface FloatingElementsProps {
  elementCount?: number;
  animationSpeed?: 'slow' | 'medium' | 'fast';
}

const FloatingElements = ({ elementCount = 8, animationSpeed = 'medium' }: FloatingElementsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const elementsRef = useRef<Array<{
    element: HTMLDivElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
  }>>([]);

  const speedMultiplier = animationSpeed === 'slow' ? 0.3 : animationSpeed === 'medium' ? 0.6 : 1;

  const createFloatingElement = useCallback((index: number) => {
    const element = document.createElement('div');
    element.className = 'absolute pointer-events-none transition-all duration-1000 ease-out';
    
    // Random shapes
    const shapes = ['circle', 'triangle', 'square', 'diamond'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const size = 8 + Math.random() * 16;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const vx = (Math.random() - 0.5) * speedMultiplier;
    const vy = (Math.random() - 0.5) * speedMultiplier;
    const opacity = 0.1 + Math.random() * 0.3;
    const hue = 250 + Math.random() * 40; // Purple spectrum
    
    // Style based on shape
    switch (shape) {
      case 'circle':
        element.style.borderRadius = '50%';
        element.style.background = `hsla(${hue}, 70%, 60%, ${opacity})`;
        break;
      case 'triangle':
        element.style.width = '0';
        element.style.height = '0';
        element.style.borderLeft = `${size/2}px solid transparent`;
        element.style.borderRight = `${size/2}px solid transparent`;
        element.style.borderBottom = `${size}px solid hsla(${hue}, 70%, 60%, ${opacity})`;
        break;
      case 'square':
        element.style.background = `hsla(${hue}, 70%, 60%, ${opacity})`;
        element.style.transform = `rotate(${Math.random() * 45}deg)`;
        break;
      case 'diamond':
        element.style.background = `hsla(${hue}, 70%, 60%, ${opacity})`;
        element.style.transform = 'rotate(45deg)';
        element.style.borderRadius = '2px';
        break;
    }
    
    if (shape !== 'triangle') {
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
    }
    
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    return {
      element,
      x,
      y,
      vx,
      vy,
      size,
      opacity,
      hue
    };
  }, [speedMultiplier]);

  const animate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    elementsRef.current.forEach((item) => {
      // Update position
      item.x += item.vx;
      item.y += item.vy;
      
      // Boundary bouncing
      if (item.x <= 0 || item.x >= rect.width - item.size) item.vx *= -1;
      if (item.y <= 0 || item.y >= rect.height - item.size) item.vy *= -1;
      
      // Keep within bounds
      item.x = Math.max(0, Math.min(rect.width - item.size, item.x));
      item.y = Math.max(0, Math.min(rect.height - item.size, item.y));
      
      // Apply position
      item.element.style.left = `${item.x}px`;
      item.element.style.top = `${item.y}px`;
      
      // Subtle opacity animation
      const time = Date.now() * 0.001;
      const newOpacity = item.opacity + Math.sin(time + item.x * 0.01) * 0.1;
      item.element.style.opacity = Math.max(0.05, Math.min(0.4, newOpacity)).toString();
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create floating elements
    for (let i = 0; i < elementCount; i++) {
      const floatingItem = createFloatingElement(i);
      container.appendChild(floatingItem.element);
      elementsRef.current.push(floatingItem);
    }

    // Start animation
    animate();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Cleanup elements
      elementsRef.current.forEach(item => {
        if (item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
      elementsRef.current = [];
    };
  }, [elementCount, createFloatingElement, animate]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default FloatingElements;