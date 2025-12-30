// src/integrations/types.ts

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          items: any[]; // Tipe untuk `items`, bisa sesuaikan dengan tipe `OrderItem[]`
          total: number;
          payment_method: "tunai" | "transfer";
          customer_name: string | null;
          created_at: string;
        };
        Insert: {
          items: any[]; // Untuk memasukkan data transaksi
          total: number;
          payment_method: "tunai" | "transfer";
          customer_name: string | null;
        };
        Update: {
          total: number;
          payment_method: "tunai" | "transfer";
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          price: number;
          category: "makanan" | "minuman" | "tambahan";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          price: number;
          category: "makanan" | "minuman" | "tambahan";
        };
        Update: {
          price: number;
          category: "makanan" | "minuman" | "tambahan";
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          menu_item_id: string;
          quantity: number;
          price_at_time: number;
          created_at: string;
        };
        Insert: {
          transaction_id: string;
          menu_item_id: string;
          quantity: number;
          price_at_time: number;
        };
        Update: {
          quantity: number;
        };
      };
    };
  };
};
