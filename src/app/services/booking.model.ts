export interface BookingDto {
    spaceId: number;
    startTime: string;
    endTime: string;
    specialRequirements?: string;
    subscriptionId?: number;
  }