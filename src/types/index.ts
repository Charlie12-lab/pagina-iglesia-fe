// ─── Churches ────────────────────────────────────────────────────────────────
export interface Church {
  id: number;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  denomination?: string;
  status: string;       // "Active" | "Pending" | "Inactive"
  pastorName?: string;
  pastorEmail?: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────
export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  imageUrl?: string;
  allowsRegistration: boolean;
  maxAttendees?: number;
  currentAttendees: number;
  isPublished: boolean;
  churchId: number;
  churchName: string;
  churchLogoUrl?: string;
  eventType?: string;   // Vigilia|Conferencia|Campamento|Campaña|Aniversario|Otros
  modality?: string;    // Presencial|Online|Híbrido
  price?: number;       // null = gratuito
}

export interface EventRegistrationRequest {
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  church?: string;  // Iglesia de procedencia
}

export interface GroupMember {
  fullName: string;
  email?: string;
  phone?: string;
}

export interface GroupRegistrationRequest {
  responsible: string;
  email: string;
  phone?: string;
  church?: string;
  members: GroupMember[];
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  churchId: number;
  churchName: string;
  coverImageUrl?: string;
  imageUrls: string[];
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  category?: string;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  excerpt?: string;
  author: string;
  churchId: number;
  churchName: string;
  coverImageUrl?: string;
  tags: string[];
  publishedAt?: string;
  category?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  churchId?: number;
  churchName?: string;
}

export interface AuthUser {
  token: string;
  username: string;
  role: 'SuperAdmin' | 'ChurchAdmin';
  churchId?: number;
  churchName?: string;
}
