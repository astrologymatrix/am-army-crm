export type Product = 'Rose Quartz Bracelet' | 'Pyrite Anklet';
export type AgreementStatus = 'Pending' | 'Sent' | 'Accepted';
export type VideoStatus = 'Pending' | 'Sent' | 'Approved';
export type PaymentStatus = 'Not yet Paid' | 'Pending' | 'Paid';

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
  upi_id: string | null;
  bank_details: string | null;
  payment_scanner_url: string | null;
  payment_screenshot_url: string | null;
  video_url: string | null;
  video_posted_at: string | null;
  video_scheduled_date: string | null;
  schedule_notified_at: string | null;
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
