"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarDays, Clock, User, Calendar as CalendarIcon, X } from "lucide-react";
import Link from "next/link";

// Mock data for appointments
const mockAppointments = [
  {
    id: "apt1",
    refNumber: "BRB12345",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    service: "Classic Haircut",
    barber: "James Wilson",
    date: new Date(2025, 2, 28, 10, 0), // March 28, 2025, 10:00 AM
    duration: 30,
    status: "confirmed"
  },
  {
    id: "apt2",
    refNumber: "BRB12346",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    service: "Haircut & Beard Trim",
    barber: "Miguel Rodriguez",
    date: new Date(2025, 2, 28, 11, 30), // March 28, 2025, 11:30 AM
    duration: 45,
    status: "confirmed"
  },
  {
    id: "apt3",
    refNumber: "BRB12347",
    customerName: "Emma Davis",
    customerEmail: "emma@example.com",
    service: "Hair Styling",
    barber: "Sarah Johnson",
    date: new Date(2025, 2, 28, 14, 0), // March 28, 2025, 2:00 PM
    duration: 20,
    status: "confirmed"
  },
  {
    id: "apt4",
    refNumber: "BRB12348",
    customerName: "Michael Brown",
    customerEmail: "michael@example.com",
    service: "Hot Towel Shave",
    barber: "James Wilson",
    date: new Date(2025, 3, 1, 9, 30), // April 1, 2025, 9:30 AM
    duration: 30,
    status: "pending"
  },
];

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Filter appointments for the selected date
  const appointmentsForDate = selectedDate 
    ? mockAppointments.filter(apt => 
        apt.date.getDate() === selectedDate.getDate() &&
        apt.date.getMonth() === selectedDate.getMonth() &&
        apt.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage appointments and schedules</p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/block-time">Block Time Slot</Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Time</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="barbers">Barbers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedDate ? (
                    <>Appointments for {format(selectedDate, "MMMM d, yyyy")}</>
                  ) : (
                    <>All Appointments</>
                  )}
                </CardTitle>
                <CardDescription>
                  {appointmentsForDate.length} appointments scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsForDate.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Barber</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointmentsForDate.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="font-medium">{format(appointment.date, "h:mm a")}</div>
                            <div className="text-xs text-muted-foreground">{appointment.duration} min</div>
                          </TableCell>
                          <TableCell>
                            <div>{appointment.customerName}</div>
                            <div className="text-xs text-muted-foreground">{appointment.customerEmail}</div>
                          </TableCell>
                          <TableCell>{appointment.service}</TableCell>
                          <TableCell>{appointment.barber}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === "confirmed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-red-500">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No appointments scheduled for this date
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Quick stats about your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Appointments</div>
                    <div className="text-2xl font-bold">{mockAppointments.length}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Hours Booked</div>
                    <div className="text-2xl font-bold">2.5</div>
                  </div>
                </div>
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
        
        <TabsContent value="barbers">
          <Card>
            <CardHeader>
              <CardTitle>Barber Management</CardTitle>
              <CardDescription>Add, edit, and manage barbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                Barber management feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>Add, edit, and manage services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                Service management feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}