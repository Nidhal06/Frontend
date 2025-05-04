// Types d'entités pour l'application

// Rôles utilisateur
export type Role = 'ADMIN' | 'COWORKER' | 'ENTREPRISE' | 'RECEPTIONNISTE' | 'COMPTABLE';

// Utilisateur
export interface User {
  id: number;
  fullName: string;
  email: string;
  photo?: string;
  role: Role;
  companyName?: string;
  phone?: string;
  address?: string;
  teamId?: number;
  subscription?: Subscription;
  createdAt?: string;
  updatedAt?: string;
}

// Espace de coworking
export interface Space {
  id: number;
  title: string;
  description: string;
  price: number;
  capacity: number;
  image: string;
  amenities: string[];
  available: boolean;
  type: 'STANDARD' | 'MEETING_ROOM';
  meetingRoomDetails?: {
    hasProjector: boolean;
    maxParticipants: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Réservation
export interface Reservation {
  id: number;
  userId: number;
  spaceId: number;
  spaceName?: string;
  userName?: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  numberOfPeople: number;
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Période d'indisponibilité
export interface BlackoutPeriod {
  id: number;
  spaceId: number;
  spaceName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt?: string;
  updatedAt?: string;
}

// Facture
export interface Invoice {
  id: number;
  userId: number;
  userName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  date: string;
  amount: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Élément de facture
export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  total?: number;
}

// Paiement
export interface Payment {
  id: number;
  userId: number;
  userName?: string;
  invoiceId: number;
  invoiceNumber?: string;
  amount: number;
  paymentDate: string;
  date: string;
  method: string;
  reference?: string;
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'SUCCESS';
  createdAt?: string;
  updatedAt?: string;
}

// Événement
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  spaceId: number;
  spaceName: string;
  maxAttendees: number;
  currentAttendees: number;
  maxParticipants: number;
  currentParticipants: number;
  participants?: number[];
  isPublic: boolean;
  image?: string;
  organizer?: string;
  status?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Participant à un événement
export interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED';
  registrationDate: string;
}

// Équipe (pour les entreprises)
export interface Team {
  id: number;
  name: string;
  companyId?: number;
  managerId?: number;
  managerName?: string;
  description?: string;
  members: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

// Membre d'équipe
export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  userName: string;
  fullName?: string;
  email?: string;
  photo?: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

// Abonnement
export interface Subscription {
  id: number;
  userId?: number;
  userName?: string;
  planId?: number;
  planName?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
  autoRenew?: boolean;
  price: number;
  duration: number;
  type: 'INDIVIDUAL' | 'TEAM';
  maxMembers?: number;
  features: string[];
  paymentMethod?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Plan d'abonnement
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Avis sur un espace
export interface Review {
  id: number;
  userId: number;
  userName: string;
  spaceId: number;
  spaceName: string;
  rating: number; // 1-5
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date?: string;
  approved?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Message de contact
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  createdAt: string;
  updatedAt?: string;
}

// Notification
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// Paramètres système
export interface SystemSettings {
  id: number;
  settingKey: string;
  settingValue: string;
  category: 'GENERAL' | 'BOOKING' | 'PAYMENT' | 'NOTIFICATION' | 'SECURITY';
  description?: string;
  updatedAt: string;
}

// Journal d'enregistrement
export interface CheckInLog {
  id: number;
  reservationId: number;
  userId: number;
  userName: string;
  spaceName: string;
  checkInTime: string;
  checkOutTime?: string;
}

// Rapport financier
export interface FinancialReport {
  id: number;
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  reservationRevenue: number;
  eventRevenue: number;
  expenses: number;
  profit: number;
  occupancyRate: number;
  mostBookedSpace: Space;
}