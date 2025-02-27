import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
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
              <Link href="/login" className="text-gray-400 text-sm hover:text-gray-700">Admin</Link>
            </nav>
            <Button asChild className="md:hidden bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/book">Book Now</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }
  