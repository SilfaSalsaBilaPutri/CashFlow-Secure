// src/types/transaction.ts

// MenuItem tipe untuk mendeskripsikan menu item yang ada
export interface MenuItem {
  id: string; // ID unik untuk menu item
  name: string; // Nama menu item
  price: number; // Harga menu item
  category: "makanan" | "minuman" | "tambahan"; // Kategori menu item (makanan, minuman, tambahan)
}

// OrderItem tipe untuk mendeskripsikan item yang dipesan oleh pelanggan
export interface OrderItem {
  menuItem: MenuItem; // Item menu yang dipesan
  quantity: number; // Jumlah item yang dipesan
}

// Transaction tipe untuk mendeskripsikan transaksi yang terjadi
export interface Transaction {
  id: string; // ID transaksi
  items: OrderItem[]; // Daftar item yang dipesan dalam transaksi (array dari OrderItem)
  customerName?: string; // Nama pelanggan (opsional)
  paymentMethod: "tunai" | "transfer"; // Metode pembayaran
  total: number; // Total pembayaran untuk transaksi
  createdAt: Date; // Tanggal dan waktu transaksi
}
