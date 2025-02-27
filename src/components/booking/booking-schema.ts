import { z } from "zod";

// Form validation schema
export const bookingFormSchema = z.object({
  serviceId: z.string({ required_error: "Please select a service" }),
  barberId: z.string({ required_error: "Please select a barber" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;