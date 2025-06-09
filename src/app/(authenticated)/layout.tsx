
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, LogOut, Settings, UserCircle, LayoutDashboard, SmilePlus, FileText, Video, ListChecks, Activity } from 'lucide-react'; // Added Video, ListChecks icons
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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
  onClick?: () => void;
  disabled?: boolean;
  isPremiumFeature?: boolean;
}

const NavItem = ({ href, icon: Icon, label, currentPath, onClick, disabled, isPremiumFeature }: NavItemProps) => (
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


export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

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
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('wellspringUserLoggedIn');
    localStorage.removeItem('wellspringUserEmail');
    localStorage.removeItem('wellspringUserIntakeData'); 
    localStorage.removeItem('wellspringUserMoodLog');
    localStorage.removeItem('wellspringUserIsPremium');
    localStorage.removeItem('wellspringUserLastAiChatActivity');
    localStorage.removeItem('wellspringUserAiChatHistory');
    setIsAuthenticated(false); 
    router.replace('/');
  };
  
  const closeSheet = () => setIsSheetOpen(false);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/intake", icon: FileText, label: "Intake Form" },
    { href: "/dashboard/mood-checkin", icon: SmilePlus, label: "Mood Check-in" },
    { href: "/dashboard/activity", icon: Activity, label: "Activity Log"},
    { href: "/dashboard/consultations", icon: Video, label: "Consultations", isPremiumFeature: true, disabled: !isPremiumUser },
    // { href: "/dashboard/profile", icon: UserCircle, label: "Profile" },
    // { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];


  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center">
          <Brain className="h-16 w-16 text-primary animate-pulse mb-4" />
          <p className="text-xl text-foreground">Loading your Wellspring experience...</p>
        </div>
      </div>
    );
  }

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'W';

  const sidebarContent = (
    <nav className="grid gap-2 text-lg font-medium">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-3 text-primary transition-all hover:text-primary/80 mb-4" onClick={closeSheet}>
        <Brain className="h-7 w-7" />
        <span className="text-xl font-headline font-semibold">Wellspring</span>
      </Link>
      {navItems.map(item => (
        <NavItem 
            key={item.href} 
            {...item} 
            currentPath={pathname} 
            onClick={closeSheet} 
            disabled={item.isPremiumFeature && !isPremiumUser}
        />
      ))}
    </nav>
  );


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <Brain className="h-6 w-6" />
              <span className="font-headline">Wellspring</span>
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
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={userEmail || "User"} data-ai-hint="person initial" />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userEmail || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/intake')}>Intake Form</DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                    if (isPremiumUser) router.push('/dashboard/consultations');
                    else alert("Upgrade to premium to access consultations.");
                }}
                disabled={!isPremiumUser}
               >
                Consultations {isPremiumUser && <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600">Premium</Badge>}
              </DropdownMenuItem>
              {/* 
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Settings</DropdownMenuItem>
              */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
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
