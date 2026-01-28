import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Anvil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

// API Imports
import apiClient, { setAccessToken } from '../../lib/api.js';
import { ENDPOINTS } from '../../lib/endpoints.js';

// Navigation Items
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Job Board', path: '/jobs' },
];

// Define a flexible User interface to handle different backend responses
interface UserData {
  name?: string;
  fullName?: string;
  username?: string;
  email: string;
  avatar?: string;
}

interface SidebarContentProps {
  collapsed: boolean;
  onToggle?: () => void;
  user: UserData | null;
  onLogout: () => void;
}

function SidebarContent({ collapsed, onToggle, user, onLogout }: SidebarContentProps) {
  const location = useLocation();

  // Determine the display name (Checks 'fullName' first, then 'name', then 'username')
  const displayName = user?.fullName || user?.name || user?.username || 'User';
  const displayEmail = user?.email || '';

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Anvil className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-foreground tracking-tight">CareerAnvil</span>
          )}
        </div>
        {onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && <span>{item.label}</span>}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-1">
        <button className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground group"
        )}>
          <Settings className="w-5 h-5 flex-shrink-0 group-hover:text-foreground" />
          {!collapsed && <span>Settings</span>}
        </button>
        
        <button 
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors",
            "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-accent/30 border border-border/50",
          collapsed && "justify-center p-2"
        )}>
          <Avatar className="w-9 h-9 border border-border">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  // Fetch User from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Sidebar User Data:", parsedUser); // Debugging log
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await apiClient.post(ENDPOINTS.USERS.LOGOUT);
      
      // Clear client state
      setAccessToken('');
      localStorage.removeItem('user');
      
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
      // Force logout even if API fails
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="lg:hidden fixed top-4 left-4 z-50 shadow-md bg-background/80 backdrop-blur-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent 
            collapsed={false} 
            user={user} 
            onLogout={handleLogout} 
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-border bg-card shadow-sm z-40",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
          user={user}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}