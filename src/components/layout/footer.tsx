import { Instagram, Facebook } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Havan Cutz</h3>
            <p className="text-gray-400 mb-4">
              Professional cuts and classic grooming for the modern gentleman.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4 mt-4">
              <a
                href="https://www.instagram.com/havancutz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.tiktok.com/@havan9297"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                aria-label="TikTok"
              >
                <SiTiktok className="h-6 w-6" />
              </a>
              <a
                href="https://web.facebook.com/people/HAVAN-the-Barber/100070187910616/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hours</h4>
            <ul className="text-gray-400 space-y-2">
              <li>Monday - Friday: 8am - 9pm</li>
              <li>Saturday: 8am - 9pm</li>
              <li>Sunday: 10am - 8pm</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="text-gray-400 space-y-2">
              <li>Apple Wood, 1st Floor, room 103</li>
              <li>Adams Arcade, Ngong Road</li>
              <li>Nairobi</li>
              <li>Phone: 0711 495 826</li>
              <li>Phone: 0716 107 113</li>
              <li>Email: info@havancutz.co.ke</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Ubiru Industries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}