export interface Event {
    id: number;
    title: string;
    description: string;
    startTime: string;  // ISO date string
    endTime: string;    // ISO date string
    spaceId: number;
    maxParticipants: number;
    price: number;
    isActive: boolean;
    participants: { id: number }[];  // If you need participant info
    space?: {              // If you want to include space details
        id: number;
        name: string;
        capacity: number;
        pricePerHour: number;
        pricePerDay: number;
        isActive: boolean;
    };
    // Additional properties
    category?: string;
    formattedDate?: string;
    location?: string;
    tags?: string[];
    isRegistered?: boolean;
    registered?: number;
    startDate?: string; // For compatibility
    endDate?: string; 
  }

  interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    type: string;
  }