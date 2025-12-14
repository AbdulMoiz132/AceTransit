"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
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
  Home,
  MapPin,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Coordinates } from "@/lib/distance";

interface OrderData {
  orderId: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  formData: {
    senderName: string;
    senderPhone: string;
    pickupAddress: string;
    pickupCity: string;
    pickupCoordinates: Coordinates;
    receiverName: string;
    receiverPhone: string;
    dropoffAddress: string;
    dropoffCity: string;
    dropoffCoordinates: Coordinates;
    packageType: string;
    weight: string;
    distance: number;
    deliverySpeed: string;
    pickupDate: string;
    pickupTime: string;
  };
  deliveryFee: {
    baseCharge: number;
    distanceCharge: number;
    pickupCharge: number;
    gst: number;
    total: number;
    estimatedTime: string;
  };
}

// Dynamically import Map component (client-side only)
const Map = dynamic(() => import("@/components/ui/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
    </div>
  ),
});

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
    time: "",
    date: "",
    completed: true,
    icon: Package,
  },
  {
    id: 2,
    title: "Rider Assigned",
    description: "Rider is on the way to pickup location",
    time: "",
    date: "",
    completed: true,
    icon: User,
  },
  {
    id: 3,
    title: "Picked Up",
    description: "Package collected from pickup location",
    time: "",
    date: "",
    completed: true,
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: "In Transit",
    description: "Package is on the way to destination",
    time: "",
    date: "",
    completed: false,
    icon: Truck,
  },
  {
    id: 5,
    title: "Out for Delivery",
    description: "Package will be delivered soon",
    time: "",
    date: "",
    completed: false,
    icon: Navigation,
  },
  {
    id: 6,
    title: "Delivered",
    description: "Package delivered successfully",
    time: "",
    date: "",
    completed: false,
    icon: CheckCircle2,
  },
];

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [currentStep] = useState(3);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [riderLocation, setRiderLocation] = useState<Coordinates | null>(null);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);

  // Load orders based on view (list or detail)
  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    if (orderId) {
      // Load specific order for detail view
      const order = orders.find((o: { orderId: string }) => o.orderId === orderId);
      
      if (order) {
        // Use queueMicrotask to avoid cascading setState
        queueMicrotask(() => {
          setOrderData(order as OrderData);
          
          // Simulate rider location (in real app, this would come from GPS)
          if (order.formData.pickupCoordinates && order.formData.dropoffCoordinates) {
            // Position rider somewhere between pickup and delivery
            setRiderLocation({
              lat: (order.formData.pickupCoordinates.lat + order.formData.dropoffCoordinates.lat) / 2,
              lng: (order.formData.pickupCoordinates.lng + order.formData.dropoffCoordinates.lng) / 2,
            });
          }
        });
      }
    } else {
      // Load all orders for list view
      setAllOrders(orders as OrderData[]);
    }
  }, [orderId]);

  // Simulate live tracking
  useEffect(() => {
    if (riderLocation && orderData?.formData.dropoffCoordinates) {
      const interval = setInterval(() => {
        setRiderLocation((prev) => {
          if (!prev || !orderData?.formData?.dropoffCoordinates) return prev;
          
          // Move rider slightly towards delivery location
          const target = orderData.formData.dropoffCoordinates as Coordinates;
          return {
            lat: prev.lat + (target.lat - prev.lat) * 0.05,
            lng: prev.lng + (target.lng - prev.lng) * 0.05,
          };
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData]);

  // Update tracking steps with actual times
  useEffect(() => {
    if (orderData) {
      const createdAt = new Date(orderData.createdAt);
      trackingSteps[0].time = createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      trackingSteps[0].date = createdAt.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
      
      // Simulate subsequent steps (15 min apart)
      for (let i = 1; i < trackingSteps.length; i++) {
        const stepTime = new Date(createdAt.getTime() + i * 15 * 60 * 1000);
        trackingSteps[i].time = stepTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        trackingSteps[i].date = stepTime.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
      }
    }
  }, [orderData]);

  const progress = (currentStep / trackingSteps.length) * 100;

  // If no order ID, show list of all orders
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Track Orders</h1>
              <p className="text-sm text-gray-600">View all your shipments</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          {allOrders.length === 0 ? (
            <Card variant="elevated" padding="lg" className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start by booking your first shipment</p>
              <Button
                onClick={() => router.push("/booking")}
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                Book Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Shipments ({allOrders.length})
                </h2>
              </div>

              {allOrders.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    variant="elevated"
                    padding="lg"
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/tracking?order=${order.orderId}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                        <Truck className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{order.orderId}</h3>
                          <Badge variant="warning">In Transit</Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            <span className="truncate">{order.formData.pickupCity}</span>
                            <span>→</span>
                            <span className="truncate">{order.formData.dropoffCity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>50%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-1/2" />
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/tracking")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to orders list"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">Track Shipment</h1>
            <p className="text-xs text-gray-600">{orderData.orderId}</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go to home"
          >
            <Home className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Map */}
        {orderData.formData.pickupCoordinates && orderData.formData.dropoffCoordinates && (
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="h-[300px]">
              <Map
                pickup={orderData.formData.pickupCoordinates as Coordinates}
                delivery={orderData.formData.dropoffCoordinates as Coordinates}
                currentPosition={riderLocation || undefined}
              />
            </div>
          </Card>
        )}

        {/* Current Status */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {trackingSteps[currentStep - 1]?.title}
                </h2>
                <Badge variant="warning">Active</Badge>
              </div>
              <p className="text-gray-600 mb-3">
                {trackingSteps[currentStep - 1]?.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  {trackingSteps[currentStep - 1]?.date} •{" "}
                  {trackingSteps[currentStep - 1]?.time}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600">Delivery Progress</span>
              <span className="font-semibold text-orange-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
          </div>
        </Card>

        {/* Rider Information */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
              AR
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Ahmed Raza</h3>
              <p className="text-sm text-gray-600">Delivery Partner</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">4.8</span>
                <span className="text-xs text-gray-500">(234 deliveries)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              leftIcon={<Phone className="h-5 w-5" />}
              className="border-orange-500 text-orange-600"
            >
              Call Rider
            </Button>
            <Button
              variant="outline"
              leftIcon={<MessageCircle className="h-5 w-5" />}
              className="border-orange-500 text-orange-600"
            >
              Message
            </Button>
          </div>
        </Card>

        {/* Shipment Details */}
        <Card variant="elevated" padding="lg">
          <h3 className="font-semibold text-gray-900 mb-4">Shipment Details</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Pickup Location</p>
                <p className="text-sm text-gray-600">{orderData.formData.senderName}</p>
                <p className="text-sm text-gray-600">
                  {orderData.formData.pickupAddress}, {orderData.formData.pickupCity}
                </p>
                <p className="text-xs text-gray-500 mt-1">{orderData.formData.senderPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Delivery Location</p>
                <p className="text-sm text-gray-600">{orderData.formData.receiverName}</p>
                <p className="text-sm text-gray-600">
                  {orderData.formData.dropoffAddress}, {orderData.formData.dropoffCity}
                </p>
                <p className="text-xs text-gray-500 mt-1">{orderData.formData.receiverPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Package Information</p>
                <p className="text-sm text-gray-600">
                  {orderData.formData.packageType} • {orderData.formData.weight} kg
                </p>
                <p className="text-sm text-gray-600">
                  Distance: {orderData.formData.distance} km
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card variant="elevated" padding="lg">
          <h3 className="font-semibold text-gray-900 mb-4">Tracking Timeline</h3>

          <div className="space-y-4">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep - 1;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-green-500"
                          : isCurrent
                          ? "bg-gradient-to-br from-orange-400 to-red-500"
                          : "bg-gray-200"
                      } transition-all`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isCompleted || isCurrent ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          isCompleted ? "bg-green-400" : "bg-gray-200"
                        } transition-all`}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-semibold ${
                          isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <Badge variant="success" className="text-xs">
                          Completed
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="warning" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                    {(isCompleted || isCurrent) && step.time && (
                      <p className="text-xs text-gray-500 mt-1">
                        {step.date} • {step.time}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Payment Info */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                PKR {orderData.deliveryFee.total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Payment: {orderData.paymentMethod === "cod" ? "Cash on Delivery" : orderData.paymentMethod}
              </p>
            </div>
            <Badge variant={orderData.paymentMethod === "cod" ? "warning" : "success"}>
              {orderData.paymentMethod === "cod" ? "Pay on Delivery" : "Paid"}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Tracking() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
