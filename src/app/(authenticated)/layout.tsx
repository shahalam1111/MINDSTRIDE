
"use client";

import { useEffect, useState, type ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, UserCircle, LayoutDashboard, SmilePlus, FileText, Video, Users, Activity, BarChart3, HelpCircle, Briefcase, Shield, Edit, UserCog } from 'lucide-react'; 
import { MindstrideLogoIcon } from '@/components/icons/mindstride-logo-icon'; 
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type UserRole = "user" | "doctor" | "admin";
const USER_ROLE_KEY = "wellspringUserRole";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
  onClick?: () => void;
  disabled?: boolean;
  isPremiumFeature?: boolean;
  roles?: UserRole[]; // Roles that can see this nav item
}

const NavItem = ({ href, icon: Icon, label, currentPath, onClick, disabled, isPremiumFeature, roles }: NavItemProps) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setCurrentRole(role || "user");
  }, []);
  
  if (roles && currentRole && !roles.includes(currentRole)) {
    return null;
  }

  return (
    <Link
      href={disabled ? '#' : href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all",
        disabled ? "cursor-not-allowed opacity-50" : "hover:text-primary hover:bg-muted",
        currentPath === href && !disabled ? "bg-primary text-primary-foreground hover:text-primary-foreground" : ""
      )}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      <Icon className="h-5 w-5" />
      {label}
      {isPremiumFeature && !disabled && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-sm bg-yellow-400 text-yellow-900 font-medium">Premium</span>}
      {isPremiumFeature && disabled && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-sm bg-muted-foreground/20 text-muted-foreground font-medium">Premium</span>}
    </Link>
  );
};


