

export interface NGO {
  id: number;
  name: string;
  registration_no?: string;
  darpan_id?: string;
  mission?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  verified: boolean;
  blacklisted: boolean;
  transparency_score: number;
  categories: Category[];
  office_bearers?: any[];
  blacklist_info?: any;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}


export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface VolunteerPost {
  id: number;
  ngo_id: number;
  ngo_name?: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  deadline?: string;
  active: boolean;
  created_at: string;
  applications_count?: number;
  bookmarks_count?: number;
}

export interface Event {
  id: number;
  ngo_id: number;
  ngo_name?: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  registration_link?: string;
  created_at: string;
}