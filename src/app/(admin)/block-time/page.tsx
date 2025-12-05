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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CalendarIcon, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Barbers available at the shop
const barbers = [
  { id: "james", name: "James Wilson" },
  { id: "sarah", name: "Sarah Johnson" },
  { id: "miguel", name: "Miguel Rodriguez" },
];

// Available time slots for blocking
const startTimes = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

// Duration options for blocked time
const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "240", label: "Half day" },
  { value: "480", label: "Full day" },
];

// Form validation schema
const blockTimeSchema = z.object({
  barberId: z.string({ required_error: "Please select a barber" }),
  date: z.date({ required_error: "Please select a date" }),
  startTime: z.string({ required_error: "Please select a start time" }),
  duration: z.string({ required_error: "Please select a duration" }),
  reason: z.string().min(2, "Please provide a reason").max(200, "Reason is too long"),
  recurring: z.enum(["none", "weekly", "biweekly", "monthly"]).default("none"),
  occurrences: z.coerce.number().int().min(1).max(12).optional(),
});

type BlockTimeFormValues = z.infer<typeof blockTimeSchema>;

export default function BlockTimePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<BlockTimeFormValues>({
    resolver: zodResolver(blockTimeSchema),
    defaultValues: {
      reason: "",
      recurring: "none",
    },
  });

  // Watch the recurring value to conditionally show occurrences field
  const recurring = form.watch("recurring");
  
  function onSubmit(data: BlockTimeFormValues) {
    setIsSubmitting(true);
  
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  }

  if (success) {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4">
        <Link href="/appointments" className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <Alert className="bg-green-50 border-green-200 mb-6">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-bold">Time Blocked Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            The time slot has been blocked and will not be available for bookings.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Blocked Time Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Barber:</span> {barbers.find(b => b.id === form.getValues().barberId)?.name}
            </div>
            <div>
              <span className="font-medium">Date:</span> {format(form.getValues().date, "EEEE, MMMM d, yyyy")}
            </div>
            <div>
              <span className="font-medium">Time:</span> {form.getValues().startTime} ({durationOptions.find(d => d.value === form.getValues().duration)?.label})
            </div>
            <div>
              <span className="font-medium">Reason:</span> {form.getValues().reason}
            </div>
            {form.getValues().recurring !== "none" && (
              <div>
                <span className="font-medium">Recurring:</span> {form.getValues().recurring} 
                {form.getValues().occurrences && ` for Kes{form.getValues().occurrences} occurrences`}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/appointments">Return to Dashboard</Link>
            </Button>
            <Button 
              onClick={() => {
                setSuccess(false);
                form.reset();
              }}
            >
              Block Another Time
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Link href="/appointments" className="inline-flex items-center text-sm mb-6 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <Card>
        <CardHeader>
          <CardTitle>Block Time Slot</CardTitle>
          <CardDescription>
            Mark a time slot as unavailable for appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="barberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barber</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedBarber(value);
                      }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                format(field.value, "PPP")
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
                              // Only allow blocking future dates
                              return date < new Date(new Date().setHours(0, 0, 0, 0));
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
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {startTimes.map((time) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="recurring"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurring</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select if recurring" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not recurring</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {recurring !== "none" && (
                <FormField
                  control={form.control}
                  name="occurrences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Occurrences</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of occurrences" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'time' : 'times'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., Personal time off, Training, Vacation"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  type="button"
                  asChild
                >
                  <Link href="/appointments">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedBarber}
                >
                  {isSubmitting ? "Submitting..." : "Block Time Slot"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}