// components/booking/time-selector.tsx
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
import { BookingFormValues } from "./booking-schema";
import { TimeSlot } from "@/types/booking";

interface TimeSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  isLoading: boolean;
  timeSlots: TimeSlot[];
  isDisabled?: boolean;
}

// Hardcoded time slots from 7am to 8pm (1-hour intervals)
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "7:00 AM", value: "7:00 AM", disabled: false },
  { time: "8:00 AM", value: "8:00 AM", disabled: false },
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
];

export function TimeSelector({ form, isLoading, timeSlots, isDisabled }: TimeSelectorProps) {
  // Use provided timeSlots if available, otherwise use defaults
  const availableSlots = timeSlots.length > 0 ? timeSlots : DEFAULT_TIME_SLOTS;
  
  // Count available (non-disabled) slots
  const availableCount = availableSlots.filter(slot => !slot.disabled).length;

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
            disabled={isDisabled || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    isDisabled 
                      ? "Select date first" 
                      : isLoading 
                        ? "Loading times..." 
                        : availableCount === 0
                          ? "No times available"
                          : "Select a time"
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No time slots available for this day
                </div>
              ) : availableCount === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  All time slots are booked for this date
                </div>
              ) : (
                availableSlots.map((slot) => (
                  <SelectItem 
                    key={slot.value} 
                    value={slot.value}
                    disabled={slot.disabled}
                    className={slot.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{slot.time}</span>
                      {slot.disabled && (
                        <span className="text-xs text-red-500 ml-2">(Booked)</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}