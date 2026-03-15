/**
 * Database Types
 *
 * TypeScript types matching the Supabase PostgreSQL schema.
 * These ensure type safety when querying the database.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          favourite_category: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          favourite_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          favourite_category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          difficulty: string;
          estimated_time: string | null;
          cover_image: string | null;
          materials: MaterialItem[];
          steps: StepItem[];
          tips: string | null;
          cost_estimate: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          difficulty: string;
          estimated_time?: string | null;
          cover_image?: string | null;
          materials?: MaterialItem[];
          steps?: StepItem[];
          tips?: string | null;
          cost_estimate?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string;
          difficulty?: string;
          estimated_time?: string | null;
          cover_image?: string | null;
          materials?: MaterialItem[];
          steps?: StepItem[];
          tips?: string | null;
          cost_estimate?: string | null;
        };
        Relationships: [];
      };
      user_projects: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          status: string;
          current_step: number;
          started_at: string;
          completed_at: string | null;
          rating: number | null;
          review: string | null;
          hours_logged: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          status?: string;
          current_step?: number;
          started_at?: string;
          completed_at?: string | null;
          rating?: number | null;
          review?: string | null;
          hours_logged?: number;
          notes?: string | null;
        };
        Update: {
          status?: string;
          current_step?: number;
          completed_at?: string | null;
          rating?: number | null;
          review?: string | null;
          hours_logged?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      user_photos: {
        Row: {
          id: string;
          user_id: string;
          user_project_id: string;
          photo_url: string;
          category: string;
          caption: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_project_id: string;
          photo_url: string;
          category?: string;
          caption?: string | null;
          uploaded_at?: string;
        };
        Update: {
          photo_url?: string;
          category?: string;
          caption?: string | null;
        };
        Relationships: [];
      };
      shopping_list_items: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          item_name: string;
          quantity: string | null;
          is_checked: boolean;
          is_custom: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          item_name: string;
          quantity?: string | null;
          is_checked?: boolean;
          is_custom?: boolean;
          created_at?: string;
        };
        Update: {
          item_name?: string;
          quantity?: string | null;
          is_checked?: boolean;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          icon: string | null;
          xp_reward: number;
          criteria: AchievementCriteria;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          xp_reward?: number;
          criteria?: AchievementCriteria;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          xp_reward?: number;
          criteria?: AchievementCriteria;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          unlocked_at?: string;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
        };
        Update: {
          total_xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ============================================
// Shared Types used across the app
// ============================================

/** A single material/supply needed for a project */
export interface MaterialItem {
  name: string;
  quantity: string;
  estimated_cost?: number;
}

/** A single step in a project's instructions */
export interface StepItem {
  order: number;
  title: string;
  description: string;
  tip?: string;
}

/** Criteria for unlocking an achievement */
export interface AchievementCriteria {
  type: string;
  count?: number;
  category?: string;
  days?: number;
  [key: string]: unknown;
}

// ============================================
// Convenience type aliases
// ============================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type UserProject = Database['public']['Tables']['user_projects']['Row'];
export type UserPhoto = Database['public']['Tables']['user_photos']['Row'];
export type ShoppingListItem = Database['public']['Tables']['shopping_list_items']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type UserStats = Database['public']['Tables']['user_stats']['Row'];
