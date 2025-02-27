"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions
type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
};

type Barber = {
  id: string;
  name: string;
};

type TimeSlot = {
  time: string;
  value: string;
  disabled: boolean;
};

// Form validation schema
const bookingFormSchema = z.object({
  serviceId: z.string({ required_error: "Please select a service" }),
  barberId: z.string({ required_error: "Please select a barber" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

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
      <div className="space-y-6 bg-white p-6 rounded-lg border">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Booking Confirmed!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your appointment has been successfully booked. A confirmation email has been sent to your email address.
          </AlertDescription>
        </Alert>
        
        <Card className="p-6 border-green-100">
          <h3 className="font-bold text-lg mb-4">Booking Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Reference Number:</span> {referenceNumber}</p>
            <p><span className="font-medium">Service:</span> {selectedService?.name}</p>
            <p><span className="font-medium">Barber:</span> {barbers.find(b => b.id === form.getValues().barberId)?.name}</p>
            <p><span className="font-medium">Date & Time:</span> {format(form.getValues().date, "EEEE, MMMM d, yyyy")} at {form.getValues().time}</p>
            <p><span className="font-medium">Duration:</span> {selectedService?.duration} minutes</p>
            <p><span className="font-medium">Customer:</span> {form.getValues().name}</p>
            <p><span className="font-medium">Email:</span> {form.getValues().email}</p>
            {form.getValues().phone && <p><span className="font-medium">Phone:</span> {form.getValues().phone}</p>}
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>Please save your reference number: <strong>{referenceNumber}</strong></p>
            <p>You'll need this if you want to modify or cancel your appointment.</p>
          </div>
          
          <Button 
            onClick={() => {
              setBookingComplete(false);
              form.reset();
              setSelectedService(null);
            }}
            className="mt-6"
          >
            Book Another Appointment
          </Button>
        </Card>
      </div>
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
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingServices}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingServices ? "Loading services..." : "Select a service"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - Kes{service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barber</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingBarbers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingBarbers ? "Loading barbers..." : "Select a barber"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {barbers.map((barber) => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "EEEE, MMMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            // Disable dates in the past and Sundays
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                              date.getDay() === 0
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingTimeSlots || !selectedDate || !selectedBarberId || !selectedServiceId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            loadingTimeSlots 
                              ? "Loading available times..." 
                              : !selectedDate || !selectedBarberId || !selectedServiceId
                                ? "Select service, barber, and date first"
                                : "Select a time slot"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => (
                            <SelectItem 
                              key={slot.value} 
                              value={slot.value}
                              disabled={slot.disabled}
                            >
                              {slot.time}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem 
                            value="no-slots" 
                            disabled={true}
                          >
                            No available time slots
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or information"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {selectedService && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Booking Summary</h3>
              <p className="text-amber-700">Service: {selectedService.name}</p>
              <p className="text-amber-700">Duration: {selectedService.duration} minutes</p>
              <p className="text-amber-700">Price: Kes{selectedService.price}</p>
            </div>
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