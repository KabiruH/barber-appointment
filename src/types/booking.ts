// Type definitions for booking system

export type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  };
  
  export type Barber = {
    id: string;
    name: string;
  };
  
  export type TimeSlot = {
    time: string;
    value: string;
    disabled: boolean;
  };