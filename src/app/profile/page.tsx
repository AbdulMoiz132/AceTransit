"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Camera,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const stats = [
  { label: "Total Deliveries", value: "18", icon: Package, color: "from-blue-500 to-blue-600" },
  { label: "On Time Rate", value: "98%", icon: TrendingUp, color: "from-green-500 to-green-600" },
  { label: "Active Orders", value: "2", icon: Clock, color: "from-orange-500 to-orange-600" },
];

const menuSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Information", href: "/profile/edit", badge: null },
      { icon: MapPin, label: "Saved Addresses", href: "/profile/addresses", badge: "3" },
      { icon: CreditCard, label: "Payment Methods", href: "/profile/payment", badge: null },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", href: "/profile/notifications", badge: null },
      { icon: Lock, label: "Privacy & Security", href: "/profile/security", badge: null },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & FAQs", href: "/help", badge: null },
      { icon: Star, label: "Rate Our Service", href: "/rate", badge: null },
    ],
  },
];

export default function Profile() {
  const router = useRouter();
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+92 300 1234567",
    avatar: null,
    memberSince: "January 2024",
    rating: 4.9,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white pt-12 pb-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/profile/edit")}
              className="text-white hover:bg-white/10"
            >
              <Edit className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Card variant="elevated" padding="lg" className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-4 border-white/20">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 h-7 w-7 bg-white text-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{user.rating}</span>
                    <span className="text-white/70 text-sm ml-1">Customer Rating</span>
                  </div>
                  <p className="text-white/80 text-sm">Member since {user.memberSince}</p>
                </div>

                <Badge variant="default" className="bg-white/20 border-white/30">
                  Premium
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-white/70" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-white/70" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Card variant="elevated" padding="md" className="text-center">
                <div className={`h-10 w-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 + 0.4 }}
          >
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-2">
              {section.title}
            </h3>
            <Card variant="elevated" padding="none">
              {section.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    index !== section.items.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="info" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </Card>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="outline"
            size="lg"
            leftIcon={<LogOut className="h-5 w-5" />}
            onClick={() => router.push("/auth/login")}
            className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50"
          >
            Logout
          </Button>
        </motion.div>

        {/* App Info */}
        <div className="text-center py-6 text-sm text-gray-500">
          <p>AceTransit v1.0.0</p>
          <p className="mt-1">© 2025 AceTransit. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
