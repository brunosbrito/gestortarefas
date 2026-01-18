// Supplier Types
export interface Supplier {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  categories: string[]; // Types of products/services they provide
  rating: number; // 1-5 stars
  isActive: boolean;
  isApproved: boolean;
  paymentTerms: string;
  deliveryTerms: string;
  certifications: Array<{
    name: string;
    number: string;
    validUntil: string;
    fileUrl?: string;
  }>;
  performanceHistory: {
    totalOrders: number;
    onTimeDelivery: number; // percentage
    qualityScore: number; // 1-5
    averageResponseTime: number; // hours
    priceCompetitiveness: number; // percentage vs average
  };
  contacts: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
