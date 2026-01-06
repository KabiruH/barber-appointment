"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'barber';
  name?: string;
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      setIsLoggedIn(data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Re-check auth when window gains focus
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname]); // Re-check on route change

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        setIsMenuOpen(false);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`transition-colors ${
          isActive 
            ? 'text-amber-600 font-medium' 
            : 'text-gray-700 hover:text-amber-600'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors">
            Havan Cutz
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/book">Book Appointment</NavLink>
            
            {isLoggedIn ? (
              <>
                <NavLink href="/appointments">Dashboard</NavLink>
                {user?.role === 'admin' && (
                  <NavLink href="/admin">Admin Panel</NavLink>
                )}
                <div className="flex items-center space-x-3 ml-2 pl-4 border-l">
                  <span className="text-sm text-gray-600">
                    {user?.name || user?.email}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                asChild 
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                <Link href="/login">Staff Login</Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu Button & Book Now */}
          <div className="flex items-center space-x-3 md:hidden">
            {!isLoggedIn && (
              <Button 
                asChild 
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Link href="/book">Book Now</Link>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/book">Book Appointment</NavLink>
              
              {isLoggedIn ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  {user?.role === 'admin' && (
                    <NavLink href="/admin">Admin Panel</NavLink>
                  )}
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Logged in as: {user?.name || user?.email}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  asChild 
                  variant="outline"
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  <Link href="/login">Staff Login</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}