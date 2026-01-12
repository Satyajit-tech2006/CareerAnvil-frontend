import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  LayoutDashboard, 
  FileSearch, 
  FileText, 
  Map, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Job Board', path: '/jobs' },
  { icon: FileSearch, label: 'Resume Scanner', path: '/scanner' },
  { icon: FileText, label: 'Resume Builder', path: '/builder' },
  { icon: Map, label: 'Roadmaps', path: '/roadmaps' },
];

interface SidebarContentProps {
  collapsed: boolean;
  onToggle?: () => void;
}

function SidebarContent({ collapsed, onToggle }: SidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <Briefcase className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-foreground">CareerForge</span>
          )}
        </div>
        {onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex"
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border space-y-1">
        <button className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        
        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-accent/50",
          collapsed && "justify-center"
        )}>
          <Avatar className="w-9 h-9">
            <AvatarImage src="https://i.pravatar.cc/150?img=33" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Arjun Sharma</p>
              <p className="text-xs text-muted-foreground truncate">IIT Delhi, 2025</p>
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

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden fixed top-4 left-4 z-50 bg-card shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>
    </>
  );
}
