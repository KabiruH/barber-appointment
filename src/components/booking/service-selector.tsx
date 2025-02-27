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
import { Service } from "@/types/booking";
import { BookingFormValues } from "./booking-schema";

interface ServiceSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  isLoading: boolean;
  services: Service[];
}

export function ServiceSelector({ form, isLoading, services }: ServiceSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="serviceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading services..." : "Select a service"} />
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
  );
}