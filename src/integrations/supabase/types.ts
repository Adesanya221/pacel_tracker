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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customs_holds: {
        Row: {
          id: string
          tracking_number: string
          enabled: boolean
          fee_amount: number
          fee_currency: string
          reason: string
          hold_date: string
          reference_number: string
          payment_instructions: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_number: string
          enabled?: boolean
          fee_amount?: number
          fee_currency?: string
          reason?: string
          hold_date?: string
          reference_number: string
          payment_instructions?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          enabled?: boolean
          fee_amount?: number
          fee_currency?: string
          reason?: string
          hold_date?: string
          reference_number?: string
          payment_instructions?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivered_done: boolean
          delivered_location: string | null
          destination_address: string
          estimated_delivery_date: string
          id: string
          in_transit_at: string | null
          in_transit_done: boolean
          in_transit_location: string | null
          origin_address: string
          out_for_delivery_at: string | null
          out_for_delivery_done: boolean
          out_for_delivery_location: string | null
          package_description: string | null
          picked_up_at: string | null
          picked_up_done: boolean
          picked_up_location: string | null
          processing_at: string | null
          processing_done: boolean
          processing_location: string | null
          recipient_email: string
          recipient_name: string
          sender_name: string
          shipment_date: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivered_done?: boolean
          delivered_location?: string | null
          destination_address: string
          estimated_delivery_date: string
          id?: string
          in_transit_at?: string | null
          in_transit_done?: boolean
          in_transit_location?: string | null
          origin_address: string
          out_for_delivery_at?: string | null
          out_for_delivery_done?: boolean
          out_for_delivery_location?: string | null
          package_description?: string | null
          picked_up_at?: string | null
          picked_up_done?: boolean
          picked_up_location?: string | null
          processing_at?: string | null
          processing_done?: boolean
          processing_location?: string | null
          recipient_email: string
          recipient_name: string
          sender_name: string
          shipment_date?: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivered_done?: boolean
          delivered_location?: string | null
          destination_address?: string
          estimated_delivery_date?: string
          id?: string
          in_transit_at?: string | null
          in_transit_done?: boolean
          in_transit_location?: string | null
          origin_address?: string
          out_for_delivery_at?: string | null
          out_for_delivery_done?: boolean
          out_for_delivery_location?: string | null
          package_description?: string | null
          picked_up_at?: string | null
          picked_up_done?: boolean
          picked_up_location?: string | null
          processing_at?: string | null
          processing_done?: boolean
          processing_location?: string | null
          recipient_email?: string
          recipient_name?: string
          sender_name?: string
          shipment_date?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
