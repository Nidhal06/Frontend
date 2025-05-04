export interface PricingPlan {
    id: number;
    name: string;
    type: 'individual' | 'team' | 'daily';
    price: number;
    duration?: number; // en jours
    features: string[];
    discount?: number;
    popular?: boolean;
    maxMembers?: number; 
    autoRenew?: boolean;
    status?: string;
  }