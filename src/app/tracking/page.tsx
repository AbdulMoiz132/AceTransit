"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  ChevronLeft,
  Navigation,
  User,
  Star,
  Share2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface TrackingStatus {
  id: number;
  title: string;
  description: string;
  time: string;
  date: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const trackingSteps: TrackingStatus[] = [
  {
    id: 1,
    title: "Order Placed",
    description: "Your shipment has been successfully booked",
    time: "10:30 AM",
    date: "11 Sept, 2025",
    completed: true,
    icon: Package,
  },
  {
    id: 2,
    title: "Picked Up",
    description: "Package collected from pickup location",
    time: "2:15 PM",
    date: "11 Sept, 2025",
    completed: true,
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: "In Transit",
    description: "Package is on the way to destination",
    time: "4:30 PM",
    date: "11 Sept, 2025",
    completed: true,
    icon: Truck,
  },
  {
    id: 4,
    title: "Out for Delivery",
    description: "Package will be delivered today",
    time: "Expected",
    date: "12 Sept, 2025",
    completed: false,
    icon: Navigation,
  },
  {
    id: 5,
    title: "Delivered",
    description: "Package delivered successfully",
    time: "Pending",
    date: "12 Sept, 2025",
    completed: false,
    icon: CheckCircle2,
  },
];

export default function Tracking() {
  const router = useRouter();
  const [currentStep] = useState(3);
  const [, setLiveLocation] = useState({ lat: 33.6, lng: 73.0 });

  // Simulate live tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.01,
        lng: prev.lng + (Math.random() - 0.5) * 0.01,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const progress = (currentStep / trackingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Track Package</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Package Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            variant="elevated"
            padding="lg"
            className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-none relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 opacity-10">
              <Truck className="h-40 w-40" strokeWidth={1} />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge variant="neutral" className="bg-white/20 border-white/30 mb-2">
                    Fast Track
                  </Badge>
                  <h2 className="text-2xl font-bold mb-1">In Transit</h2>
                  <p className="text-white/80 text-sm">Tracking ID: #ACT-2025-001</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-8 w-8" strokeWidth={2} />
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between text-sm mb-4">
                <div>
                  <div className="text-white/70 text-xs mb-1">From</div>
                  <div className="font-semibold">Rawalpindi</div>
                </div>
                <div className="flex-1 mx-4 relative">
                  <div className="border-t-2 border-dashed border-white/40" />
                  <motion.div
                    className="absolute top-0 left-0 border-t-2 border-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-right">
                  <div className="text-white/70 text-xs mb-1">To</div>
                  <div className="font-semibold">Karachi</div>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Delivery Progress</span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Live Location Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-blue-100 to-indigo-100">
              {/* Simulated Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="h-16 w-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                  >
                    <Truck className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <Badge variant="neutral" className="bg-white shadow-md">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Live Tracking Active</span>
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Grid lines for map effect */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full border-t border-gray-400"
                    style={{ top: `${i * 10}%` }}
                  />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full border-l border-gray-400"
                    style={{ left: `${i * 10}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Current Location
                    </div>
                    <div className="text-xs text-gray-600">
                      Near M-2 Motorway, Approaching Lahore
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Map
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Estimated Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="gradient" padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Estimated Delivery</div>
                  <div className="text-lg font-bold text-gray-900">
                    Today, 2:34 PM - 4:00 PM
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Courier Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ahmed Khan</div>
                  <div className="text-sm text-gray-600">Your Courier</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3 w-3 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">(4.9)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tracking Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking History</h3>

            <div className="space-y-6">
              {trackingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex gap-4"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        step.completed
                          ? "bg-gradient-to-br from-orange-500 to-red-500 text-white scale-110"
                          : step.id === currentStep + 1
                          ? "bg-orange-100 text-orange-600 animate-pulse"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <step.icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[40px] transition-colors ${
                          step.completed ? "bg-orange-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-1">
                      <h4
                        className={`font-semibold ${
                          step.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <div className="text-right">
                        <div
                          className={`text-xs font-medium ${
                            step.completed ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {step.time}
                        </div>
                        <div className="text-xs text-gray-500">{step.date}</div>
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        step.completed ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            leftIcon={<MessageCircle className="h-5 w-5" />}
            onClick={() => router.push("/chat")}
          >
            Get Help
          </Button>
          <Button
            size="lg"
            rightIcon={<Share2 className="h-5 w-5" />}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Share Status
          </Button>
        </div>
      </div>
    </div>
  );
}
