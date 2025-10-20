import ParticleBackground from './ParticleBackground';

const DecorativeBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Advanced Particle Animation */}
      <ParticleBackground />
      
      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0">
        {/* Animated dots with improved positioning */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
        <div className="absolute top-40 left-40 w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
        <div className="absolute top-60 right-60 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-60 w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Additional floating elements */}
        <div className="absolute top-32 right-32 w-4 h-4 bg-primary/20 rounded-full animate-ping" style={{ animationDelay: '0.8s', animationDuration: '2s' }} />
        <div className="absolute bottom-32 right-40 w-2 h-2 bg-primary/35 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-primary/25 rounded-full animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '5s' }} />
      </div>
      
      {/* Enhanced Network lines with animation */}
      <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.3 }} />
            <stop offset="50%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        
        <line x1="10%" y1="20%" x2="20%" y2="35%" stroke="url(#lineGradient)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
        </line>
        <line x1="20%" y1="35%" x2="15%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="85%" y1="25%" x2="75%" y2="40%" stroke="url(#lineGradient)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3.5s" repeatCount="indefinite" />
        </line>
        <line x1="75%" y1="40%" x2="82%" y2="55%" stroke="url(#lineGradient)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
        </line>
        
        {/* Additional animated lines */}
        <line x1="30%" y1="70%" x2="50%" y2="80%" stroke="url(#lineGradient)" strokeWidth="1">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="4.5s" repeatCount="indefinite" />
        </line>
        <line x1="60%" y1="15%" x2="80%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3.8s" repeatCount="indefinite" />
        </line>
      </svg>
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-50" />
    </div>
  );
};

export default DecorativeBackground;
