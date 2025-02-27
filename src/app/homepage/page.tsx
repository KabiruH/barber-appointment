import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Clock, Award, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Barber Shop</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Professional cuts and classic grooming for the modern gentleman
          </p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
            <Link href="/book">Book an Appointment</Link>
          </Button>

          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black ml-4">
            <Link href="/reschedule">Reschedule Appointment</Link>
          </Button>
   
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Our Services</h2>
          <p className="text-gray-600 mt-2">
            Quality grooming services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard 
            title="Classic Haircut"
            price="Kes500"
            description="Precision cut with attention to detail, includes hot towel and styling"
            duration="30 min"
          />
          
          <ServiceCard 
            title="Beard Trim"
            price="Kes400"
            description="Shape and style your beard with precision tools and techniques"
            duration="20 min"
          />
          
          <ServiceCard 
            title="Hot Towel Shave"
            price="Kes500"
            description="Traditional straight razor shave with hot towel treatment"
            duration="30 min"
          />
          
          <ServiceCard 
            title="Haircut & Beard Trim"
            price="Kes500"
            description="Complete package for hair and beard styling"
            duration="45 min"
          />
          
          <ServiceCard 
            title="Hair Styling"
            price="Kes500"
            description="Professional styling with premium products"
            duration="20 min"
          />
          
          <ServiceCard 
            title="Kids Haircut"
            price="Kes300"
            description="Gentle haircuts for young gentlemen under 12"
            duration="30 min"
          />
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
            <Link href="/book">Book Now</Link>
          </Button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Us</h2>
            <p className="text-gray-600 mt-2">
              We pride ourselves on exceptional service and results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Scissors className="h-10 w-10 text-amber-500" />}
              title="Expert Barbers"
              description="Our team of skilled barbers bring years of experience and passion to every cut"
            />
            
            <FeatureCard 
              icon={<Clock className="h-10 w-10 text-amber-500" />}
              title="Efficient Service"
              description="We respect your time - enjoy prompt service without sacrificing quality"
            />
            
            <FeatureCard 
              icon={<Award className="h-10 w-10 text-amber-500" />}
              title="Premium Experience"
              description="Relax in our comfortable environment with complimentary refreshments"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Fresh Look?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the difference
          </p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
            <Link href="/book">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  duration: string;
}

function ServiceCard({ title, price, description, duration }: ServiceCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <span className="text-lg font-bold text-amber-600">{price}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          {duration}
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
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}