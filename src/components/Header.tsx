
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import AuthDialog from './auth/AuthDialog';
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

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
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full text-sm">
              <User size={14} />
              <span>{user?.name || user?.email}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              title="Logout"
            >
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setAuthDialogOpen(true)}
          >
            Login
          </Button>
        )}
      </div>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </header>
  );
};

export default Header;