export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("user");

  const fetchUserRole = useCallback(() => {
    const role = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;
    setCurrentUserRole(role || "user"); // Default to 'user' if no role is set
    return role || "user";
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('wellspringUserLoggedIn'); 
    const storedEmail = localStorage.getItem('wellspringUserEmail'); 
    const premiumStatus = localStorage.getItem('wellspringUserIsPremium'); 
    
    if (!loggedInUser) {
      router.replace('/sign-in');
    } else {
      setIsAuthenticated(true);
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
      setIsPremiumUser(premiumStatus === 'true');
      fetchUserRole();
    }
  }, [router, fetchUserRole]);

  const handleLogout = () => {
    localStorage.removeItem('wellspringUserLoggedIn');
    localStorage.removeItem('wellspringUserEmail');
    localStorage.removeItem('wellspringUserIntakeData'); 
    localStorage.removeItem('wellspringUserMoodLog');
    localStorage.removeItem('wellspringUserIsPremium');
    localStorage.removeItem(USER_ROLE_KEY); // Clear role on logout
    localStorage.removeItem('wellspringUserLastAiChatActivity');
    localStorage.removeItem('wellspringUserAiChatHistory');
    
    const communityPostsKey = 'mindstrideUserForumPosts'; 
    localStorage.removeItem(communityPostsKey);
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('mindstrideUserForumComments_')) {
            localStorage.removeItem(key);
        }
    });
    
    setIsAuthenticated(false); 
    router.replace('/');
  };
  
  const closeSheet = () => setIsSheetOpen(false);

  const handleRoleChange = (role: UserRole) => {
    localStorage.setItem(USER_ROLE_KEY, role);
    setCurrentUserRole(role);
    toast({ title: "Role Switched", description: `You are now acting as ${role}. Refresh or navigate to see changes.` });
    // Attempt to navigate to the primary dashboard for the new role
    if (role === "doctor") router.push("/dashboard/doctor");
    else if (role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard");
    window.location.reload(); // Force reload to update layout and nav based on new role
  };


  const allNavItems = [
    // User specific
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["user", "admin", "doctor"] }, // All roles can see a main dashboard
    { href: "/dashboard/intake", icon: FileText, label: "Intake Form", roles: ["user"] },
    { href: "/dashboard/mood-checkin", icon: SmilePlus, label: "Mood Check-in", roles: ["user"] },
    { href: "/dashboard/progress", icon: BarChart3, label: "My Progress", roles: ["user"]},
    { href: "/dashboard/activity", icon: Activity, label: "Activity Log", roles: ["user", "admin"]},
    { href: "/dashboard/community", icon: Users, label: "Community Forum", roles: ["user", "doctor"] },
    { href: "/dashboard/consultations", icon: Video, label: "Consultations", isPremiumFeature: true, roles: ["user"] },
    
    // Doctor specific
    { href: "/dashboard/doctor", icon: Briefcase, label: "Doctor Dashboard", roles: ["doctor"] },
    // Sub-items for doctor could be handled within the doctor dashboard page or added here too.
    // e.g. { href: "/dashboard/doctor/schedule", icon: Edit, label: "Manage Schedule", roles: ["doctor"] },

    // Admin specific
    { href: "/dashboard/admin", icon: UserCog, label: "Admin Panel", roles: ["admin"] },
    // Sub-items for admin
    // e.g. { href: "/dashboard/admin/users", icon: Users, label: "User Management", roles: ["admin"] },
  ];

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.roles) return true; // If no roles specified, visible to all (shouldn't happen with new setup)
    return item.roles.includes(currentUserRole);
  });


  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
          <MindstrideLogoIcon className="h-16 w-16 text-primary animate-pulse mb-4" /> 
          <p className="text-xl text-foreground">Loading your MINDSTRIDE experience...</p>
        </div>
      </div>
    );
  }

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'M';

  const sidebarContent = (
    <nav className="grid gap-2 text-lg font-medium">
      <Link href={
          currentUserRole === 'doctor' ? '/dashboard/doctor' :
          currentUserRole === 'admin' ? '/dashboard/admin' :
          '/dashboard'
        } 
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-primary transition-all hover:text-primary/80 mb-4" onClick={closeSheet}>
        <MindstrideLogoIcon className="h-7 w-7" /> 
        <span className="text-xl font-headline font-semibold">MINDSTRIDE</span>
        <Badge variant="outline" className="ml-auto">{currentUserRole}</Badge>
      </Link>
      {visibleNavItems.map(item => (
        <NavItem 
            key={item.href} 
            {...item} 
            currentPath={pathname} 
            onClick={closeSheet} 
            disabled={(item.isPremiumFeature && !isPremiumUser) || (item.roles && !item.roles.includes(currentUserRole))}
        />
      ))}
    </nav>
  );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={
                currentUserRole === 'doctor' ? '/dashboard/doctor' :
                currentUserRole === 'admin' ? '/dashboard/admin' :
                '/dashboard'
              } className="flex items-center gap-2 font-semibold text-primary">
              <MindstrideLogoIcon className="h-6 w-6" /> 
              <span className="font-headline">MINDSTRIDE</span>
               <Badge variant="secondary" className="ml-2 capitalize">{currentUserRole}</Badge>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
             {sidebarContent}
          </div>
          <div className="mt-auto p-4 border-t">
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar p-0">
              <div className="flex-1 overflow-auto py-2 px-2">
                {sidebarContent}
              </div>
               <div className="mt-auto p-4 border-t">
                <Button variant="ghost" onClick={() => { handleLogout(); closeSheet();}} className="w-full justify-start">
                    <LogOut className="mr-2 h-5 w-5" /> Logout
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Optional: Add search or other header elements here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={userEmail || "User"} data-ai-hint="person initial"/>
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userEmail || "My Account"} ({currentUserRole})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(
                currentUserRole === 'doctor' ? '/dashboard/doctor' :
                currentUserRole === 'admin' ? '/dashboard/admin' :
                '/dashboard'
                )}>My Dashboard</DropdownMenuItem>
              
              {currentUserRole === "user" && (
                <>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/intake')}>Intake Form</DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => {
                            if (isPremiumUser) router.push('/dashboard/consultations');
                            else toast({ title: "Premium Feature", description: "Upgrade to access consultations."});
                        }}
                        // disabled={!isPremiumUser} // Handled by conditional display logic in navItem or logic above
                    >
                        Consultations {isPremiumUser && <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">Premium</Badge>}
                    </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Switch Role (Dev)</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={currentUserRole} onValueChange={(value) => handleRoleChange(value as UserRole)}>
                      <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="doctor">Doctor</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

               <DropdownMenuItem onClick={() => router.push('/faq')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQ
              </DropdownMenuItem>
               <DropdownMenuItem onClick={() => router.push('/contact')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

    