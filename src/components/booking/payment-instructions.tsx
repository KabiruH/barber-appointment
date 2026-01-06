// components/booking/payment-instructions.tsx
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface PaymentInstructionsProps {
  referenceNumber: string;
  amount: number;
  customerName: string;
  serviceName: string; 
  isHaircut: boolean; 
  onBackToHome: () => void;
}

export function PaymentInstructions({
  referenceNumber,
  amount,
  customerName,
  serviceName,  
  isHaircut,   
  onBackToHome
}: PaymentInstructionsProps) {
  const [copied, setCopied] = useState(false);
  const paybillNumber = "400200"; // Your M-Pesa Paybill/Till Number
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border max-w-2xl mx-auto">
      <Alert className="bg-amber-50 border-amber-200">
        <Clock className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 font-bold">
          Payment Required
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          Your appointment is reserved. Complete payment within 30 minutes to confirm your booking.
        </AlertDescription>
      </Alert>

      <Card className="p-6 border-amber-100 bg-gradient-to-br from-amber-50 to-white">
        <h3 className="font-bold text-xl mb-4 text-center">
          Complete Your Payment
        </h3>
        
        <div className="space-y-4">
          {/* Service and Amount */}
          <div className="text-center p-4 bg-white rounded-lg border-2 border-amber-200 space-y-2">
            <p className="text-sm text-gray-600">Service</p>
            <p className="text-lg font-semibold text-gray-800">{serviceName}</p>
            <p className="text-sm text-gray-600 mt-2">
              {isHaircut ? "Booking Fee" : "Total Amount"}
            </p>
            <p className="text-3xl font-bold text-amber-600">
              Kes {amount.toLocaleString()}
            </p>
            {isHaircut && (
              <p className="text-xs text-gray-500 mt-1">
                Full service amount due after haircut
              </p>
            )}
          </div>

          {/* M-Pesa Instructions */}
          <div className="bg-white p-5 rounded-lg border">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                1
              </span>
              M-Pesa Payment Steps
            </h4>
            
            <ol className="space-y-3 ml-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">1.</span>
                <span>Go to M-Pesa menu on your phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">2.</span>
                <span>Select <strong>Lipa na M-Pesa</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">3.</span>
                <span>Select <strong>Pay Bill</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">4.</span>
                <div className="flex-1">
                  <span>Enter Business Number:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-3 py-1 rounded font-mono text-base font-semibold">
                      {paybillNumber}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(paybillNumber)}
                      className="h-7"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">5.</span>
                <div className="flex-1">
                  <span>Enter Account Number (Your Reference):</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-amber-100 px-3 py-1 rounded font-mono text-base font-semibold text-amber-800">
                      {referenceNumber}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(referenceNumber)}
                      className="h-7"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">6.</span>
                <span>Enter Amount: <strong>{amount}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-gray-700">7.</span>
                <span>Enter your M-Pesa PIN and confirm</span>
              </li>
            </ol>
          </div>

          {/* Important Notice */}
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold text-sm">
              Important!
            </AlertTitle>
            <AlertDescription className="text-red-700 text-sm space-y-1">
              <p>• Use <strong>{referenceNumber}</strong> as the Account Number</p>
              <p>• Ensure the name on M-Pesa matches: <strong>{customerName}</strong></p>
              <p>• Keep your M-Pesa confirmation SMS</p>
            </AlertDescription>
          </Alert>

          {/* What Happens Next */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                2
              </span>
              What Happens Next?
            </h4>
            <ul className="space-y-2 ml-8 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>After payment, our team will verify your transaction</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>You'll receive a confirmation email within 5-10 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Your appointment will be confirmed and secured</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Need help with payment?
            </p>
            <p className="text-sm font-medium">
              Call/WhatsApp: <a href="tel:+254700000000" className="text-amber-600 hover:underline">+254 700 000 000</a>
            </p>
          </div>
        </div>

        <Button
          onClick={onBackToHome}
          variant="outline"
          className="w-full mt-6"
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
}