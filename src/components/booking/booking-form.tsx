"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { bookingFormSchema } from "./booking-schema";
import { ServiceSelector } from "./service-selector";
import { BarberSelector } from "./barber-selector";
import { DateSelector } from "./date-selector";
import { TimeSelector } from "./time-selector";
import { CustomerDetailsFields } from "./customer-details-fields";
import { BookingSummary } from "./booking-summary";
import { PaymentInstructions } from "./payment-instructions";
import { SERVICES, getServiceById, Service, getBookingAmount } from "@/lib/services";
import { Barber, TimeSlot } from "@/types/booking";

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm() {
  // State for data from APIs
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // State for loading indicators
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // State for form submission
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Form initialization
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });
  
  // Watch form values to trigger dynamic updates
  const selectedServiceId = form.watch("serviceId");
  const selectedBarberId = form.watch("barberId");
  const selectedDate = form.watch("date");
  
  // Fetch barbers on component mount (all barbers can do all services)
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoadingBarbers(true);
        const response = await fetch('/api/barbers');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setBarbers(result.data);
        } else {
          console.error("Failed to fetch barbers:", result.message);
          setError("Failed to load barbers. Please refresh the page.");
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        setError("Failed to load barbers. Please check your connection and try again.");
      } finally {
        setLoadingBarbers(false);
      }
    };
    
    fetchBarbers();
  }, []);
  
  // Update selected service when service ID changes
  useEffect(() => {
    if (selectedServiceId) {
      const service = getServiceById(selectedServiceId);
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [selectedServiceId]);
  
  // Fetch available time slots when service, barber, and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedServiceId || !selectedBarberId || !selectedDate) {
        setTimeSlots([]);
        return;
      }
      
      const service = getServiceById(selectedServiceId);
      if (!service) {
        setTimeSlots([]);
        return;
      }
      
      try {
        setLoadingTimeSlots(true);
        const response = await fetch(
          `/api/available-slots?date=${selectedDate.toISOString()}&barberId=${selectedBarberId}&duration=${service.duration}`
        );
        const result = await response.json();
        
        if (response.ok && result.success) {
          setTimeSlots(result.data.availableSlots || []);
        } else {
          console.error("Failed to fetch time slots:", result.message);
          setTimeSlots([]);
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    
    fetchTimeSlots();
  }, [selectedServiceId, selectedBarberId, selectedDate]);
  
  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    const service = getServiceById(data.serviceId);
    if (!service) {
      setError("Invalid service selected");
      setIsSubmitting(false);
      return;
    }
    
  const bookingAmount = getBookingAmount(service);

    try {
      // Make API call to create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: service.name,
          servicePrice: bookingAmount, // Fixed price
          serviceDuration: service.duration,
          barberId: data.barberId,
          date: data.date.toISOString(),
          time: data.time,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          notes: data.notes || '',
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Appointment created successfully - show payment instructions
        setBookingComplete(true);
        setShowPayment(true);
        setReferenceNumber(result.data.referenceNumber);
      } else {
        // Handle error from API
        setError(result.message || 'Failed to create appointment. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show payment instructions after booking
  if (bookingComplete && showPayment) {
      const bookingAmount = selectedService ? getBookingAmount(selectedService) : 0;
    
      return (
      <PaymentInstructions
        referenceNumber={referenceNumber}
        amount={bookingAmount}
        customerName={form.getValues().name}
        serviceName={selectedService?.name || ''}
        isHaircut={selectedService?.isHaircut || false}
        onBackToHome={() => {
          setBookingComplete(false);
          setShowPayment(false);
          form.reset();
          setSelectedService(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ServiceSelector 
                form={form} 
                services={SERVICES}
              />

              <BarberSelector 
                form={form} 
                isLoading={loadingBarbers}
                barbers={barbers}
                disabled={!selectedServiceId}
              />

              <DateSelector 
                form={form}
                disabled={!selectedBarberId}
              />

              <TimeSelector 
                form={form} 
                isLoading={loadingTimeSlots}
                timeSlots={timeSlots}
                isDisabled={!selectedDate || !selectedBarberId || !selectedServiceId}
              />
            </div>

            <CustomerDetailsFields form={form} />
          </div>

          {selectedService && (
            <BookingSummary service={selectedService} />
          )}

          <Button 
            type="submit" 
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-black" 
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              "Book Appointment"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}