"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, X, User, AlertCircle } from "lucide-react";
import { format, isSameDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - in a real app this would come from your API
const mockBlockedTimeSlots = [
  {
    id: "block1",
    barberId: "james",
    barberName: "James Wilson",
    startDate: new Date(2025, 2, 28, 9, 0), // March 28, 2025, 9:00 AM
    endDate: new Date(2025, 2, 28, 12, 0), // March 28, 2025, 12:00 PM
    reason: "Training session",
    recurring: null
  },
  {
    id: "block2",
    barberId: "sarah",
    barberName: "Sarah Johnson",
    startDate: new Date(2025, 2, 29, 15, 0), // March 29, 2025, 3:00 PM
    endDate: new Date(2025, 2, 29, 17, 0), // March 29, 2025, 5:00 PM
    reason: "Doctor's appointment",
    recurring: null
  },
  {
    id: "block3",
    barberId: "miguel",
    barberName: "Miguel Rodriguez",
    startDate: new Date(2025, 3, 1, 9, 0), // April 1, 2025, 9:00 AM
    endDate: new Date(2025, 3, 1, 17, 0), // April 1, 2025, 5:00 PM
    reason: "Vacation day",
    recurring: null
  },
  {
    id: "block4",
    barberId: "james",
    barberName: "James Wilson",
    startDate: new Date(2025, 3, 5, 14, 0), // April 5, 2025, 2:00 PM
    endDate: new Date(2025, 3, 5, 17, 0), // April 5, 2025, 5:00 PM
    reason: "Personal time",
    recurring: "weekly",
    occurrences: 4
  }
];

interface BlockedTimeListProps {
  selectedDate?: Date;
}

export default function BlockedTimeList({ selectedDate }: BlockedTimeListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // Filter time blocks for the selected date if provided
  const blockedTimes = selectedDate 
    ? mockBlockedTimeSlots.filter(block => 
        isSameDay(block.startDate, selectedDate)
      )
    : mockBlockedTimeSlots;

  // Sort by date then by barber name
  const sortedBlockedTimes = [...blockedTimes].sort((a, b) => {
    if (a.startDate.getTime() !== b.startDate.getTime()) {
      return a.startDate.getTime() - b.startDate.getTime();
    }
    return a.barberName.localeCompare(b.barberName);
  });

  const handleDeleteClick = (blockId: string) => {
    setSelectedBlock(blockId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // In a real app, you would call your API to delete the time block
    setIsDeleteDialogOpen(false);
    setSelectedBlock(null);
    // Then you would refresh the list
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Blocked Time Slots for ${format(selectedDate, "MMMM d, yyyy")}`
              : "All Blocked Time Slots"
            }
          </CardTitle>
          <CardDescription>
            Time slots marked as unavailable for appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedBlockedTimes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBlockedTimes.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>
                      {format(block.startDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(block.startDate, "h:mm a")} - {format(block.endDate, "h:mm a")}
                    </TableCell>
                    <TableCell>{block.barberName}</TableCell>
                    <TableCell>{block.reason}</TableCell>
                    <TableCell>
                      {block.recurring ? (
                        <Badge variant="outline" className="capitalize">
                          {block.recurring} 
                          {block.occurrences && ` (${block.occurrences}x)`}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeleteClick(block.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-amber-100 p-3 mb-4">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">No blocked time slots</h3>
              <p className="text-muted-foreground mb-4">
                {selectedDate 
                  ? "There are no blocked time slots for this date." 
                  : "There are no blocked time slots scheduled."
                }
              </p>
              <Button asChild>
                <a href="/admin/block-time">Block a Time Slot</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blocked time slot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}