"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2,
  Search, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User 
} from "lucide-react";

import { ServiceSelector } from "./service-selector";
import { BarberSelector } from "./barber-selector";
import { DateSelector } from "./date-selector";
import { TimeSelector } from "./time-selector";
import { BookingSummary } from "./booking-summary";

import { SERVICES, getServiceById, Service } from "@/lib/services";
import { Barber, TimeSlot } from "@/types/booking";
import { bookingFormSchema, BookingFormValues } from "./booking-schema";

// Schema for reference number lookup form
const referenceSchema = z.object({
  referenceNumber: z.string()
    .min(3, { message: "Reference number is required" })
    .regex(/^BRB\d+$/, { message: "Invalid reference number format (e.g. BRB12345)" }),
});

type ReferenceFormValues = z.infer<typeof referenceSchema>;

type AppointmentDetails = {
  id: string;
  referenceNumber: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  status: string;
};

export default function RescheduleForm() {
  // State for search form
  const [isSearching, setIsSearching] = useState(false);
  const [appointmentFound, setAppointmentFound] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // States for booking form
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateComplete, setUpdateComplete] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Reference lookup form
  const referenceForm = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      referenceNumber: "",
    },
  });

  // Booking form for rescheduling
  const bookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });
  
  // Watch form values to trigger dynamic updates
  const selectedServiceId = bookingForm.watch("serviceId");
  const selectedBarberId = bookingForm.watch("barberId");
  const selectedDate = bookingForm.watch("date");
  
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
        }
      } catch (err) {
        console.error("Error fetching barbers:", err);
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
  
  // Look up appointment by reference number
  async function onLookupSubmit(data: ReferenceFormValues) {
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // API call to fetch appointment details
      const response = await fetch(`/api/appointments/lookup?reference=${data.referenceNumber}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setAppointmentFound(true);
        setAppointmentDetails(result.data);
        
        // Pre-fill the booking form with the appointment details
        const appointmentDate = new Date(result.data.startTime);
        
        // Convert appointment time to format like "9:00 AM"
        const appointmentTime = format(appointmentDate, "h:mm a");
        
        // Find the matching service from hardcoded services by name
        const matchingService = SERVICES.find(s => s.name === result.data.serviceName);
        
        bookingForm.reset({
          serviceId: matchingService?.id || SERVICES[0].id, // Default to first service if not found
          barberId: result.data.barberId,
          date: appointmentDate,
          time: appointmentTime,
          name: result.data.customerName,
          email: result.data.customerEmail,
          phone: result.data.customerPhone || "",
          notes: result.data.notes || "",
        });
      } else {
        setAppointmentFound(false);
        setSearchError(result.message || "Appointment not found. Please check your reference number.");
      }
    } catch (err) {
      console.error("Error looking up appointment:", err);
      setAppointmentFound(false);
      setSearchError("An error occurred while looking up the appointment. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }
  
  // Submit reschedule request
  async function onRescheduleSubmit(data: BookingFormValues) {
    if (!appointmentDetails) return;
    
    setIsSubmitting(true);
    setUpdateError(null);
    
    const service = getServiceById(data.serviceId);
    if (!service) {
      setUpdateError("Invalid service selected");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // API call to update appointment
      const response = await fetch(`/api/appointments/${appointmentDetails.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: service.name,
          servicePrice: service.price,
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
        // Update completed successfully
        setUpdateComplete(true);
        
        // Parse time for the new appointment
        const timeParts = data.time.match(/(\d+):(\d+) ([AP]M)/);
        let hours = parseInt(timeParts![1]);
        const minutes = parseInt(timeParts![2]);
        const ampm = timeParts![3];
        
        if (ampm === "PM" && hours !== 12) hours += 12;
        else if (ampm === "AM" && hours === 12) hours = 0;
        
        const newStartTime = new Date(data.date);
        newStartTime.setHours(hours, minutes, 0, 0);
        
        const newEndTime = new Date(newStartTime.getTime() + service.duration * 60000);
        
        // Update local appointment details
        setAppointmentDetails({
          ...appointmentDetails,
          serviceName: service.name,
          serviceDuration: service.duration,
          servicePrice: service.price.toString(),
          barberId: data.barberId,
          barberName: barbers.find(b => b.id === data.barberId)?.name || appointmentDetails.barberName,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          notes: data.notes,
        });
      } else {
        // Update failed
        setUpdateError(result.message || 'Failed to reschedule appointment. Please try again.');
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      setUpdateError('An error occurred while rescheduling. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Reset the form to look up another appointment
  function handleReset() {
    setAppointmentFound(false);
    setAppointmentDetails(null);
    setUpdateComplete(false);
    setSearchError(null);
    setUpdateError(null);
    referenceForm.reset();
    bookingForm.reset();
  }

  // Show the reference number lookup form if no appointment is found yet
  if (!appointmentFound) {
    return (
      <Card className="p-6">
        <Form {...referenceForm}>
          <form onSubmit={referenceForm.handleSubmit(onLookupSubmit)} className="space-y-6">
            {searchError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={referenceForm.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Reference Number</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder="e.g. BRB12345" 
                        {...field} 
                        className="flex-1"
                      />
                    </FormControl>
                    <Button 
                      type="submit" 
                      disabled={isSearching}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-2">Look Up</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="text-sm text-muted-foreground">
              <p>Enter the reference number from your booking confirmation email or text.</p>
              <p>All reference numbers start with "BRB" followed by 5 digits.</p>
            </div>
          </form>
        </Form>
      </Card>
    );
  }

  // If appointment is found and update is complete, show confirmation
  if (updateComplete && appointmentDetails) {
    return (
      <div className="space-y-6 bg-white p-6 rounded-lg border">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Appointment Rescheduled!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your appointment has been successfully rescheduled. A confirmation email has been sent to your email address.
          </AlertDescription>
        </Alert>
        
        <Card className="p-6 border-green-100">
          <h3 className="font-bold text-lg mb-4">Updated Appointment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Reference Number:</span>
              <span className="font-bold text-amber-600">{appointmentDetails.referenceNumber}</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Service:</span>
              <span>{appointmentDetails.serviceName}</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Price:</span>
              <span className="font-semibold text-amber-600">Kes {appointmentDetails.servicePrice}</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Barber:</span>
              <span>{appointmentDetails.barberName}</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Date & Time:</span>
              <span className="text-right">
                {format(new Date(appointmentDetails.startTime), "EEEE, MMMM d, yyyy")}
                <br />
                {format(new Date(appointmentDetails.startTime), "h:mm a")}
              </span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Duration:</span>
              <span>{appointmentDetails.serviceDuration} minutes</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Customer:</span>
              <span>{appointmentDetails.customerName}</span>
            </div>
            
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Email:</span>
              <span className="break-all">{appointmentDetails.customerEmail}</span>
            </div>
            
            {appointmentDetails.customerPhone && (
              <div className="flex justify-between items-start border-b pb-2">
                <span className="font-medium text-gray-600">Phone:</span>
                <span>{appointmentDetails.customerPhone}</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleReset}
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-black"
          >
            Reschedule Another Appointment
          </Button>
        </Card>
      </div>
    );
  }
  
  // Show the main rescheduling form
  return (
    <Card className="p-6">
      {appointmentDetails && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Current Appointment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>
                {format(new Date(appointmentDetails.startTime), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>
                {format(new Date(appointmentDetails.startTime), "h:mm a")} - 
                {format(new Date(appointmentDetails.endTime), "h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>{appointmentDetails.barberName}</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-blue-700">
            <span className="font-medium">Service:</span> {appointmentDetails.serviceName}
          </p>
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-4">Update Your Appointment</h3>
      
      <Form {...bookingForm}>
        <form onSubmit={bookingForm.handleSubmit(onRescheduleSubmit)} className="space-y-6">
          {updateError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ServiceSelector 
                form={bookingForm} 
                services={SERVICES}
              />

              <BarberSelector 
                form={bookingForm} 
                isLoading={loadingBarbers}
                barbers={barbers}
                disabled={!selectedServiceId}
              />

              <DateSelector 
                form={bookingForm}
                disabled={!selectedBarberId}
              />

              <TimeSelector 
                form={bookingForm} 
                isLoading={loadingTimeSlots}
                timeSlots={timeSlots}
                isDisabled={!selectedDate || !selectedBarberId || !selectedServiceId}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={bookingForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={bookingForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Any special requests or information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {selectedService && (
            <BookingSummary service={selectedService} />
          )}

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              className="bg-amber-500 hover:bg-amber-600 text-black" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                "Update Appointment"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}