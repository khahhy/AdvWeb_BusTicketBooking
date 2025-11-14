import React from 'react';

interface LogoLoopProps {
  className?: string;
  children: React.ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
}

export const LogoLoop: React.FC<LogoLoopProps> = ({ 
  className = '', 
  children, 
  speed = 'normal',
  direction = 'left' 
}) => {
  const speedClass = {
    slow: 'animate-[scroll_60s_linear_infinite]',
    normal: 'animate-[scroll_40s_linear_infinite]',
    fast: 'animate-[scroll_20s_linear_infinite]'
  }[speed];

  const directionClass = direction === 'right' ? 'flex-row-reverse' : 'flex-row';

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className={`flex ${directionClass} ${speedClass}`}>
        <div className="flex items-center justify-around min-w-full shrink-0">
          {children}
        </div>
        <div className="flex items-center justify-around min-w-full shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LogoLoop;