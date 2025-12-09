export type CompetitionStatus = 'PLANNED' | 'IN_PROGRESS' | 'FINISHED';

export interface Competition {
  id: string;
  owner_id: string;
  name: string;
  date: string; // ISO Date
  pegs_count: number;
  status: CompetitionStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  competition_id: string;
  name: string;
  created_at: string;
}

export interface Participant {
  id: string;
  competition_id: string;
  category_id: string | null;
  first_name: string;
  last_name: string;
  peg_number: number | null;
  is_disqualified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Catch {
  id: string;
  competition_id: string;
  participant_id: string;
  weight: number;
  species: string | null;
  is_big_fish: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      competitions: {
        Row: Competition;
        Insert: Omit<Competition, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Competition, 'id' | 'created_at' | 'updated_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      participants: {
        Row: Participant;
        Insert: Omit<Participant, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Participant, 'id' | 'created_at' | 'updated_at'>>;
      };
      catches: {
        Row: Catch;
        Insert: Omit<Catch, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Catch, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
