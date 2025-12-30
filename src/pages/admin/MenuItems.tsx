import { useState, useEffect } from "react";
import { UtensilsCrossed, Search, Check, X } from "lucide-react";
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

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
}

const AdminMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <AdminLayout title="Menu Items" description="Kelola menu warung">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {menuItems.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Menu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {menuItems.filter((m) => m.is_available).length}
            </div>
            <p className="text-sm text-muted-foreground">Tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {menuItems.filter((m) => !m.is_available).length}
            </div>
            <p className="text-sm text-muted-foreground">Tidak Tersedia</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {categories.length}
            </div>
            <p className="text-sm text-muted-foreground">Kategori</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari menu atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Daftar Menu ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Tidak ada menu yang ditemukan"
                  : "Belum ada menu"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Menu</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatPrice(Number(item.price))}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {item.description || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.is_available ? (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 gap-1">
                            <Check className="h-3 w-3" />
                            Tersedia
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <X className="h-3 w-3" />
                            Habis
                          </Badge>
                        )}
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

export default AdminMenuItems;
