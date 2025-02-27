import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RescheduleForm from "@/components/booking/reschedule-form";

export const metadata: Metadata = {
  title: "Reschedule Appointment | Premium Barber Shop",
  description: "Reschedule your existing barber shop appointment",
};

export default function ReschedulePage() {
  return (
    <div className="container max-w-4xl py-10 px-4">
      <Link href="/" className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Reschedule Appointment</h1>
        <p className="text-muted-foreground">
          Enter your appointment reference number to reschedule your existing appointment.
        </p>
      </div>
      
      <RescheduleForm />
    </div>
  );
}