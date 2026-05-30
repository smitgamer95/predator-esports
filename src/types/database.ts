export type UserRole = 'user' | 'admin';

export type TournamentMode = 'Solo' | 'Duo' | 'Squad';

export type TournamentStatus = 'active' | 'completed' | 'cancelled';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  game_name: string | null;
  uid: string | null;
  avatar_url: string | null;
  role: UserRole;
  password_hash: string | null;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  entry_fee: number;
  mode: TournamentMode;
  prize_1st: number;
  prize_2nd: number;
  prize_3rd: number;
  status: TournamentStatus;
  room_id: string | null;
  room_password: string | null;
  max_slots: number;
  filled_slots: number;
  start_date: string | null;
  start_time: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  thumbnail_url: string | null;
  youtube_link: string | null;
  instagram_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentRegistration {
  id: string;
  user_id: string;
  tournament_id: string;
  username: string | null;
  phone: string | null;
  gamer_id: string | null;
  in_game_name: string | null;
  slot_number: number | null;
  payment_screenshot_url: string | null;
  status: RegistrationStatus;
  eliminated: boolean;
  winner_position: number | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  id: string;
  upi_id: string;
  receiver_name: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  reply: string | null;
  status: string;
  replied_at: string | null;
  created_at: string;
}

export interface TournamentResult {
  id: string;
  tournament_id: string;
  first_place_user_id: string | null;
  second_place_user_id: string | null;
  third_place_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  upi_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  emailjs_public_key: string | null;
  emailjs_service_id: string | null;
  emailjs_template_id: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OTPVerification {
  id: string;
  email: string;
  otp: string;
  expires_at: string;
  created_at: string;
}
