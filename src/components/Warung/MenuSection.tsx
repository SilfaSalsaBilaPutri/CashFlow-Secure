import { menuItems } from "@/data/menuItems";
import { MenuItem, OrderItem } from "@/types/transaction";
import { MenuItemCard } from "./MenuItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, Coffee, Plus } from "lucide-react";

interface MenuSectionProps {
  orderItems: OrderItem[];
  onAddItem: (item: MenuItem) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export function MenuSection({
  orderItems,
  onAddItem,
  onRemoveItem,
}: MenuSectionProps) {
  const getQuantity = (menuItemId: string) => {
    const orderItem = orderItems.find(
      (item) => item.menuItem.id === menuItemId
    );
    return orderItem?.quantity || 0;
  };

  const categories = [
    { id: "makanan", label: "Makanan", icon: UtensilsCrossed },
    { id: "minuman", label: "Minuman", icon: Coffee },
    { id: "tambahan", label: "Tambahan", icon: Plus },
  ] as const;

  return (
    <Tabs defaultValue="makanan" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="flex items-center gap-2"
          >
            <cat.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{cat.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id} className="mt-0">
          <div className="grid gap-3">
            {menuItems
              .filter((item) => item.category === cat.id)
              .map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  quantity={getQuantity(item.id)}
                  onAdd={() => onAddItem(item)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
