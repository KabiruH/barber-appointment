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
import { Service } from "@/lib/services"; // Changed import
import { BookingFormValues } from "./booking-schema";
import { Clock } from "lucide-react";

interface ServiceSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  services: Service[]; // Removed isLoading since services are hardcoded
}

export function ServiceSelector({ form, services }: ServiceSelectorProps) {
  return (
    <FormField
      control={form.control}
      name="serviceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-amber-600 font-semibold">Kes{service.price}</span>
                    </div>
                    
                  </div>
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