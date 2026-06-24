export type Product = 'Rose Quartz Bracelet' | 'Pyrite Anklet';
export type AgreementStatus = 'Pending' | 'Sent' | 'Accepted';
export type VideoStatus = 'Pending' | 'Sent' | 'Approved';
export type PaymentStatus = 'Pending' | 'Done';

export interface Influencer {
  id: string;
  serial_no?: number;
  full_name: string;
  phone: string;
  email: string;
  instagram_handle: string;
  followers: number;
  address: string;
  product_assigned: Product | null;
  payment_amount: number;
  agreement_status: AgreementStatus;
  agreement_token: string | null;
  agreement_sent_at: string | null;
  agreement_signed_at: string | null;
  video_status: VideoStatus;
  payment_status: PaymentStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInfluencerInput {
  full_name: string;
  phone: string;
  email: string;
  instagram_handle: string;
  followers: number;
  address: string;
  product_assigned: Product;
  payment_amount: number;
  remarks?: string;
}
