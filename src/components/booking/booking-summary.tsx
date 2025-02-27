import { Service } from "@/types/booking";

interface BookingSummaryProps {
  service: Service;
}

export function BookingSummary({ service }: BookingSummaryProps) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
      <h3 className="font-medium text-amber-800 mb-2">Booking Summary</h3>
      <p className="text-amber-700">Service: {service.name}</p>
      <p className="text-amber-700">Duration: {service.duration} minutes</p>
      <p className="text-amber-700">Price: Kes{service.price}</p>
    </div>
  );
}