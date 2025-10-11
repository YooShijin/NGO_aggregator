

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