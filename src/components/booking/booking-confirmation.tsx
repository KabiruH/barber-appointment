import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Service } from "@/lib/services"; // Changed import
import { Barber } from "@/types/booking";
import { BookingFormValues } from "./booking-schema";

interface BookingConfirmationProps {
  referenceNumber: string;
  selectedService: Service | null;
  selectedBarber: Barber | undefined;
  formValues: BookingFormValues;
  onBookAnother: () => void;
}

export function BookingConfirmation({
  referenceNumber,
  selectedService,
  selectedBarber,
  formValues,
  onBookAnother
}: BookingConfirmationProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border">
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800 font-bold">Booking Confirmed!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your appointment has been successfully booked. A confirmation email has been sent to your email address.
        </AlertDescription>
      </Alert>
      
      <Card className="p-6 border-green-100">
        <h3 className="font-bold text-lg mb-4">Booking Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Reference Number:</span>
            <span className="font-bold text-amber-600">{referenceNumber}</span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Service:</span>
            <span className="text-right">{selectedService?.name}</span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Price:</span>
            <span className="font-semibold text-amber-600">Kes {selectedService?.price}</span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Barber:</span>
            <span>{selectedBarber?.name}</span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Date & Time:</span>
            <span className="text-right">
              {formValues.date && format(formValues.date, "EEEE, MMMM d, yyyy")}
              <br />
              {formValues.time}
            </span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Customer:</span>
            <span>{formValues.name}</span>
          </div>
          
          <div className="flex justify-between items-start border-b pb-2">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-right break-all">{formValues.email}</span>
          </div>
          
          {formValues.phone && (
            <div className="flex justify-between items-start border-b pb-2">
              <span className="font-medium text-gray-600">Phone:</span>
              <span>{formValues.phone}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-900 font-medium mb-1">
            📋 Save your reference number
          </p>
          <p className="text-sm text-amber-800">
            Reference: <strong className="text-amber-600">{referenceNumber}</strong>
          </p>
          <p className="text-xs text-amber-700 mt-2">
            You'll need this if you want to modify or cancel your appointment.
          </p>
        </div>
        
        <Button 
          onClick={onBookAnother}
          className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-black"
        >
          Book Another Appointment
        </Button>
      </Card>
    </div>
  );
}