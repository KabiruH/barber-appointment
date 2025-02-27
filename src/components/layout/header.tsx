"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if user is logged in (has auth cookie)
  useEffect(() => {
    const checkAuth = () => {
      // In a real app, you'd use a more robust method to check authentication
      // This simply checks if the auth-token cookie exists
      const hasAuthCookie = document.cookie.split(';').some(item => item.trim().startsWith('auth-token='));
      setIsLoggedIn(hasAuthCookie);
    };

    checkAuth();
    
    // Add event listener for changes
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

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
        router.push('/');
        router.refresh(); // Refresh to update auth state
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">Premium Barber</Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-amber-600">Home</Link>
            <Button asChild variant="ghost" className="text-gray-700 hover:text-amber-600">
              <Link href="/book">Book Appointment</Link>
            </Button>
            
            {isLoggedIn ? (
              <>
                <Button asChild variant="ghost" className="text-gray-700 hover:text-amber-600">
                  <Link href="/appointments">Dashboard</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-amber-600 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login" className="text-gray-400 text-sm hover:text-gray-700">Admin</Link>
            )}
             <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-amber-600 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
          </nav>
          
          {/* Mobile view */}
          <div className="flex items-center space-x-4 md:hidden">
            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/book">Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}