"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface BookingData {
  formData: {
    senderName: string;
    senderPhone: string;
    pickupAddress: string;
    pickupCity: string;
    receiverName: string;
    receiverPhone: string;
    dropoffAddress: string;
    dropoffCity: string;
    packageType: string;
    weight: string;
    distance: number;
    pickupDate: string;
    pickupTime: string;
  };
  deliveryFee: {
    baseCharge: number;
    distanceCharge: number;
    pickupCharge: number;
    gst: number;
    total: number;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your package is delivered",
    icon: DollarSign,
    color: "from-green-400 to-green-500",
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Pay via JazzCash mobile wallet",
    icon: Wallet,
    color: "from-red-400 to-red-500",
  },
  {
    id: "easypaisa",
    name: "EasyPaisa",
    description: "Pay via EasyPaisa mobile wallet",
    icon: Wallet,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Pay with your card",
    icon: CreditCard,
    color: "from-blue-400 to-blue-500",
  },
];

export default function Payment() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [orderId, setOrderId] = useState<string>("");

  // Card details for card payment
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  // Mobile wallet details
  const [walletNumber, setWalletNumber] = useState("");

  useEffect(() => {
    // Load booking data from localStorage
    const data = localStorage.getItem("bookingData");
    if (data) {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
    } else {
      // If no booking data, redirect to booking page
      router.push("/booking");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate order ID
    const newOrderId = `ACE${Date.now().toString().slice(-8)}`;
    setOrderId(newOrderId);

    // Save order to localStorage (in a real app, this would go to a backend)
    const order = {
      orderId: newOrderId,
      ...bookingData,
      paymentMethod: selectedMethod,
      status: "pending-pickup",
      createdAt: new Date().toISOString(),
    };

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    setIsProcessing(false);
    setIsSuccess(true);

    // Redirect to tracking after 3 seconds
    setTimeout(() => {
      router.push(`/tracking?order=${newOrderId}`);
    }, 3000);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing || isSuccess}
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Payment</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Order Summary */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Pickup</p>
                      <p className="text-gray-600">
                        {bookingData.formData.senderName} • {bookingData.formData.senderPhone}
                      </p>
                      <p className="text-gray-600">
                        {bookingData.formData.pickupAddress}, {bookingData.formData.pickupCity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Delivery</p>
                      <p className="text-gray-600">
                        {bookingData.formData.receiverName} • {bookingData.formData.receiverPhone}
                      </p>
                      <p className="text-gray-600">
                        {bookingData.formData.dropoffAddress}, {bookingData.formData.dropoffCity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Package Details</p>
                      <p className="text-gray-600">
                        {bookingData.formData.packageType} • {bookingData.formData.weight} kg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Pickup Schedule</p>
                      <p className="text-gray-600">
                        {new Date(bookingData.formData.pickupDate).toLocaleDateString()} •{" "}
                        {bookingData.formData.pickupTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Base charge</span>
                      <span>PKR {bookingData.deliveryFee.baseCharge}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Distance ({bookingData.formData.distance} km)</span>
                      <span>PKR {bookingData.deliveryFee.distanceCharge}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Home pickup</span>
                      <span>PKR {bookingData.deliveryFee.pickupCharge}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST (5%)</span>
                      <span>PKR {bookingData.deliveryFee.gst}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      PKR {bookingData.deliveryFee.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Payment Methods */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        selectedMethod === method.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Payment Details */}
                <div className="mt-6">
                  {selectedMethod === "card" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <Input
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, number: e.target.value })
                        }
                        leftIcon={<CreditCard className="h-5 w-5" />}
                        maxLength={16}
                      />
                      <Input
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, name: e.target.value })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          maxLength={5}
                        />
                        <Input
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, cvv: e.target.value })
                          }
                          type="password"
                          maxLength={3}
                        />
                      </div>
                    </motion.div>
                  )}

                  {(selectedMethod === "jazzcash" || selectedMethod === "easypaisa") && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Input
                        placeholder="Mobile Wallet Number"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        leftIcon={<Phone className="h-5 w-5" />}
                        type="tel"
                      />
                    </motion.div>
                  )}

                  {selectedMethod === "cod" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 rounded-xl border border-green-200"
                    >
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">Payment on Delivery:</span> Pay PKR{" "}
                        {bookingData.deliveryFee.total.toLocaleString()} when your package is
                        delivered. Make sure to keep exact change ready.
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>

              {/* Confirm Button */}
              <Button
                size="lg"
                onClick={handlePayment}
                isLoading={isProcessing}
                disabled={
                  isProcessing ||
                  (selectedMethod === "card" &&
                    (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv)) ||
                  ((selectedMethod === "jazzcash" || selectedMethod === "easypaisa") &&
                    !walletNumber)
                }
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isProcessing ? "Processing..." : `Confirm & Pay PKR ${bookingData.deliveryFee.total.toLocaleString()}`}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your booking has been confirmed successfully
              </p>

              <Card variant="elevated" padding="lg" className="w-full max-w-md">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-2xl font-bold text-orange-600">{orderId}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold text-gray-900">
                      {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold text-gray-900">
                      PKR {bookingData.deliveryFee.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="warning">Pending Pickup</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800 text-center">
                    <span className="font-semibold">Rider assigned!</span> You&apos;ll receive
                    notifications when the rider is on the way.
                  </p>
                </div>
              </Card>

              <p className="text-sm text-gray-600 mt-6">
                Redirecting to tracking page...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
