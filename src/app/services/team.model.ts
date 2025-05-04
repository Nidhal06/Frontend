export interface TeamMember {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    role?: string;
  }
  
  export interface Team {
    id: number;
    name: string;
    companyId: number;
    members: TeamMember[];
  }