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
import { BookingConfirmation } from "./booking-confirmation";

import { Service, Barber, TimeSlot } from "@/types/booking";

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm() {
  // State for data from APIs
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // State for loading indicators
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // State for form submission
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
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
  
  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await fetch('/api/services?activeOnly=true');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setServices(result.data);
        } else {
          console.error("Failed to fetch services:", result.message);
          // Fallback to hardcoded services if API fails
          setServices([
            { id: "haircut", name: "Classic Haircut", price: 500, duration: 60 },
            { id: "beard", name: "Beard Trim", price: 400, duration: 60 },
            { id: "shave", name: "Hot Towel Shave", price: 500, duration: 60 },
            { id: "combo", name: "Haircut & Beard Trim", price: 500, duration: 60 },
            { id: "styling", name: "Hair Styling", price: 500, duration: 60 },
            { id: "kids", name: "Kids Haircut", price: 300, duration: 30 },
          ]);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        // Fallback to hardcoded services
        setServices([
          { id: "haircut", name: "Classic Haircut", price: 500, duration: 60 },
          { id: "beard", name: "Beard Trim", price: 400, duration: 60 },
          { id: "shave", name: "Hot Towel Shave", price: 500, duration: 60 },
          { id: "combo", name: "Haircut & Beard Trim", price: 500, duration: 60 },
          { id: "styling", name: "Hair Styling", price: 500, duration: 60 },
          { id: "kids", name: "Kids Haircut", price: 300, duration: 30 },
        ]);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServices();
  }, []);
  
  // Fetch barbers on component mount
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
          // Fallback to hardcoded barbers if API fails
          setBarbers([
            { id: "james", name: "James Wilson" },
            { id: "sarah", name: "Sarah Johnson" },
            { id: "miguel", name: "Miguel Rodriguez" },
          ]);
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
        // Fallback to hardcoded barbers
        setBarbers([
          { id: "james", name: "James Wilson" },
          { id: "sarah", name: "Sarah Johnson" },
          { id: "miguel", name: "Miguel Rodriguez" },
        ]);
      } finally {
        setLoadingBarbers(false);
      }
    };
    
    fetchBarbers();
  }, []);
  
  // Fetch available time slots when service, barber, and date are selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedServiceId || !selectedBarberId || !selectedDate) {
        return;
      }
      
      try {
        setLoadingTimeSlots(true);
        const response = await fetch(
          `/api/available-slots?date=${selectedDate.toISOString()}&barberId=${selectedBarberId}&serviceId=${selectedServiceId}`
        );
        const result = await response.json();
        
        if (response.ok && result.success) {
          setTimeSlots(result.data.availableSlots);
        } else {
          console.error("Failed to fetch time slots:", result.message);
          // Fallback to hardcoded time slots if API fails
          setTimeSlots([
            { time: "9:00 AM", value: "9:00 AM", disabled: false },
            { time: "10:00 AM", value: "10:00 AM", disabled: false },
            { time: "11:00 AM", value: "11:00 AM", disabled: false },
            { time: "12:00 PM", value: "12:00 PM", disabled: false },
            { time: "1:00 PM", value: "1:00 PM", disabled: false },
            { time: "2:00 PM", value: "2:00 PM", disabled: false },
            { time: "3:00 PM", value: "3:00 PM", disabled: false },
            { time: "4:00 PM", value: "4:00 PM", disabled: false },
            { time: "5:00 PM", value: "5:00 PM", disabled: false },
            { time: "6:00 PM", value: "6:00 PM", disabled: false },
            { time: "7:00 PM", value: "7:00 PM", disabled: false },
            { time: "8:00 PM", value: "8:00 PM", disabled: false },
          ]);
        }
      } catch (err) {
        console.error("Error fetching time slots:", err);
        // Fallback to hardcoded time slots
        setTimeSlots([
          { time: "9:00 AM", value: "9:00 AM", disabled: false },
          { time: "10:00 AM", value: "10:00 AM", disabled: false },
          { time: "11:00 AM", value: "11:00 AM", disabled: false },
          { time: "12:00 PM", value: "12:00 PM", disabled: false },
          { time: "1:00 PM", value: "1:00 PM", disabled: false },
          { time: "2:00 PM", value: "2:00 PM", disabled: false },
          { time: "3:00 PM", value: "3:00 PM", disabled: false },
          { time: "4:00 PM", value: "4:00 PM", disabled: false },
          { time: "5:00 PM", value: "5:00 PM", disabled: false },
          { time: "6:00 PM", value: "6:00 PM", disabled: false },
          { time: "7:00 PM", value: "7:00 PM", disabled: false },
          { time: "8:00 PM", value: "8:00 PM", disabled: false },
        ]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    
    fetchTimeSlots();
  }, [selectedServiceId, selectedBarberId, selectedDate]);
  
  // Update selected service when service ID changes
  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find(s => s.id === selectedServiceId);
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [selectedServiceId, services]);
  
  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Make API call to create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: data.serviceId,
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
        // Appointment created successfully
        setBookingComplete(true);
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

  if (bookingComplete) {
    return (
      <BookingConfirmation
        referenceNumber={referenceNumber}
        selectedService={selectedService}
        selectedBarber={barbers.find(b => b.id === form.getValues().barberId)}
        formValues={form.getValues()}
        onBookAnother={() => {
          setBookingComplete(false);
          form.reset();
          setSelectedService(null);
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
                isLoading={loadingServices}
                services={services} 
              />

              <BarberSelector 
                form={form} 
                isLoading={loadingBarbers}
                barbers={barbers} 
              />

              <DateSelector form={form} />

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
            disabled={isSubmitting}
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