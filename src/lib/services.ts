// lib/services.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
}

export const SERVICES: Service[] = [
  {
    id: "classic-haircut",
    name: "Classic Haircut",
    description: "Precision cut with attention to detail, includes hot towel and styling",
    price: 500,
    duration: 60,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    description: "Shape and style your beard with precision tools and techniques",
    price: 400,
    duration: 60,
  },
  {
    id: "hot-towel-shave",
    name: "Hot Towel Shave",
    description: "Traditional straight razor shave with hot towel treatment",
    price: 500,
    duration: 60,
  },
  {
    id: "haircut-beard-trim",
    name: "Haircut & Beard Trim",
    description: "Complete package for hair and beard styling",
    price: 500,
    duration: 60,
  },
  {
    id: "hair-styling",
    name: "Hair Styling",
    description: "Professional styling with premium products",
    price: 500,
    duration: 60,
  },
  {
    id: "kids-haircut",
    name: "Kids Haircut",
    description: "Gentle haircuts for young gentlemen under 12",
    price: 300,
    duration: 30,
  },
];

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find(service => service.id === id);
}

export function getServicePrice(id: string): number {
  return getServiceById(id)?.price || 0;
}

export function getServiceDuration(id: string): number {
  return getServiceById(id)?.duration || 0;
}