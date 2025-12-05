//components/booking/date-selector.tsx
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingFormValues } from "./booking-schema";

interface DateSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  disabled?: boolean; // Added this prop
}

export function DateSelector({ form, disabled }: DateSelectorProps) {
  return (
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
                  disabled={disabled} // Added disabled prop
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  {field.value ? (
                    format(field.value, "EEEE, MMMM d, yyyy")
                  ) : (
                    <span>{disabled ? "Select a barber first" : "Pick a date"}</span>
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
  );
}