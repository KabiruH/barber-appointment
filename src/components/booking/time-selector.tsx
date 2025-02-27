import { UseFormReturn } from "react-hook-form";
import {
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
import { TimeSlot } from "@/types/booking";
import { BookingFormValues } from "./booking-schema";

interface TimeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  isLoading: boolean;
  timeSlots: TimeSlot[];
  isDisabled: boolean;
}

export function TimeSelector({ form, isLoading, timeSlots, isDisabled }: TimeSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isLoading || isDisabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading 
                    ? "Loading available times..." 
                    : isDisabled
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
  );
}