import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/leads', icon: UserPlus, label: 'Leads' },
  { to: '/dashboard/lead-calendar', icon: CalendarDays, label: 'Schedule' },
  { to: '/dashboard/members', icon: Users, label: 'Members' },
  { to: '/dashboard/staff', icon: UsersRound, label: 'Staff' },
  { to: '/dashboard/membership-plans', icon: Dumbbell, label: 'Manage Plans' },
  { 
    to: '/dashboard/reports', 
    icon: BarChart3, 
    label: 'Reports',
    subItems: [
      { to: '/dashboard/reports?tab=revenue', label: 'Revenue Report' },
      { to: '/dashboard/reports?tab=members', label: 'Member Statistics' },
      { to: '/dashboard/reports?tab=leads', label: 'Lead Conversion' },
      { to: '/dashboard/reports?tab=attendance', label: 'Attendance Report' },
    ]
  },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const { user, staff, signOut, isAdmin } = useAuth();
  const location = useLocation();
  
  // Enable real-time notifications
  useRealtimeNotifications();
  const navigate = useNavigate();

  // Auto-expand reports if on reports page
  useEffect(() => {
    if (location.pathname.includes('/dashboard/reports')) {
      setReportsOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = staff?.name
    ? staff.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary flex-shrink-0">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-semibold text-sidebar-foreground">SmartGym</h1>
              <p className="text-xs text-sidebar-foreground/60">ERP System</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              item.subItems ? (
                <Collapsible
                  key={item.to}
                  open={reportsOpen}
                  onOpenChange={setReportsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        location.pathname.includes('/dashboard/reports')
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              reportsOpen && 'rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  {!sidebarCollapsed && (
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="ml-7 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                        {item.subItems.map((sub) => {
                          const subTabParam = sub.to.split('?tab=')[1];
                          const currentTabParam = location.search.replace('?tab=', '');
                          const isSubActive = location.pathname.includes('/dashboard/reports') && subTabParam === currentTabParam;
                          
                          return (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                'block rounded-md px-3 py-1.5 text-xs transition-colors',
                                isSubActive
                                  ? 'text-sidebar-foreground bg-sidebar-accent/50'
                                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                              )}
                            >
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              )
            ))}
          </nav>
        </ScrollArea>

        <Separator className="bg-sidebar-border" />

        {/* User section */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 py-6 text-sidebar-foreground hover:bg-sidebar-accent',
                  sidebarCollapsed ? 'px-2' : 'px-3'
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <>
                    <div className="flex flex-1 flex-col items-start text-left overflow-hidden">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {staff?.name || user?.email}
                      </span>
                      <span className="text-xs text-sidebar-foreground/60 capitalize">
                        {isAdmin ? 'Admin' : 'Staff'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-9 w-9"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}