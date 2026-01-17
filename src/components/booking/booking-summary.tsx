// components/booking/booking-summary.tsx
import { Service, getBookingAmount } from "@/lib/services";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface BookingSummaryProps {
  service: Service;
}

export function BookingSummary({ service }: BookingSummaryProps) {
  const bookingAmount = getBookingAmount(service);
  const isHaircut = service.isHaircut;
  
  return (
    <Card className="p-6 bg-amber-50 border-amber-200">
      <h3 className="font-bold text-lg mb-4">Booking Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{service.name}</span>
          <span className="font-semibold text-amber-600">
            Kes {service.price.toLocaleString()}
          </span>
        </div>
        {service.description && (
          <p className="text-sm text-gray-600 pt-2 border-t">
            {service.description}
          </p>
        )}
        
        {/* Payment Amount Section */}
        <div className="border-t border-amber-300 my-3 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">
              {isHaircut ? "Booking Fee:" : "Payment Required:"}
            </span>
            <span className="font-bold text-amber-600 text-xl">
              Kes {bookingAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Information Alert */}
        {isHaircut ? (
          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Pay Kes 1,500 booking fee to secure your appointment. 
              Full service amount (Kes {service.price.toLocaleString()}) is due after your haircut.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-800">
              Full payment is required to confirm and secure your appointment.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}