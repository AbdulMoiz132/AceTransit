"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  Clock,
  TrendingUp,
  MessageCircle,
  Search,
  Bell,
  Menu,
  Home as HomeIcon,
  Truck,
  User,
  Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useRouter } from "next/navigation";

// Mock data for recent shipments
const recentShipments = [
  {
    id: "ACT-2025-001",
    type: "Fast Track",
    status: "Delivered",
    from: "Rawalpindi",
    to: "Karachi",
    date: "11 Sept, 2025",
    time: "2:34pm",
    color: "green",
  },
  {
    id: "ACT-2025-002",
    type: "Standard",
    status: "In Transit",
    from: "Rawalpindi",
    to: "Sialkot",
    date: "12 Sept, 2025",
    time: "Dispatched from Facility",
    color: "orange",
  },
  {
    id: "ACT-2025-003",
    type: "Express",
    status: "Processing",
    from: "Islamabad",
    to: "Lahore",
    date: "13 Sept, 2025",
    time: "Preparing for dispatch",
    color: "blue",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Welcome
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            variant="elevated"
            padding="lg"
            className="mb-6 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 text-white border-none overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 opacity-10">
              <Package className="h-48 w-48" strokeWidth={1} />
            </div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                  >
                    👋
                  </motion.div>
                  <span className="text-lg font-medium opacity-90">Good Day!</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome Back!
                  <br />
                  Ready to ship?
                </h1>
                <p className="text-white/80 mb-6 max-w-md">
                  Track your packages, book new deliveries, and manage your shipments all in one place.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<Package className="h-5 w-5" />}
                  onClick={() => router.push("/booking")}
                  className="bg-white text-orange-600 hover:bg-gray-50"
                >
                  Start Shipping!
                </Button>
              </div>

              {/* Illustration */}
              <div className="hidden md:block">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Truck className="h-16 w-16 text-white" strokeWidth={1.5} />
                  </div>
                  {/* Route visualization */}
                  <svg
                    className="absolute -left-16 top-1/2 -translate-y-1/2"
                    width="180"
                    height="120"
                    viewBox="0 0 180 120"
                  >
                    <motion.path
                      d="M 10 40 Q 60 10, 90 50 Q 120 90, 190 60"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      style={{ y: 30 }} 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                  <MapPin className="absolute -left-20 top-1/3 h-8 w-8 text-white" />
                  <MapPin className="absolute -right-6 top-2/3 h-8 w-8 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Location info */}
            <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Your Home</span>
              <span className="opacity-70">→</span>
              <span className="opacity-70">Your Destination</span>
            </div>
            
            {/* Feature tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="neutral" className="bg-white/20 text-white border-white/30">
                Fast and secure
              </Badge>
              <Badge variant="neutral" className="bg-white/20 text-white border-white/30">
                Real-time tracking
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active", value: "2", icon: Package, color: "from-blue-500 to-blue-600" },
            { label: "Delivered", value: "15", icon: TrendingUp, color: "from-green-500 to-green-600" },
            { label: "Pending", value: "1", icon: Clock, color: "from-orange-500 to-orange-600" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card variant="elevated" padding="md" className="text-center">
                <div className={`h-10 w-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Shipments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Recent Shipments</h2>
            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentShipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card
                  variant="elevated"
                  padding="md"
                  hoverable
                  onClick={() => router.push(`/tracking?order=${shipment.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            shipment.status === "Delivered"
                              ? "success"
                              : shipment.status === "In Transit"
                              ? "warning"
                              : "info"
                          }
                          size="sm"
                        >
                          {shipment.type}
                        </Badge>
                        <span className="text-xs text-gray-500">#{shipment.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            shipment.status === "Delivered"
                              ? "bg-green-500"
                              : shipment.status === "In Transit"
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <span className="font-semibold text-gray-900">{shipment.status}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {shipment.from} → {shipment.to}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {shipment.time}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">{shipment.date}</div>
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                        shipment.status === "Delivered"
                          ? "from-green-400 to-green-500"
                          : shipment.status === "In Transit"
                          ? "from-orange-400 to-orange-500"
                          : "from-blue-400 to-blue-500"
                      } flex items-center justify-center`}>
                        <Package className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator for in-transit items */}
                  {shipment.status === "In Transit" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Current status</span>
                        <span>65% Complete</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "65%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Book New Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/booking")}
              className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
              leftIcon={<Plus className="h-5 w-5" />}
            >
              Book new
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { icon: HomeIcon, label: "Home", id: "home" },
              { icon: Package, label: "Ship", id: "ship" },
              { icon: Truck, label: "Transit", id: "transit" },
              { icon: User, label: "Profile", id: "profile" },
              { icon: MessageCircle, label: "Search", id: "search" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "ship") router.push("/booking");
                  if (item.id === "transit") router.push("/tracking");
                  if (item.id === "profile") router.push("/profile");
                }}
                className="flex flex-col items-center gap-1 py-2 px-4 relative group"
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white scale-110"
                      : "text-gray-600 group-hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    activeTab === item.id
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        onClick={() => router.push("/chat")}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>
    </div>
  );
}
