// components/appointment/edit-appointment-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SERVICES } from "@/lib/services";

interface Appointment {
  id: string;
  referenceNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  barber: {
    id: string;
    name: string;
    email: string | null;
  };
}

interface Barber {
  id: string;
  name: string;
  email: string;
}

interface TimeSlot {
  disabled: boolean | undefined;
  value: string;
  time: string;
  available: boolean;
}

interface EditAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSuccess: (updatedAppointment: Appointment) => void;
}

const editAppointmentSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  barberId: z.string().min(1, "Please select a barber"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, "Please select a time"),
});

type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>;

export function EditAppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: EditAppointmentModalProps) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditAppointmentFormValues>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      serviceId: "",
      barberId: "",
      date: undefined,
      time: "",
    },
  });

  const selectedServiceId = form.watch("serviceId");
  const selectedBarberId = form.watch("barberId");
  const selectedDate = form.watch("date");

// Load initial values when appointment changes
useEffect(() => {
  if (appointment && open) {
    console.log("Loading appointment:", appointment);
    
    // Find the service ID from the service name
    const service = SERVICES.find(s => s.name === appointment.serviceName);
    console.log("Found service:", service);
    
    // Parse the date from startTime
    const appointmentDate = new Date(appointment.startTime);
    console.log("Appointment date:", appointmentDate);
    
    // Format time from startTime - FIXED with leading zero
    const timeString = appointment.startTime.split('T')[1]; // Gets "09:00:00.000Z"
    const [hours, minutes] = timeString.split(':');
    
    // Convert to 12-hour format with SPACE before AM/PM
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    
    // Add leading zero if needed (9 becomes "09")
    const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
    const formattedTime = `${formattedHour}:${minutes} ${ampm}`;
    
    console.log("Formatted time:", formattedTime);

    form.reset({
      serviceId: service?.id || "",
      barberId: appointment.barber.id,
      date: appointmentDate,
      time: formattedTime,
    });
    
    console.log("Form values after reset:", form.getValues());
  }
}, [appointment, open, form]);

  // Fetch barbers
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setLoadingBarbers(true);
        const response = await fetch('/api/barbers');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setBarbers(result.data);
        }
      } catch (error) {
        console.error('Error fetching barbers:', error);
        toast.error('Failed to load barbers');
      } finally {
        setLoadingBarbers(false);
      }
    };
    
    if (open) {
      fetchBarbers();
    }
  }, [open]);

// Fetch available time slots
useEffect(() => {
  const fetchTimeSlots = async () => {
    if (!open) {
      setTimeSlots([]);
      return;
    }

    if (!selectedServiceId || !selectedBarberId || !selectedDate || !appointment) {
      setTimeSlots([]);
      return;
    }
    
    const service = SERVICES.find(s => s.id === selectedServiceId);
    if (!service) {
      setTimeSlots([]);
      return;
    }
    
    try {
      setLoadingTimeSlots(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      console.log("Fetching time slots for:", {
        dateString,
        barberId: selectedBarberId,
        duration: service.duration,
        excludeAppointmentId: appointment.id
      });
      
      // Include appointment ID to exclude it from conflict checking
      const url = `/api/available-slots?date=${dateString}&barberId=${selectedBarberId}&duration=${service.duration}&excludeAppointmentId=${appointment.id}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log("Time slots response:", result);
      
      if (response.ok && result.success) {
        console.log("Loaded time slots:", result.data.availableSlots);
        setTimeSlots(result.data.availableSlots || []);
      } else {
        console.error("Failed to load time slots:", result);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };
  
  fetchTimeSlots();
  // FIXED: Use appointment.id instead of appointment object
}, [open, selectedServiceId, selectedBarberId, selectedDate, appointment?.id]);

  const onSubmit = async (data: EditAppointmentFormValues) => {
    if (!appointment) return;

    try {
      setIsSubmitting(true);
      
      const service = SERVICES.find(s => s.id === data.serviceId);
      if (!service) {
        toast.error("Invalid service selected");
        return;
      }

      const dateString = format(data.date, 'yyyy-MM-dd');

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: service.name,
          servicePrice: service.price,
          serviceDuration: service.duration,
          barberId: data.barberId,
          date: dateString,
          time: data.time,
          name: appointment.customerName,
          email: appointment.customerEmail,
          phone: appointment.customerPhone,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Appointment updated successfully');
        onSuccess(result.data);
        onOpenChange(false);
      } else {
        toast.error(result.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('An error occurred while updating the appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update the appointment details. Customer will be notified via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Customer Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Customer Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <strong>{appointment.customerName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                {appointment.customerEmail}
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {appointment.customerPhone || "N/A"}
              </div>
              <div>
                <span className="text-muted-foreground">Reference:</span>{" "}
                {appointment.referenceNumber}
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service</Label>
            <Select
              value={form.watch("serviceId")}
              onValueChange={(value) => form.setValue("serviceId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - Kes {service.price} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.serviceId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.serviceId.message}
              </p>
            )}
          </div>

          {/* Barber Selection */}
          <div className="space-y-2">
            <Label htmlFor="barberId">Barber/Stylist</Label>
            <Select
              value={form.watch("barberId")}
              onValueChange={(value) => form.setValue("barberId", value)}
              disabled={loadingBarbers || !selectedServiceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a barber" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.barberId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.barberId.message}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!selectedBarberId}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date") ? (
                    format(form.watch("date"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    date.getDay() === 0
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-sm text-red-500">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

{/* Time Selection */}
<div className="space-y-2">
  <Label htmlFor="time">Time</Label>
  <Select
    value={form.watch("time") || ""}
    onValueChange={(value) => {
      console.log("Time changed to:", value);
      form.setValue("time", value);
    }}
    disabled={!selectedDate || loadingTimeSlots}
  >
    <SelectTrigger>
      <SelectValue>
        {form.watch("time") || "Select a time"}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {loadingTimeSlots ? (
        <div className="p-2 text-center">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        </div>
      ) : timeSlots.length > 0 ? (
        timeSlots.map((slot) => (
          <SelectItem 
            key={slot.time} 
            value={slot.time}
            disabled={slot.disabled}
            className={slot.disabled ? "opacity-50" : ""}
          >
            <div className="flex items-center justify-between w-full">
              <span>{slot.time}</span>
              {slot.disabled && (
                <span className="text-xs text-red-500 ml-2">(Booked)</span>
              )}
            </div>
          </SelectItem>
        ))
      ) : (
        <div className="p-2 text-center text-sm text-muted-foreground">
          No available slots
        </div>
      )}
    </SelectContent>
  </Select>
  {form.formState.errors.time && (
    <p className="text-sm text-red-500">
      {form.formState.errors.time.message}
    </p>
  )}
</div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !form.formState.isValid}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Appointment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}