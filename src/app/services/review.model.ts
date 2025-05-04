export interface ReviewDto {
    spaceId: number;
    rating: number;
    comment: string;
  }
  
  export interface Review {
    id: number;
    user: {
      id: number;
      name: string;
      avatar?: string;
    };
    spaceId: number;
    rating: number;
    comment: string;
    date: string;
    isApproved: boolean;
  }