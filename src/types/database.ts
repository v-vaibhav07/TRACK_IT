export type Difficulty = "Easy" | "Medium" | "Hard";

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  task_date: string; // YYYY-MM-DD
  title: string;
  description: string | null;
  category: string | null;
  difficulty: Difficulty | null;
  completed: boolean;
  completed_at: string | null;
  position: number;
  recurring_task_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RecurringTask = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  difficulty: Difficulty | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DailyNote = {
  id: string;
  user_id: string;
  note_date: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type DailyActivity = {
  id: string;
  user_id: string;
  activity_date: string;
  tasks_total: number;
  tasks_completed: number;
  completion_rate: number;
  had_activity: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_tasks: {
        Row: DailyTask;
        Insert: {
          id?: string;
          user_id: string;
          task_date: string;
          title: string;
          description?: string | null;
          category?: string | null;
          difficulty?: Difficulty | null;
          completed?: boolean;
          completed_at?: string | null;
          position?: number;
          recurring_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_date?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          difficulty?: Difficulty | null;
          completed?: boolean;
          completed_at?: string | null;
          position?: number;
          recurring_task_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recurring_tasks: {
        Row: RecurringTask;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          difficulty?: Difficulty | null;
          start_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          difficulty?: Difficulty | null;
          start_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_notes: {
        Row: DailyNote;
        Insert: {
          id?: string;
          user_id: string;
          note_date: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          note_date?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_activity: {
        Row: DailyActivity;
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          tasks_total?: number;
          tasks_completed?: number;
          completion_rate?: number;
          had_activity?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_date?: string;
          tasks_total?: number;
          tasks_completed?: number;
          completion_rate?: number;
          had_activity?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      recalculate_daily_activity: {
        Args: { p_date: string };
        Returns: DailyActivity;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
