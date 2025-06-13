// src/app/_models/user.model.ts
export interface User {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  enabled: boolean;
  profileImagePath: string;
  type: 'ADMIN' | 'COWORKER' | 'RECEPTIONISTE';
}

export interface UserDTO {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  enabled: boolean;
  profileImagePath: string;
  type: string;
  createdAt?: string;
}

// src/app/_models/auth.model.ts
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  userId?: number; 
}

export interface SignupRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

// src/app/_models/reservation.model.ts
export interface ReservationDTO {
  id?: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  espaceId: number;
  espaceName: string;
  espaceType: 'OUVERT' | 'PRIVE';
  paiementMontant: number;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_ATTENTE' | 'VALIDEE' | 'ANNULEE';
  paiementValide: boolean;
}

// src/app/_models/profile.model.ts
export interface ProfileUpdateDTO {
  firstName: string;
  lastName: string;
  phone: string;
  profileImagePath: string;
}

export interface ProfilDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImagePath: string;
  type: string;
  roles : string[];
}

// src/app/_models/paiement.model.ts
export interface PaiementDTO {
  id?: number;
  type: 'RESERVATION' | 'EVENEMENT' | 'ABONNEMENT';
  montant: number;
  date: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'ANNULE';
  reservationId?: number;
  abonnementId?: number;
  evenementId?: number;
  userId?: number;
}

// src/app/_models/indisponibilite.model.ts
export interface IndisponibiliteDTO {
  id?: number;
  espaceId: number;
  espaceName: string;
  dateDebut: string;
  dateFin: string;
  raison: string;
}

// src/app/_models/facture.model.ts
export interface FactureDTO {
  id?: number;
  paiementId: number;
  pdfUrl: string;
  dateEnvoi: string;
  emailDestinataire: string;
}


// src/app/_models/evenement.model.ts
export interface EvenementDTO {
  id?: number;
  titre: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  maxParticipants: number;
  isActive: Boolean;
  participants: ParticipantDTO[];
  participantsIds?: number[]; 
  espaceId: number;
  espaceName: string;
  isRegistered?: boolean;
  isFull?: boolean;
  availableSpots?: number;
  tags?: string[];
}

export interface ParticipantDTO {
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  registrationDate : Date;
}

// src/app/_models/espace.model.ts
export interface EspaceDTO {
  id?: number;
  name: string;
  description: string;
  capacity: number;
  photoPrincipal: string;
  gallery: string[];
  isActive: boolean;
  type: 'OUVERT' | 'PRIVE';
  prixParJour: number;
  amenities: string[];
}

export interface EspacePriveDTO extends EspaceDTO {
  prixParJour: number;
  amenities: string[];
}

export interface EspaceOuvertDTO extends EspaceDTO {}

// src/app/_models/avis.model.ts
export interface AvisDTO {
  id?: number;
  userId: number;
  userUsername: string;
  userFirstName: string;
  userLastName: string;
  espaceId: number;
  espaceName: string;
  espaceType: string;
  rating: number;
  commentaire: string;
  date: Date;
}

// src/app/_models/abonnement.model.ts
export interface AbonnementDTO {
  id?: number;
  type: 'MENSUEL' | 'ANNUEL';
  prix: number;
  dateDebut: string;
  dateFin: string;
  userId: number;
  userEmail: string;
  espaceOuvertId: number;
  espaceOuvertName: string;
}