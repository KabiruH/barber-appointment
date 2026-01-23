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
  selectedDate?: Date; // Add selectedDate to determine day of week
}

// Generate time slots with 30-minute intervals
const generateTimeSlots = (startHour: number, endHour: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute of [0, 30]) {
      // Skip the half-hour slot if we're at the end hour
      if (hour === endHour && minute === 30) break;
      
      const hourDisplay = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      const minuteDisplay = minute === 0 ? "00" : minute;
      
      const time = `${hourDisplay}:${minuteDisplay} ${period}`;
      slots.push({ time, value: time, disabled: false });
    }
  }
  
  return slots;
};

// Get time slots based on day of week
const getTimeSlotsForDay = (date?: Date): TimeSlot[] => {
  if (!date) {
    // Default to Monday-Friday range if no date selected
    return generateTimeSlots(8, 21); // 8am - 9pm
  }
  
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === 0) {
    // Sunday: 10am - 8pm
    return generateTimeSlots(10, 20);
  } else {
    // Monday-Saturday: 8am - 9pm
    return generateTimeSlots(8, 21);
  }
};

export function TimeSelector({ 
  form, 
  isLoading, 
  timeSlots, 
  isDisabled,
  selectedDate 
}: TimeSelectorProps) {
  // Generate default slots based on selected date
  const defaultSlots = getTimeSlotsForDay(selectedDate);
  
  // If timeSlots are provided (with disabled flags from backend), merge with defaults
  let availableSlots: TimeSlot[];
  
  if (timeSlots.length > 0) {
    // Create a map of disabled times from the backend
    const disabledTimes = new Set(
      timeSlots.filter(slot => slot.disabled).map(slot => slot.value)
    );
    
    // Apply disabled status to default slots
    availableSlots = defaultSlots.map(slot => ({
      ...slot,
      disabled: disabledTimes.has(slot.value)
    }));
  } else {
    // No backend data, use all default slots as available
    availableSlots = defaultSlots;
  }
  
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