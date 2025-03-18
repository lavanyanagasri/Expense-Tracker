
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "w-full py-6 px-8 flex items-center justify-between",
      "bg-background/80 backdrop-blur-lg backdrop-saturate-150 border-b border-border/50",
      "sticky top-0 z-10",
      "animate-fade-in",
      className
    )}>
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path 
              d="M12 6V18M18 12H6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xl font-medium tracking-tight">
          <span className="font-light">expense</span>
          <span className="font-semibold">tracker</span>
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
        {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </div>
    </header>
  );
};

export default Header;
