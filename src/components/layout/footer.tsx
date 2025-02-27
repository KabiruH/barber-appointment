export default function Footer() {
    return (
      <footer className="bg-zinc-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Premium Barber Shop</h3>
              <p className="text-gray-400 mb-4">
                Professional cuts and classic grooming for the modern gentleman.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <ul className="text-gray-400 space-y-2">
                <li>Monday - Friday: 9am - 8pm</li>
                <li>Saturday: 9am - 8pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="text-gray-400 space-y-2">
                <li>Ngong Road</li>
                <li>Nairobi</li>
                <li>Phone: 0700 000 000</li>
                <li>Email: info@premiumbarber.com</li>
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