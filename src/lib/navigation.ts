export type NavIcon =
  | "dashboard"
  | "wallet"
  | "subscriptions"
  | "packages"
  | "purchases"
  | "settings"
  | "categories"
  | "sales"
  | "users"
  | "settlements";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export const userNavigation: NavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: "dashboard" },
  { label: "Wallet", href: "/user/wallet", icon: "wallet" },
  { label: "Subscriptions", href: "/user/subscriptions", icon: "subscriptions" },
  { label: "Packages", href: "/user/packages", icon: "packages" },
  { label: "Purchases", href: "/user/purchases", icon: "purchases" },
  { label: "Settings", href: "/user/settings", icon: "settings" },
];

export const adminNavigation: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Categories", href: "/admin/categories", icon: "categories" },
  { label: "Packages", href: "/admin/packages", icon: "packages" },
  { label: "Sales", href: "/admin/sales", icon: "sales" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Settlements", href: "/admin/settlements", icon: "settlements" },
];
