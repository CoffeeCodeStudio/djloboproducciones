export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          email: string
          event_date: string
          event_type: string
          id: string
          location: string | null
          message: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_date: string
          event_type: string
          id?: string
          location?: string | null
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_date?: string
          event_type?: string
          id?: string
          location?: string | null
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_bans: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          nickname: string | null
          reason: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          nickname?: string | null
          reason?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          nickname?: string | null
          reason?: string | null
          session_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          nickname: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          nickname: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          nickname?: string
          session_id?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          description_en: string
          description_es: string
          description_sv: string
          icon: string
          id: string
          sort_order: number
          title_en: string
          title_es: string
          title_sv: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_es?: string
          description_sv?: string
          icon?: string
          id?: string
          sort_order?: number
          title_en: string
          title_es: string
          title_sv: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_es?: string
          description_sv?: string
          icon?: string
          id?: string
          sort_order?: number
          title_en?: string
          title_es?: string
          title_sv?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          media_type: string
          sort_order: number
          updated_at: string
          video_url: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          media_type?: string
          sort_order?: number
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          media_type?: string
          sort_order?: number
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      mixcloud_mixes: {
        Row: {
          cover_art_url: string | null
          created_at: string
          external_id: string | null
          hidden: boolean
          id: string
          mixcloud_url: string
          pinned: boolean
          sort_order: number
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string
          external_id?: string | null
          hidden?: boolean
          id?: string
          mixcloud_url: string
          pinned?: boolean
          sort_order?: number
          source?: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string
          external_id?: string | null
          hidden?: boolean
          id?: string
          mixcloud_url?: string
          pinned?: boolean
          sort_order?: number
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_branding: {
        Row: {
          accent_color: string | null
          background_image_url: string | null
          bio_text: string | null
          created_at: string
          google_calendar_id: string | null
          hero_image_url: string | null
          id: string
          instagram_post_1: string | null
          instagram_post_2: string | null
          instagram_post_3: string | null
          instagram_post_4: string | null
          instagram_post_5: string | null
          instagram_post_6: string | null
          instagram_username: string | null
          live_set_video_1: string | null
          live_set_video_2: string | null
          live_set_video_3: string | null
          live_set_video_4: string | null
          live_set_video_5: string | null
          logo_url: string | null
          og_image_url: string | null
          primary_glow_color: string | null
          profile_image_url: string | null
          secondary_glow_color: string | null
          site_name: string | null
          tagline: string | null
          updated_at: string
          youtube_channel_id: string | null
          youtube_video_id: string | null
        }
        Insert: {
          accent_color?: string | null
          background_image_url?: string | null
          bio_text?: string | null
          created_at?: string
          google_calendar_id?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_post_1?: string | null
          instagram_post_2?: string | null
          instagram_post_3?: string | null
          instagram_post_4?: string | null
          instagram_post_5?: string | null
          instagram_post_6?: string | null
          instagram_username?: string | null
          live_set_video_1?: string | null
          live_set_video_2?: string | null
          live_set_video_3?: string | null
          live_set_video_4?: string | null
          live_set_video_5?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          primary_glow_color?: string | null
          profile_image_url?: string | null
          secondary_glow_color?: string | null
          site_name?: string | null
          tagline?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          accent_color?: string | null
          background_image_url?: string | null
          bio_text?: string | null
          created_at?: string
          google_calendar_id?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_post_1?: string | null
          instagram_post_2?: string | null
          instagram_post_3?: string | null
          instagram_post_4?: string | null
          instagram_post_5?: string | null
          instagram_post_6?: string | null
          instagram_username?: string | null
          live_set_video_1?: string | null
          live_set_video_2?: string | null
          live_set_video_3?: string | null
          live_set_video_4?: string | null
          live_set_video_5?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          primary_glow_color?: string | null
          profile_image_url?: string | null
          secondary_glow_color?: string | null
          site_name?: string | null
          tagline?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      site_secrets: {
        Row: {
          created_at: string
          id: string
          instagram_access_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_access_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instagram_access_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      soundcloud_mixes: {
        Row: {
          cover_art_url: string | null
          created_at: string
          external_id: string | null
          hidden: boolean
          id: string
          pinned: boolean
          sort_order: number
          soundcloud_url: string
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_art_url?: string | null
          created_at?: string
          external_id?: string | null
          hidden?: boolean
          id?: string
          pinned?: boolean
          sort_order?: number
          soundcloud_url: string
          source?: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_art_url?: string | null
          created_at?: string
          external_id?: string | null
          hidden?: boolean
          id?: string
          pinned?: boolean
          sort_order?: number
          soundcloud_url?: string
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      chat_messages_public: {
        Row: {
          created_at: string | null
          id: string | null
          message: string | null
          nickname: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          nickname?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          message?: string | null
          nickname?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_session_banned: { Args: { p_session_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
