"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDays, Clock, User, Loader2, X, Edit, Filter } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
    email: string | null;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BARBER';
}

type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all';

export default function AdminDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  
  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const result = await response.json();
        
        if (result.isAuthenticated) {
          setCurrentUser(result.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/appointments');
        const result = await response.json();
        
        if (response.ok && result.success) {
          let filteredAppointments = result.data;
          
          // Filter by barber if current user is a barber
          if (currentUser?.role === 'BARBER') {
            filteredAppointments = filteredAppointments.filter(
              (apt: Appointment) => apt.barber.id === currentUser.id
            );
          }
          
          setAppointments(filteredAppointments);
        } else {
          toast.error('Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('An error occurred while fetching appointments');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchAppointments();
    }
  }, [currentUser]);
  
  // Filter appointments by date range
  const getFilteredAppointments = () => {
    const now = new Date();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      
      switch (dateFilter) {
        case 'today':
          return aptDate >= startOfDay(now) && aptDate <= endOfDay(now);
        case 'tomorrow':
          const tomorrow = addDays(now, 1);
          return aptDate >= startOfDay(tomorrow) && aptDate <= endOfDay(tomorrow);
        case 'week':
          return aptDate >= startOfWeek(now) && aptDate <= endOfWeek(now);
        case 'month':
          return aptDate >= startOfMonth(now) && aptDate <= endOfMonth(now);
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };

  const filteredAppointments = getFilteredAppointments();

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = format(new Date(apt.startTime), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, Appointment[]>);

  // Calculate statistics
  const totalHours = appointments.reduce((sum, apt) => sum + apt.serviceDuration, 0) / 60;
  const uniqueCustomers = new Set(appointments.map(apt => apt.customerEmail)).size;
  const confirmedCount = appointments.filter(apt => apt.status === 'CONFIRMED').length;
  const pendingCount = appointments.filter(apt => apt.status === 'PENDING').length;

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setCancelling(appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Appointment cancelled successfully');
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'CANCELLED' } 
              : apt
          )
        );
      } else {
        toast.error(result.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('An error occurred');
    } finally {
      setCancelling(null);
    }
  };

  // Get status badge color
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

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-10 px-4 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {currentUser?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Appointments'}
          </h1>
          <p className="text-muted-foreground">
            {currentUser?.role === 'ADMIN' 
              ? 'Manage appointments and schedules' 
              : 'View and manage your appointments'}
          </p>
        </div>
        
        {currentUser?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/users">Manage Users</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/block-time">Block Time Slot</Link>
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          {currentUser?.role === 'ADMIN' && (
            <>
              <TabsTrigger value="blocked">Blocked Time</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Appointments</div>
                    <div className="text-2xl font-bold">{appointments.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Confirmed</div>
                    <div className="text-2xl font-bold">{confirmedCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Unique Customers</div>
                    <div className="text-2xl font-bold">{uniqueCustomers}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>
                    {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                
                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Appointments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="sticky top-0 bg-background z-10 pb-3 border-b mb-4">
                        <h3 className="text-lg font-semibold">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {/* Appointments for this day */}
                      <div className="space-y-3">
                        {dayAppointments.map((appointment) => (
                          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Time */}
                                <div className="flex items-center gap-3 min-w-[120px]">
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <div className="font-semibold">
                                      {format(new Date(appointment.startTime), "h:mm a")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {appointment.serviceDuration} min
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Customer & Service */}
                                <div className="flex-1">
                                  <div className="font-medium">{appointment.customerName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {appointment.serviceName} · Kes {appointment.servicePrice}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {appointment.customerEmail}
                                  </div>
                                </div>
                                
                                {/* Barber (Admin only) */}
                                {currentUser?.role === 'ADMIN' && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{appointment.barber.name}</span>
                                  </div>
                                )}
                                
                                {/* Status & Actions */}
                                <div className="flex items-center gap-3">
                                  <Badge 
                                    variant="outline" 
                                    className={getStatusBadge(appointment.status)}
                                  >
                                    {appointment.status}
                                  </Badge>
                                  
                                  <div className="flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      asChild
                                    >
                                      <Link href={`/appointments/${appointment.id}`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    {appointment.status !== 'CANCELLED' && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                        disabled={cancelling === appointment.id}
                                      >
                                        {cancelling === appointment.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No appointments found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try selecting a different time period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {currentUser?.role === 'ADMIN' && (
          <>
            <TabsContent value="blocked">
              <Card>
                <CardHeader>
                  <CardTitle>Blocked Time Slots</CardTitle>
                  <CardDescription>Manage blocked time periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    Blocked time management feature coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Manage barber availability and scheduling</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    Schedule management feature coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}