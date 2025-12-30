import { useState, useEffect, useMemo } from "react";
import { Receipt, Search, Trash2, Banknote, CreditCard } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionRow {
  id: string;
  customer_name: string | null;
  payment_method: string;
  items: unknown;
  total: number;
  created_at: string;
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setTransactions((prev) => prev.filter((t) => t.id !== id));
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
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.customer_name?.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const getItemsCount = (items: unknown): number => {
    if (Array.isArray(items)) {
      return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    return 0;
  };

  return (
    <AdminLayout title="Transaksi" description="Kelola data transaksi">
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID transaksi atau nama customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Daftar Transaksi ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tidak ada transaksi yang ditemukan"
                  : "Belum ada transaksi"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id.slice(-8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.customer_name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.payment_method === "tunai"
                              ? "outline"
                              : "default"
                          }
                          className="gap-1"
                        >
                          {transaction.payment_method === "tunai" ? (
                            <Banknote className="h-3 w-3" />
                          ) : (
                            <CreditCard className="h-3 w-3" />
                          )}
                          {transaction.payment_method === "tunai"
                            ? "Tunai"
                            : "Transfer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {getItemsCount(transaction.items)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatPrice(Number(transaction.total))}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(transaction.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus Transaksi?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Transaksi ini akan dihapus permanen. Tindakan
                                ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transaction.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default AdminTransactions;
