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