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
import { Barber } from "@/types/booking";
import { BookingFormValues } from "./booking-schema";

interface BarberSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  isLoading: boolean;
  barbers: Barber[];
}

export function BarberSelector({ form, isLoading, barbers }: BarberSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="barberId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Barber</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading barbers..." : "Select a barber"} />
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
  );
}