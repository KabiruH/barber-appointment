// app/lookup/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Mail, Hash, Calendar, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Appointment {
  id: string;
  referenceNumber: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  serviceName: string;
  servicePrice: string;
  serviceDuration: number;
  barber: {
    id: string;
    name: string;
  };
}

export default function LookupPage() {
  const [lookupType, setLookupType] = useState<'reference' | 'email'>('reference');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleReferenceLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAppointment(null);
    setAppointments([]);

    try {
      const response = await fetch(`/api/appointments/lookup?reference=${referenceNumber}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setAppointment(result.data);
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
    setAppointment(null);
    setAppointments([]);

    try {
      const response = await fetch(`/api/appointments?email=${email}`);
      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data.length > 0) {
          setAppointments(result.data);
        } else {
          setError('No appointments found for this email address.');
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

  const getStatusBadge = (status: string) => {
    const colors = {
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
      NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'CONFIRMED' || status === 'COMPLETED') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-amber-600" />;
  };

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Check Your Reservation</h1>
        <p className="text-gray-600 text-lg">
          Look up your appointment using your reference number or email address
        </p>
      </div>

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
              <CardTitle>Look Up by Reference Number</CardTitle>
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

              {/* Single Appointment Result */}
              {appointment && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(appointment.status)}
                    <h3 className="text-lg font-semibold">Appointment Found</h3>
                  </div>
                  
                  <Card className="border-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">Reference Number</p>
                          <p className="font-bold text-lg text-amber-600">{appointment.referenceNumber}</p>
                        </div>
                        <Badge variant="outline" className={getStatusBadge(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                              {format(new Date(appointment.startTime), "EEEE, MMMM d, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Barber</p>
                            <p className="font-medium">{appointment.barber.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Service</p>
                            <p className="font-medium">{appointment.serviceName}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.serviceDuration} min · Kes {appointment.servicePrice}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-medium">{appointment.customerName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.customerEmail}</p>
                            {appointment.customerPhone && (
                              <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{appointment.notes}</p>
                        </div>
                      )}

                      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                        <div className="pt-4 border-t flex gap-2">
                          <Button asChild className="flex-1 bg-amber-500 hover:bg-amber-600 text-black">
                            <Link href="/reschedule">Reschedule</Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <Link href={`mailto:info@havancutz.co.ke?subject=Cancel Appointment ${appointment.referenceNumber}`}>
                              Cancel
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Lookup */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Look Up by Email</CardTitle>
              <CardDescription>
                View all appointments associated with your email address
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

              {/* Multiple Appointments Results */}
              {appointments.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''} Found
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <Card key={apt.id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={getStatusBadge(apt.status)}>
                                  {apt.status}
                                </Badge>
                                <span className="font-mono text-sm text-amber-600 font-semibold">
                                  {apt.referenceNumber}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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

                            {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                              <div className="flex gap-2">
                                <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
                                  <Link href="/reschedule">Reschedule</Link>
                                </Button>
                              </div>
                            )}
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

      {/* Help Section */}
      <Card className="mt-8 bg-gray-50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            If you can't find your appointment or need to make changes, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="tel:+254716107113">Call Us</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="mailto:info@havancutz.co.ke">Email Us</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}