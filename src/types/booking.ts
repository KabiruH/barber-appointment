// types/booking.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}
  
export interface Barber {
  id: string;
  name: string;
  email: string | null;
  bio: string | null;
  imageUrl: string | null;
  role?: 'ADMIN' | 'BARBER' | 'BEAUTICIAN';
  createdAt: Date;
  updatedAt: Date;
}
  
export interface TimeSlot {
  time: string;
  value: string;
  disabled: boolean;
}