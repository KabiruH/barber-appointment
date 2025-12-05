import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookingForm from "@/components/booking/booking-form";

export const metadata: Metadata = {
  title: "Book an Appointment | Havan Premium Barber Shop",
  description: "Book your next barber shop appointment with our skilled professionals",
};

export default function BookingPage() {
  return (
    <div className="container max-w-4xl py-10 px-4">
      <Link href="/" className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Select your preferred service and time slot to book your appointment.
        </p>
      </div>
      
      <BookingForm />
    </div>
  );
}