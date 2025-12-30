import { Link } from "react-router-dom";
import { UtensilsCrossed, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="gradient-warm shadow-warm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
              <UtensilsCrossed className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                Warung Nasi Barokah
              </h1>
              <p className="text-sm text-primary-foreground/80">
                Sistem Pencatatan Transaksi
              </p>
            </div>
          </div>
          <Link to="/admin">
            <Button variant="secondary" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
