"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Package,
  Weight,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  Home,
  Building2,
  Zap,
  Truck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface BookingFormData {
  pickupAddress: string;
  pickupCity: string;
  dropoffAddress: string;
  dropoffCity: string;
  packageType: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  deliverySpeed: "standard" | "express" | "fast-track";
  pickupDate: string;
  pickupTime: string;
}

const deliveryOptions = [
  {
    id: "standard",
    name: "Standard",
    duration: "3-5 days",
    icon: Package,
    multiplier: 1,
    color: "from-blue-400 to-blue-500",
  },
  {
    id: "express",
    name: "Express",
    duration: "1-2 days",
    icon: Truck,
    multiplier: 1.5,
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "fast-track",
    name: "Fast Track",
    duration: "Same day",
    icon: Zap,
    multiplier: 2,
    color: "from-orange-400 to-red-500",
  },
];

export default function Booking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    pickupAddress: "",
    pickupCity: "",
    dropoffAddress: "",
    dropoffCity: "",
    packageType: "parcel",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    deliverySpeed: "standard",
    pickupDate: "",
    pickupTime: "",
  });

  const detectLocation = () => {
    setIsDetectingLocation(true);
    // Simulate location detection
    setTimeout(() => {
      setFormData({
        ...formData,
        pickupAddress: "123 Main Street, Block A",
        pickupCity: "Rawalpindi",
      });
      setIsDetectingLocation(false);
    }, 1500);
  };

  const calculatePrice = () => {
    const basePrice = 500;
    const weightPrice = parseFloat(formData.weight) * 50;
    const distancePrice = 300; // Simulated
    const option = deliveryOptions.find((opt) => opt.id === formData.deliverySpeed);
    const total = (basePrice + weightPrice + distancePrice) * (option?.multiplier || 1);
    return Math.round(total);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.push("/payment");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Book Shipment</h1>
          <div className="w-10" />
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s <= step
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium">
            <span className={step >= 1 ? "text-orange-600" : "text-gray-400"}>
              Location
            </span>
            <span className={step >= 2 ? "text-orange-600" : "text-gray-400"}>
              Package Details
            </span>
            <span className={step >= 3 ? "text-orange-600" : "text-gray-400"}>
              Delivery Options
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Location */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pickup & Delivery Location
                </h2>

                {/* Pickup Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Pickup Location</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Navigation className="h-4 w-4" />}
                      onClick={detectLocation}
                      isLoading={isDetectingLocation}
                      className="border-orange-500 text-orange-600"
                    >
                      Detect
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="Enter pickup address"
                      value={formData.pickupAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupAddress: e.target.value })
                      }
                      leftIcon={<MapPin className="h-5 w-5" />}
                    />
                    <Input
                      placeholder="City"
                      value={formData.pickupCity}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupCity: e.target.value })
                      }
                      leftIcon={<Building2 className="h-5 w-5" />}
                    />
                  </div>

                  {formData.pickupAddress && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <Badge variant="success" size="sm">
                        Location confirmed ✓
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {/* Dropoff Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Delivery Location</h3>
                  </div>

                  <div className="space-y-3">
                    <Input
                      placeholder="Enter delivery address"
                      value={formData.dropoffAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, dropoffAddress: e.target.value })
                      }
                      leftIcon={<MapPin className="h-5 w-5" />}
                    />
                    <Input
                      placeholder="City"
                      value={formData.dropoffCity}
                      onChange={(e) =>
                        setFormData({ ...formData, dropoffCity: e.target.value })
                      }
                      leftIcon={<Building2 className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Route Visualization */}
                {formData.pickupCity && formData.dropoffCity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="font-medium">{formData.pickupCity}</span>
                      </div>
                      <div className="flex-1 mx-4 border-t-2 border-dashed border-orange-400" />
                      <span className="text-orange-600 font-semibold">~350 km</span>
                      <div className="flex-1 mx-4 border-t-2 border-dashed border-orange-400" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formData.dropoffCity}</span>
                        <div className="h-2 w-2 bg-red-500 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Step 2: Package Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Package Information
                </h2>

                {/* Package Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Package Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Parcel", "Document", "Fragile"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFormData({ ...formData, packageType: type.toLowerCase() })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.packageType === type.toLowerCase()
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Package
                          className={`h-6 w-6 mx-auto mb-2 ${
                            formData.packageType === type.toLowerCase()
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            formData.packageType === type.toLowerCase()
                              ? "text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter weight"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    leftIcon={<Weight className="h-5 w-5" />}
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (cm) - Optional
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      placeholder="Length"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, length: e.target.value },
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Width"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, width: e.target.value },
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Height"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, height: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Delivery Options & Bill */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Delivery Speed */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Select Delivery Speed
                </h2>

                <div className="space-y-3">
                  {deliveryOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          deliverySpeed: option.id as "standard" | "express" | "fast-track",
                        })
                      }
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        formData.deliverySpeed === option.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <option.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.duration}</div>
                      </div>
                      {formData.deliverySpeed === option.id && (
                        <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Pickup Schedule */}
              <Card variant="elevated" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-4">Pickup Schedule</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupDate: e.target.value })
                      }
                      leftIcon={<Calendar className="h-5 w-5" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupTime: e.target.value })
                      }
                      leftIcon={<Clock className="h-5 w-5" />}
                    />
                  </div>
                </div>
              </Card>

              {/* Bill Estimation */}
              <Card
                variant="elevated"
                padding="lg"
                className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-none"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Estimated Cost</h3>
                  <Badge variant="neutral" className="bg-white/20 border-white/30">
                    Smart Pricing
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between opacity-90">
                    <span>Base fare</span>
                    <span>PKR 500</span>
                  </div>
                  <div className="flex justify-between opacity-90">
                    <span>Distance (~350 km)</span>
                    <span>PKR 300</span>
                  </div>
                  {formData.weight && (
                    <div className="flex justify-between opacity-90">
                      <span>Weight ({formData.weight} kg)</span>
                      <span>PKR {parseFloat(formData.weight) * 50}</span>
                    </div>
                  )}
                  <div className="flex justify-between opacity-90">
                    <span>
                      {deliveryOptions.find((o) => o.id === formData.deliverySpeed)?.name}{" "}
                      delivery
                    </span>
                    <span>
                      ×
                      {deliveryOptions.find((o) => o.id === formData.deliverySpeed)
                        ?.multiplier}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/30">
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-medium">Total Amount</span>
                    <motion.div
                      key={calculatePrice()}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold"
                    >
                      PKR {calculatePrice().toLocaleString()}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Button
            size="lg"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            onClick={handleNext}
            disabled={
              (step === 1 &&
                (!formData.pickupAddress ||
                  !formData.pickupCity ||
                  !formData.dropoffAddress ||
                  !formData.dropoffCity)) ||
              (step === 2 && !formData.weight)
            }
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {step === 3 ? "Proceed to Payment" : "Continue"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
