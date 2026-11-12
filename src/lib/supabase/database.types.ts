/**
 * Tipos generados desde el proyecto Supabase real (ref cxcphxxgwymvegjpnjrj) el 12/11/2026.
 * Regenerar tras cada migración:  npx supabase gen types typescript --project-id cxcphxxgwymvegjpnjrj
 * (se han omitido los helpers genéricos que no usamos; se añade Tables<> simplificado al final)
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      brand_translations: {
        Row: { brand_id: string; description: string | null; locale: string; logo_alt: string | null; name: string; seo_description: string | null; seo_title: string | null; updated_at: string };
        Insert: { brand_id: string; description?: string | null; locale: string; logo_alt?: string | null; name: string; seo_description?: string | null; seo_title?: string | null; updated_at?: string };
        Update: { brand_id?: string; description?: string | null; locale?: string; logo_alt?: string | null; name?: string; seo_description?: string | null; seo_title?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "brand_translations_brand_id_fkey"; columns: ["brand_id"]; isOneToOne: false; referencedRelation: "brands"; referencedColumns: ["id"] }];
      };
      brands: {
        Row: { cover_path: string | null; created_at: string; id: string; is_featured: boolean; is_published: boolean; logo_path: string | null; slug: string; sort_order: number; updated_at: string };
        Insert: { cover_path?: string | null; created_at?: string; id?: string; is_featured?: boolean; is_published?: boolean; logo_path?: string | null; slug: string; sort_order?: number; updated_at?: string };
        Update: { cover_path?: string | null; created_at?: string; id?: string; is_featured?: boolean; is_published?: boolean; logo_path?: string | null; slug?: string; sort_order?: number; updated_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { created_at: string; icon: string; id: string; is_published: boolean; slug: string; sort_order: number; updated_at: string };
        Insert: { created_at?: string; icon?: string; id?: string; is_published?: boolean; slug: string; sort_order?: number; updated_at?: string };
        Update: { created_at?: string; icon?: string; id?: string; is_published?: boolean; slug?: string; sort_order?: number; updated_at?: string };
        Relationships: [];
      };
      category_translations: {
        Row: { category_id: string; description: string | null; locale: string; name: string; seo_description: string | null; seo_title: string | null; updated_at: string };
        Insert: { category_id: string; description?: string | null; locale: string; name: string; seo_description?: string | null; seo_title?: string | null; updated_at?: string };
        Update: { category_id?: string; description?: string | null; locale?: string; name?: string; seo_description?: string | null; seo_title?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "category_translations_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }];
      };
      page_content: {
        Row: { content: Json; key: string; locale: string; updated_at: string };
        Insert: { content?: Json; key: string; locale: string; updated_at?: string };
        Update: { content?: Json; key?: string; locale?: string; updated_at?: string };
        Relationships: [];
      };
      product_images: {
        Row: { alt: Json; created_at: string; height: number | null; id: string; is_primary: boolean; product_id: string; sort_order: number; storage_path: string; width: number | null };
        Insert: { alt?: Json; created_at?: string; height?: number | null; id?: string; is_primary?: boolean; product_id: string; sort_order?: number; storage_path: string; width?: number | null };
        Update: { alt?: Json; created_at?: string; height?: number | null; id?: string; is_primary?: boolean; product_id?: string; sort_order?: number; storage_path?: string; width?: number | null };
        Relationships: [{ foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }];
      };
      product_translations: {
        Row: { description: string | null; features: Json; locale: string; name: string; product_id: string; seo_description: string | null; seo_title: string | null; short_description: string | null; updated_at: string };
        Insert: { description?: string | null; features?: Json; locale: string; name: string; product_id: string; seo_description?: string | null; seo_title?: string | null; short_description?: string | null; updated_at?: string };
        Update: { description?: string | null; features?: Json; locale?: string; name?: string; product_id?: string; seo_description?: string | null; seo_title?: string | null; short_description?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "product_translations_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }];
      };
      products: {
        Row: { brand_id: string | null; category_id: string | null; created_at: string; id: string; is_featured: boolean; published_at: string | null; slug: string; sort_order: number; status: Database["public"]["Enums"]["publish_status"]; updated_at: string };
        Insert: { brand_id?: string | null; category_id?: string | null; created_at?: string; id?: string; is_featured?: boolean; published_at?: string | null; slug: string; sort_order?: number; status?: Database["public"]["Enums"]["publish_status"]; updated_at?: string };
        Update: { brand_id?: string | null; category_id?: string | null; created_at?: string; id?: string; is_featured?: boolean; published_at?: string | null; slug?: string; sort_order?: number; status?: Database["public"]["Enums"]["publish_status"]; updated_at?: string };
        Relationships: [
          { foreignKeyName: "products_brand_id_fkey"; columns: ["brand_id"]; isOneToOne: false; referencedRelation: "brands"; referencedColumns: ["id"] },
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
        ];
      };
      profiles: {
        Row: { created_at: string; full_name: string | null; id: string; role: string; updated_at: string };
        Insert: { created_at?: string; full_name?: string | null; id: string; role?: string; updated_at?: string };
        Update: { created_at?: string; full_name?: string | null; id?: string; role?: string; updated_at?: string };
        Relationships: [];
      };
      seo_metadata: {
        Row: { description: string | null; locale: string; noindex: boolean; og_image_path: string | null; page_key: string; title: string | null; updated_at: string };
        Insert: { description?: string | null; locale: string; noindex?: boolean; og_image_path?: string | null; page_key: string; title?: string | null; updated_at?: string };
        Update: { description?: string | null; locale?: string; noindex?: boolean; og_image_path?: string | null; page_key?: string; title?: string | null; updated_at?: string };
        Relationships: [];
      };
      site_settings: {
        Row: { address_city: string; address_country: string; address_postal_code: string | null; address_street: string | null; business_name: string; email: string | null; enabled_locales: string[]; google_business_url: string | null; google_maps_url: string | null; id: number; index_drafts: boolean; latitude: number | null; logo_dark_path: string | null; logo_light_path: string | null; longitude: number | null; og_image_path: string | null; opening_hours: Json; phone: string | null; social_links: Json; special_hours: Json; updated_at: string; whatsapp: string | null };
        Insert: { address_city?: string; address_country?: string; address_postal_code?: string | null; address_street?: string | null; business_name?: string; email?: string | null; enabled_locales?: string[]; google_business_url?: string | null; google_maps_url?: string | null; id?: number; index_drafts?: boolean; latitude?: number | null; logo_dark_path?: string | null; logo_light_path?: string | null; longitude?: number | null; og_image_path?: string | null; opening_hours?: Json; phone?: string | null; social_links?: Json; special_hours?: Json; updated_at?: string; whatsapp?: string | null };
        Update: { address_city?: string; address_country?: string; address_postal_code?: string | null; address_street?: string | null; business_name?: string; email?: string | null; enabled_locales?: string[]; google_business_url?: string | null; google_maps_url?: string | null; id?: number; index_drafts?: boolean; latitude?: number | null; logo_dark_path?: string | null; logo_light_path?: string | null; longitude?: number | null; og_image_path?: string | null; opening_hours?: Json; phone?: string | null; social_links?: Json; special_hours?: Json; updated_at?: string; whatsapp?: string | null };
        Relationships: [];
      };
      slug_redirects: {
        Row: { created_at: string; entity_type: string; from_slug: string; id: string; to_slug: string };
        Insert: { created_at?: string; entity_type: string; from_slug: string; id?: string; to_slug: string };
        Update: { created_at?: string; entity_type?: string; from_slug?: string; id?: string; to_slug?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      contact_rate_allow: { Args: { p_hash: string }; Returns: boolean };
    };
    Enums: { publish_status: "draft" | "published" };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type PublishStatus = Database["public"]["Enums"]["publish_status"];
