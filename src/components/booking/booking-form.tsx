"use client";

import { useState } from "react";
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
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Services offered by the barber shop
const services = [
  { id: "haircut", name: "Classic Haircut", price: 30, duration: 30 },
  { id: "beard", name: "Beard Trim", price: 20, duration: 20 },
  { id: "shave", name: "Hot Towel Shave", price: 35, duration: 30 },
  { id: "combo", name: "Haircut & Beard Trim", price: 45, duration: 45 },
  { id: "styling", name: "Hair Styling", price: 25, duration: 20 },
  { id: "kids", name: "Kids Haircut", price: 25, duration: 30 },
];

// Barbers working at the shop
const barbers = [
  { id: "james", name: "James Wilson" },
  { id: "sarah", name: "Sarah Johnson" },
  { id: "miguel", name: "Miguel Rodriguez" },
];

// Available time slots
const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

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
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    
    // In a real app, this would be an API call to create the appointment
    console.log("Form submitted:", data);
    
    // Generate a reference number
    const refNumber = "BRB" + Math.floor(10000 + Math.random() * 90000);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingComplete(true);
      setReferenceNumber(refNumber);
    }, 1500);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedService(
                          services.find((service) => service.id === value)
                        );
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a barber" />
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
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
            {isSubmitting ? "Processing..." : "Book Appointment"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}