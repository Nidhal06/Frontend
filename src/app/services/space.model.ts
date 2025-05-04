// PrivateSpace model
export interface PrivateSpace {
  id: number;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  isActive: boolean;
  photo?: string;
  photoUrl?: string;
  gallery?: string[];
  galleryUrls?: string[];
  amenities?: Amenity[];
}

export interface PrivateSpaceFormData {
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  isActive: boolean;
  amenityIds?: number[];
}

  //OpenSpace model
  
  export interface Amenity {
    id: number;
    name: string;
    description?: string;
  }