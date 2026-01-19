import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Clock, Award, Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative bg-zinc-900 text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/1try.jpg"
            alt="Barber shop"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 to-zinc-900/60" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Havan Cutz
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto drop-shadow">
            Professional cuts and classic grooming for the modern gentleman
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg">
              <Link href="/book">Book an Appointment</Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Link href="/reschedule">
                <Search className="mr-2 h-5 w-5" />
                Reschedule Appointment
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Link href="/lookup">
                <Search className="mr-2 h-5 w-5" />
                Check Reservation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section with Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/2.jpg"
            alt="Services background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Our Popular Services</h2>
            <p className="text-gray-600 text-lg">
              Quality grooming services tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard 
              title="Haircut"
              price="Kes 1,000"
              description="Precision cut with attention to detail, includes styling"
              // duration="45 min"
            />
            
            <ServiceCard 
              title="Manicure"
              price="Kes 1,300"
              description="Professional hand care and nail grooming"
              // duration="45 min"
            />
            
            <ServiceCard 
              title="Pedicure"
              price="Kes 1,500"
              description="Complete foot care and nail grooming"
              // duration="60 min"
            />
            
            <ServiceCard 
              title="Facial"
              price="Kes 4  ,500"
              description="Deep cleansing and rejuvenating facial treatment"
              // duration="60 min"
            />
            
            <ServiceCard 
              title="Acrylics"
              price="Kes 5,000"
              description="Full acrylic nail set"
              // duration="120 min"
            />
            
            <ServiceCard 
              title="Kids Haircut"
              price="Kes 1,000"
              description="Gentle haircuts for young gentlemen under 12"
              // duration="30 min"
            />
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg">
              <Link href="/book">View All Services & Book Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section with Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/3.jpg"
            alt="Why choose us background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/60" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-white drop-shadow-lg">Why Choose Us</h2>
            <p className="text-gray-200 text-lg drop-shadow">
              We pride ourselves on exceptional service and results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Scissors className="h-12 w-12 text-amber-400" />}
              title="Expert Stylists"
              description="Our team of skilled professionals bring years of experience and passion to every service"
            />
            
            <FeatureCard 
              icon={<Clock className="h-12 w-12 text-amber-400" />}
              title="Efficient Service"
              description="We respect your time - enjoy prompt service without sacrificing quality"
            />
            
            <FeatureCard 
              icon={<Award className="h-12 w-12 text-amber-400" />}
              title="Premium Experience"
              description="Relax in our comfortable environment with complimentary refreshments"
            />
          </div>
        </div>
      </section>

      {/* Social Media Gallery Teaser Section */}
<section className="relative py-16 overflow-hidden">
  {/* Background Image */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/1try.jpg"
      alt="Social media background"
      fill
      className="object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/80" />
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="text-center mb-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-lg">
        See Our Latest Work
      </h2>
      <p className="text-gray-200 text-lg max-w-2xl mx-auto drop-shadow">
        Follow us on social media for daily inspiration, style tips, and exclusive content
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <a
        href="https://www.instagram.com/havancutz/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900">Instagram</div>
          <div className="text-sm text-gray-600">@havancutz</div>
        </div>
      </a>

      <a
        href="https://www.tiktok.com/@havan9297"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <div className="bg-black p-3 rounded-lg group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900">TikTok</div>
          <div className="text-sm text-gray-600">@havan9297</div>
        </div>
      </a>

      <a
        href="https://web.facebook.com/people/HAVAN-the-Barber/100070187910616/"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
      >
        <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900">Facebook</div>
          <div className="text-sm text-gray-600">HAVAN the Barber</div>
        </div>
      </a>
    </div>

    <div className="text-center">
      <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg">
        <Link href="/gallery">
          View Full Gallery
        </Link>
      </Button>
    </div>
  </div>
</section>

      {/* CTA Section with Background */}
      <section className="relative bg-zinc-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/4.jpg"
            alt="Book appointment"
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-zinc-900/30 to-zinc-900/20" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Ready for a Fresh Look?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto drop-shadow">
            Book your appointment today and experience the difference
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg">
              <Link href="/book">Book an Appointment</Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Link href="/lookup">
                <Search className="mr-2 h-5 w-5" />
                Check Your Reservation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  // duration: string;
}

function ServiceCard({ title, price, description }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className="text-lg font-bold text-amber-600">{price}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
         
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/15 transition-all shadow-xl">
      <div className="mb-4 p-4 bg-amber-500/20 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white drop-shadow">{title}</h3>
      <p className="text-gray-200 drop-shadow">{description}</p>
    </div>
  );
}