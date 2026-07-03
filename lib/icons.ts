import {
  Apple,
  Armchair,
  Baby,
  Banknote,
  Beer,
  BookOpen,
  Briefcase,
  Brush,
  Bus,
  Cake,
  Candy,
  Car,
  Carrot,
  Cherry,
  Circle,
  Coffee,
  Cookie,
  CreditCard,
  Cross,
  Droplets,
  Egg,
  Fish,
  Flame,
  Gift,
  GlassWater,
  GraduationCap,
  Hamburger,
  Heart,
  Home,
  IceCreamBowl,
  LeafyGreen,
  Lightbulb,
  PawPrint,
  Pill,
  Pizza,
  Plane,
  Popcorn,
  Receipt,
  Sandwich,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Soup,
  Star,
  Stethoscope,
  Train,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wine,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const DEFAULT_CATEGORY_ICON = 'circle' as const;

const categoryIconGroups = [
  {
    group: 'General',
    items: [
      { value: 'circle', label: 'Circle', Icon: Circle },
      { value: 'star', label: 'Star', Icon: Star },
      { value: 'heart', label: 'Heart', Icon: Heart },
      { value: 'gift', label: 'Gift', Icon: Gift },
      { value: 'home', label: 'Home', Icon: Home },
      { value: 'armchair', label: 'Furniture', Icon: Armchair },
      { value: 'paw-print', label: 'Pet', Icon: PawPrint },
      { value: 'baby', label: 'Baby', Icon: Baby },
    ],
  },
  {
    group: 'Transport',
    items: [
      { value: 'car', label: 'Car', Icon: Car },
      { value: 'bus', label: 'Bus', Icon: Bus },
      { value: 'train', label: 'Train', Icon: Train },
      { value: 'plane', label: 'Travel', Icon: Plane },
    ],
  },
  {
    group: 'Finance',
    items: [
      { value: 'wallet', label: 'Wallet', Icon: Wallet },
      { value: 'banknote', label: 'Cash', Icon: Banknote },
      { value: 'receipt', label: 'Receipt', Icon: Receipt },
      { value: 'credit-card', label: 'Credit Card', Icon: CreditCard },
      { value: 'briefcase', label: 'Briefcase', Icon: Briefcase },
    ],
  },
  {
    group: 'Shopping',
    items: [
      { value: 'shopping-cart', label: 'Shopping Cart', Icon: ShoppingCart },
      { value: 'shopping-bag', label: 'Shopping Bag', Icon: ShoppingBag },
      { value: 'shirt', label: 'Clothing', Icon: Shirt },
    ],
  },
  {
    group: 'Services',
    items: [
      { value: 'smartphone', label: 'Mobile Phone', Icon: Smartphone },
      { value: 'wifi', label: 'Internet', Icon: Wifi },
      { value: 'tv', label: 'TV', Icon: Tv },
      { value: 'lightbulb', label: 'Electricity', Icon: Lightbulb },
      { value: 'droplets', label: 'Water', Icon: Droplets },
      { value: 'flame', label: 'Gas / Heating', Icon: Flame },
      { value: 'scissors', label: 'Hairdresser', Icon: Scissors },
      { value: 'brush', label: 'Beauty', Icon: Brush },
      { value: 'stethoscope', label: 'Medicine', Icon: Stethoscope },
      { value: 'cross', label: 'Healthcare', Icon: Cross },
      { value: 'pill', label: 'Pharmacy', Icon: Pill },
      { value: 'zap', label: 'Zap', Icon: Zap },
    ],
  },
  {
    group: 'Education',
    items: [
      { value: 'book-open', label: 'Education', Icon: BookOpen },
      { value: 'graduation-cap', label: 'School', Icon: GraduationCap },
    ],
  },
  {
    group: 'Food',
    items: [
      { value: 'apple', label: 'Food', Icon: Apple },
      { value: 'egg', label: 'Dairy / Eggs', Icon: Egg },
      { value: 'carrot', label: 'Vegetables', Icon: Carrot },
      { value: 'leafy-green', label: 'Groceries', Icon: LeafyGreen },
      { value: 'cherry', label: 'Berries', Icon: Cherry },
      { value: 'fish', label: 'Fish', Icon: Fish },
      { value: 'cookie', label: 'Bakery', Icon: Cookie },
      { value: 'cake', label: 'Sweets', Icon: Cake },
      { value: 'candy', label: 'Candy', Icon: Candy },
      { value: 'ice-cream-bowl', label: 'Ice Cream', Icon: IceCreamBowl },
      { value: 'coffee', label: 'Coffee', Icon: Coffee },
      { value: 'wine', label: 'Wine', Icon: Wine },
      { value: 'beer', label: 'Beer', Icon: Beer },
      { value: 'glass-water', label: 'Drinks', Icon: GlassWater },
      { value: 'hamburger', label: 'Fast Food', Icon: Hamburger },
      { value: 'pizza', label: 'Pizza', Icon: Pizza },
      { value: 'sandwich', label: 'Sandwich', Icon: Sandwich },
      { value: 'soup', label: 'Soup', Icon: Soup },
      { value: 'popcorn', label: 'Snacks', Icon: Popcorn },
      { value: 'utensils-crossed', label: 'Restaurant', Icon: UtensilsCrossed },
    ],
  },
] as const;

const sortedCategoryIconGroups = categoryIconGroups.map((group) => ({
  group: group.group,
  items: [...group.items].sort((a, b) => a.label.localeCompare(b.label)),
}));

export const CATEGORY_ICON_GROUPS = sortedCategoryIconGroups;

export const CATEGORY_ICONS = sortedCategoryIconGroups.flatMap((group) => group.items);

export type TCategoryIconValue = (typeof categoryIconGroups)[number]['items'][number]['value'];

export function getCategoryIcon(value?: string | null): LucideIcon {
  const found = CATEGORY_ICONS.find((item) => item.value === value);
  return found?.Icon ?? Circle;
}
