// components/booking/reschedule-lookup.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Mail, Hash, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import RescheduleForm from "./reschedule-form";

interface Appointment {
  id: string;
  referenceNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  barber: {
    id: string;
    name: string;
  };
}

export default function RescheduleLookup() {
  const [lookupType, setLookupType] = useState<'reference' | 'email'>('reference');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleReferenceLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSelectedAppointment(null);
    setAppointments([]);
    setShowForm(false);

    try {
      const response = await fetch(`/api/appointments/lookup?reference=${referenceNumber}`);
      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data.status === 'CANCELLED') {
          setError('This appointment has been cancelled and cannot be rescheduled.');
        } else if (result.data.status === 'COMPLETED') {
          setError('This appointment has been completed and cannot be rescheduled.');
        } else {
          setSelectedAppointment(result.data);
          setShowForm(true);
        }
      } else {
        setError(result.message || 'Appointment not found. Please check your reference number.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSelectedAppointment(null);
    setAppointments([]);
    setShowForm(false);

    try {
      const response = await fetch(`/api/appointments?email=${email}`);
      const result = await response.json();

      if (response.ok && result.success) {
        // Filter out cancelled and completed appointments
        const activeAppointments = result.data.filter(
          (apt: Appointment) => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
        );

        if (activeAppointments.length > 0) {
          setAppointments(activeAppointments);
        } else {
          setError('No active appointments found for this email address.');
        }
      } else {
        setError('An error occurred while searching for appointments.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowForm(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  // If form is shown, display it
  if (showForm && selectedAppointment) {
    return (
      <div className="space-y-6">
        {/* Current Appointment Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Current Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{selectedAppointment.referenceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{format(new Date(selectedAppointment.startTime), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{format(new Date(selectedAppointment.startTime), "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span>{selectedAppointment.barber.name}</span>
              </div>
            </div>
           
          </CardContent>
        </Card>

        {/* Reschedule Form */}
        <RescheduleForm initialReference={selectedAppointment.referenceNumber} />
      </div>
    );
  }

  return (
    <Tabs value={lookupType} onValueChange={(v) => setLookupType(v as 'reference' | 'email')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="reference">
          <Hash className="mr-2 h-4 w-4" />
          Reference Number
        </TabsTrigger>
        <TabsTrigger value="email">
          <Mail className="mr-2 h-4 w-4" />
          Email Address
        </TabsTrigger>
      </TabsList>

      {/* Reference Number Lookup */}
      <TabsContent value="reference">
        <Card>
          <CardHeader>
            <CardTitle>Find by Reference Number</CardTitle>
            <CardDescription>
              Enter the reference number from your booking confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReferenceLookup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="e.g. BRB12345"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Format: BRB followed by 5 digits
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Appointment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Email Lookup */}
      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>Find by Email</CardTitle>
            <CardDescription>
              View all active appointments for your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLookup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Appointments
                  </>
                )}
              </Button>
            </form>

            {/* List of appointments for email */}
            {appointments.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">
                  Select an appointment to reschedule
                </h3>
                
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <Card 
                      key={apt.id} 
                      className="border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectAppointment(apt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getStatusBadge(apt.status)}>
                                {apt.status}
                              </Badge>
                              <span className="font-mono text-sm text-amber-600 font-semibold">
                                {apt.referenceNumber}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{format(new Date(apt.startTime), "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{format(new Date(apt.startTime), "h:mm a")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{apt.barber.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{apt.serviceName}</span>
                              </div>
                            </div>
                          </div>

                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                            Select
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}