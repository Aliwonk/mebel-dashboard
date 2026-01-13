import type { AvatarProps } from "@nuxt/ui";

export type UserStatus = "subscribed" | "unsubscribed" | "bounced";
export type SaleStatus = "paid" | "failed" | "refunded";

export interface Admin {
  id: number;
  surname: string;
  name: string;
  login: string;
}

export interface ProductDimension {
  id?: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  depth: number;
}

export interface ProductImage {
  id: number;
  url: string;
  size: number;
  color_id: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  quantity: number;
  description: string;
  telegram_notification: boolean;
  categories: Array<{ id: number; name: string }>;
  manufacturers: Array<{ id: number; name: string }>;
  dimensions: Array<ProductDimension>;
  images: Array<ProductImage>;
  catalogs: Array<{ id: number; name: string }>;
}

export interface Mail {
  id: number;
  unread?: boolean;
  from: Admin;
  subject: string;
  body: string;
  date: string;
}

export interface Member {
  name: string;
  username: string;
  role: "member" | "owner";
  avatar: AvatarProps;
}

export interface Stat {
  title: string;
  icon: string;
  value: number | string;
  variation: number;
  formatter?: (value: number) => string;
}

export interface Sale {
  id: string;
  date: string;
  status: string;
  email: string;
  amount: number;
}

export interface Notification {
  id: number;
  unread?: boolean;
  sender: Admin;
  body: string;
  date: string;
}

export type Period = "daily" | "weekly" | "monthly";

export interface Range {
  start: Date;
  end: Date;
}

export interface Phone {
  id: number;
  phone: string;
  name: string;
  isMain: boolean;
}

export interface Email {
  id: number;
  email: string;
  name: string;
  isMain: boolean;
}

export interface Address {
  id: number;
  address: string;
  hours: string;
}
