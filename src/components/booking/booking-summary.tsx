// components/booking/booking-summary.tsx
import { Service } from "@/lib/services"; // Changed import
import { Card } from "@/components/ui/card";

interface BookingSummaryProps {
  service: Service;
}

export function BookingSummary({ service }: BookingSummaryProps) {
  return (
    <Card className="p-6 bg-amber-50 border-amber-200">
      <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{service.name}</span>
          <span className="font-semibold text-amber-600">Kes {service.price}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Duration:</span>
          <span>{service.duration} minutes</span>
        </div>
        {service.description && (
          <p className="text-sm text-gray-600 pt-2 border-t">
            {service.description}
          </p>
        )}
      </div>
    </Card>
  );
}