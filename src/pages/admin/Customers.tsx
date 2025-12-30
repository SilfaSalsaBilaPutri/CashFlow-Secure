import { useState, useEffect, useMemo } from "react";
import { Users, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

interface CustomerData {
  name: string;
  totalTransactions: number;
  totalSpent: number;
  lastTransaction: Date;
  paymentMethods: string[];
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .not("customer_name", "is", null)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const customerMap = new Map<string, CustomerData>();

        (data || []).forEach((transaction) => {
          const name = transaction.customer_name?.trim();
          if (!name) return;

          const existing = customerMap.get(name);
          if (existing) {
            existing.totalTransactions += 1;
            existing.totalSpent += Number(transaction.total);
            if (new Date(transaction.created_at) > existing.lastTransaction) {
              existing.lastTransaction = new Date(transaction.created_at);
            }
            if (!existing.paymentMethods.includes(transaction.payment_method)) {
              existing.paymentMethods.push(transaction.payment_method);
            }
          } else {
            customerMap.set(name, {
              name: decryptData(transaction.customer_name), // Dekripsi customer_name sebelum disimpan di map
              totalTransactions: 1,
              totalSpent: Number(transaction.total),
              lastTransaction: new Date(transaction.created_at),
              paymentMethods: [transaction.payment_method],
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <AdminLayout title="Data Customer" description="Kelola data pelanggan">
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Customer ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tidak ada customer yang ditemukan"
                  : "Belum ada data customer"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Customer</TableHead>
                    <TableHead className="text-center">
                      Total Transaksi
                    </TableHead>
                    <TableHead className="text-right">Total Belanja</TableHead>
                    <TableHead>Metode Pembayaran</TableHead>
                    <TableHead>Transaksi Terakhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.name}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {customer.totalTransactions}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatPrice(customer.totalSpent)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {customer.paymentMethods.map((method) => (
                            <Badge
                              key={method}
                              variant={
                                method === "tunai" ? "outline" : "default"
                              }
                              className="text-xs"
                            >
                              {method === "tunai" ? "Tunai" : "Transfer"}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(customer.lastTransaction)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminCustomers;
