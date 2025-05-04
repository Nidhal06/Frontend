export interface UserProfile {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileImagePath: string;
    type: string;
    roles: string[];
  }