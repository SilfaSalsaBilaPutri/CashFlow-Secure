import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, OrderItem } from "@/types/transaction";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js"; // Import library crypto-js

// Secret key for encryption and decryption
const secretKey = "your-secret-key"; // Ganti dengan kunci yang lebih aman

// Encryption function
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, secretKey).toString(); // Enkripsi data
};

// Decryption function
const decryptData = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, secretKey); // Dekripsi data
  return bytes.toString(CryptoJS.enc.Utf8); // Mengembalikan hasil dekripsi sebagai string
};

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch transactions from the database
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: Transaction[] = (data || []).map((row) => ({
        id: row.id,
        items: row.items as unknown as OrderItem[],
        total: Number(row.total),
        paymentMethod: row.payment_method as "tunai" | "transfer",
        createdAt: new Date(row.created_at),
        customerName: row.customer_name
          ? decryptData(row.customer_name) // Dekripsi saat mengambil data
          : undefined,
      }));

      setTransactions(mapped);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Gagal memuat transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);

  // Add transaction (with encryption)
  const addTransaction = useCallback(
    async (
      items: OrderItem[],
      paymentMethod: "tunai" | "transfer",
      customerName?: string
    ) => {
      const total = items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );

      try {
        // Encrypt customerName before storing
        const encryptedCustomerName = customerName
          ? encryptData(customerName) // Enkripsi customerName
          : null;

        const insertData = {
          items: JSON.parse(JSON.stringify(items)),
          total,
          payment_method: paymentMethod,
          customer_name: encryptedCustomerName, // Menyimpan data terenkripsi
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        if (!data) throw new Error("No data returned");

        const newTransaction: Transaction = {
          id: data.id,
          items: data.items as unknown as OrderItem[],
          total: Number(data.total),
          paymentMethod: data.payment_method as "tunai" | "transfer",
          createdAt: new Date(data.created_at),
          customerName: data.customer_name
            ? decryptData(data.customer_name) // Dekripsi saat mengambil data
            : undefined,
        };

        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        });

        return newTransaction;
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast({
          title: "Error",
          description: "Gagal menyimpan transaksi",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Delete transaction
  const deleteTransaction = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Transaksi berhasil dihapus",
        });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast({
          title: "Error",
          description: "Gagal menghapus transaksi",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Get today's transactions
  const getTodayTransactions = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter((t) => {
      const transDate = new Date(t.createdAt);
      transDate.setHours(0, 0, 0, 0);
      return transDate.getTime() === today.getTime();
    });
  }, [transactions]);

  // Get today's total transaction amount
  const getTodayTotal = useCallback(() => {
    return getTodayTransactions().reduce((sum, t) => sum + t.total, 0);
  }, [getTodayTransactions]);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    getTodayTransactions,
    getTodayTotal,
  };
}
