import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, handling Tailwind CSS conflicts
 * This utility is required for shadcn/ui components
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
} 

/**
 * Generate a unique reference number for appointments
 */
export function generateReferenceNumber(): string {
  return "BRB" + Math.floor(10000 + Math.random() * 90000);
}

/**
 * Format a date object as a time string (e.g., "10:30 AM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Calculate the end time based on a start time and duration in minutes
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return endTime;
}

/**
 * Check if a time slot is available (does not overlap with existing appointments)
 */
export function isTimeSlotAvailable(
  startTime: Date,
  durationMinutes: number,
  existingAppointments: Array<{ startTime: Date; endTime: Date }>
): boolean {
  const endTime = calculateEndTime(startTime, durationMinutes);
  
  return !existingAppointments.some(appointment => {
    // Check if the new appointment overlaps with any existing appointment
    return (
      (startTime >= appointment.startTime && startTime < appointment.endTime) ||
      (endTime > appointment.startTime && endTime <= appointment.endTime) ||
      (startTime <= appointment.startTime && endTime >= appointment.endTime)
    );
  });
}