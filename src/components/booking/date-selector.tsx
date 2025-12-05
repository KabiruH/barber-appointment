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
import { useState } from "react";

interface DateSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  disabled?: boolean;
}

export function DateSelector({ form, disabled }: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "pl-3 text-left font-normal w-full",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{disabled ? "Select a barber first" : "Pick a date"}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            {/* Bigger popover + closable on date pick */}
            <PopoverContent className="p-0 w-[300px]">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false); // <-- closes popover instantly
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                  date.getDay() === 0
                }
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
