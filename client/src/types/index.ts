export type UserRole = 'cardholder' | 'shopowner' | 'admin' | 'sysadmin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  rationCardNumber?: string;
  shopAssignedTo?: string;
  isActive: boolean;
  aadharVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentCount: number;
  available?: boolean;
}

export interface Booking {
  queueId: string;
  shop: { _id: string; name: string; address: { city?: string } };
  date: string;
  slot: Slot;
  ticketNumber: string;
  status: 'waiting' | 'in_service' | 'completed' | 'no_show' | 'cancelled';
  position: number | null;
}

export interface InventoryItem {
  _id: string;
  shopId: string;
  itemName: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  isLowStock: boolean;
  lastStockUpdate: string;
}

export interface FeedbackData {
  _id: string;
  rating: number;
  textFeedback: string;
  sentiment?: string;
  createdAt: string;
}

export interface DashboardData {
  totalUsers: number;
  totalShops: number;
  todayStats: { totalBookings: number; totalWaiting: number; totalServed: number; avgServiceTime: number };
  lowStockItems: number;
  openFraudAlerts: number;
  roleDistribution: Record<string, number>;
  recentFeedbacks: FeedbackData[];
}
