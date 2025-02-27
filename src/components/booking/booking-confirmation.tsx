import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Service, Barber } from "@/types/booking";
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
        <div className="space-y-2">
          <p><span className="font-medium">Reference Number:</span> {referenceNumber}</p>
          <p><span className="font-medium">Service:</span> {selectedService?.name}</p>
          <p><span className="font-medium">Barber:</span> {selectedBarber?.name}</p>
          <p>
            <span className="font-medium">Date & Time:</span>{" "}
            {formValues.date && format(formValues.date, "EEEE, MMMM d, yyyy")} at {formValues.time}
          </p>
          <p><span className="font-medium">Duration:</span> {selectedService?.duration} minutes</p>
          <p><span className="font-medium">Customer:</span> {formValues.name}</p>
          <p><span className="font-medium">Email:</span> {formValues.email}</p>
          {formValues.phone && <p><span className="font-medium">Phone:</span> {formValues.phone}</p>}
        </div>
        
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Please save your reference number: <strong>{referenceNumber}</strong></p>
          <p>You'll need this if you want to modify or cancel your appointment.</p>
        </div>
        
        <Button 
          onClick={onBookAnother}
          className="mt-6"
        >
          Book Another Appointment
        </Button>
      </Card>
    </div>
  );
}