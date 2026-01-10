// lib/services.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string; // Added category for better organization
  isHaircut?: boolean; // Flag to identify haircut service
}

export const SERVICES: Service[] = [
  // Hair Services
  {
    id: "kids-haircut",
    name: "Kids Haircut",
    description: "Gentle haircuts for young gentlemen under 12",
    price: 1000,
    duration: 30,
    category: "Hair",
  },
  {
    id: "haircut",
    name: "Haircut",
    description: "Precision cut with attention to detail, includes styling",
    price: 1000,
    duration: 45,
    category: "Hair",
    isHaircut: true,
  },
  
  // Hand Services
  {
    id: "manicure",
    name: "Manicure",
    description: "Professional hand care and nail grooming",
    price: 1300,
    duration: 45,
    category: "Hands",
  },
  {
    id: "nail-cut",
    name: "Nail Cut",
    description: "Basic nail trimming and shaping",
    price: 1000,
    duration: 20,
    category: "Hands",
  },
  {
    id: "men-gel-application",
    name: "Men Gel Application",
    description: "Gel polish application for men",
    price: 1000,
    duration: 30,
    category: "Hands",
  },
  {
    id: "gel-application",
    name: "Gel Application",
    description: "Professional gel polish application",
    price: 1500,
    duration: 45,
    category: "Hands",
  },
  {
    id: "nail-cut-clear-gel",
    name: "Nail Cut + Clear Gel",
    description: "Nail trimming with clear gel polish",
    price: 1500,
    duration: 35,
    category: "Hands",
  },
  {
    id: "stickons",
    name: "Stick-ons",
    description: "Press-on nail application",
    price: 2500,
    duration: 30,
    category: "Hands",
  },
  {
    id: "tips-gel",
    name: "Tips + Gel",
    description: "Nail tips with gel overlay",
    price: 3500,
    duration: 90,
    category: "Hands",
  },
  {
    id: "acrylics",
    name: "Acrylics",
    description: "Full acrylic nail set",
    price: 5000,
    duration: 120,
    category: "Hands",
  },
  {
    id: "removal",
    name: "Gel/Acrylic Removal",
    description: "Safe removal of gel or acrylic nails",
    price: 1000,
    duration: 30,
    category: "Hands",
  },
  
  // Feet Services
  {
    id: "pedicure",
    name: "Pedicure",
    description: "Complete foot care and nail grooming",
    price: 1500,
    duration: 60,
    category: "Feet",
  },
  {
    id: "pedicure-gel",
    name: "Pedicure + Gel",
    description: "Pedicure with gel polish application",
    price: 2500,
    duration: 75,
    category: "Feet",
  },
  
  // Facial Services
  {
    id: "facial-basic",
    name: "Facial (Basic)",
    description: "Deep cleansing and rejuvenating facial treatment",
    price: 3000,
    duration: 60,
    category: "Facial",
  },
  {
    id: "facial-premium",
    name: "Hydra Facial",
    description: "Advanced facial treatment with premium products",
    price: 4500,
    duration: 75,
    category: "Facial",
  },
  {
    id: "facial-luxury",
    name: "Facial (Luxury)",
    description: "Luxury facial with specialized treatments",
    price: 4500,
    duration: 90,
    category: "Facial",
  },
  {
    id: "face-waxing",
    name: "Face Waxing",
    description: "Professional facial hair removal",
    price: 800,
    duration: 20,
    category: "Facial",
  },
];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((service) => service.id === id);
}

export function getServicesByCategory(category: string): Service[] {
  return SERVICES.filter((service) => service.category === category);
}

export function getServicePrice(id: string): number {
  return getServiceById(id)?.price || 0;
}

export function getServiceDuration(id: string): number {
  return getServiceById(id)?.duration || 0;
}

export function getBookingAmount(service: Service): number {
  return service.isHaircut ? 1500 : service.price;
} 

export const SERVICE_CATEGORIES = [
  "Hair",
  "Hands",
  "Feet",
  "Facial",
] as const;


