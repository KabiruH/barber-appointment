//components/booking/barber-selector.tsx
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
import { Badge } from "@/components/ui/badge";
import { Barber } from "@/types/booking";
import { BookingFormValues } from "./booking-schema";

interface BarberSelectorProps {
  form: UseFormReturn<BookingFormValues>;
  isLoading: boolean;
  barbers: Barber[];
  disabled?: boolean;
}

export function BarberSelector({ form, isLoading, barbers, disabled }: BarberSelectorProps) {
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
            disabled={isLoading || disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    disabled 
                      ? "Select a service first" 
                      : isLoading 
                        ? "Loading barbers..." 
                        : "Select a barber"
                  } 
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {barbers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No barbers available
                </div>
              ) : (
                barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{barber.name}</span>
                        {(barber as any).role === 'ADMIN' && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      {barber.bio && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {barber.bio}
                        </span>
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