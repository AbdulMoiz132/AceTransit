"use client";

import { useState, useEffect } from "react";
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
  Phone,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import {
  getCoordinates,
  calculateDistance,
  calculateDeliveryFee,
  Coordinates,
  reverseGeocode,
} from "@/lib/distance";

interface BookingFormData {
  // Sender
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupCity: string;
  pickupCoordinates?: Coordinates;
  
  // Receiver
  receiverName: string;
  receiverPhone: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffCoordinates?: Coordinates;
  
  // Package
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
  
  // Calculated
  distance?: number;
  estimatedCost?: number;
}

const deliveryOptions = [
  {
    id: "standard",
    name: "Standard",
    description: "Regular delivery",
    icon: Package,
    multiplier: 1,
    color: "from-blue-400 to-blue-500",
  },
  {
    id: "express",
    name: "Express",
    description: "Priority delivery",
    icon: Truck,
    multiplier: 1.5,
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "fast-track",
    name: "Fast Track",
    description: "Urgent delivery",
    icon: Zap,
    multiplier: 2,
    color: "from-orange-400 to-red-500",
  },
];

export default function Booking() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<ReturnType<typeof calculateDeliveryFee> | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    senderName: "",
    senderPhone: "",
    pickupAddress: "",
    pickupCity: "",
    receiverName: "",
    receiverPhone: "",
    dropoffAddress: "",
    dropoffCity: "",
    packageType: "parcel",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    deliverySpeed: "standard",
    pickupDate: "",
    pickupTime: "",
  });

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            
            console.log("📍 GPS Coordinates:", coords);
            console.log("📍 GPS Accuracy:", position.coords.accuracy, "meters");
            
            // Reverse geocode to get actual address
            const locationData = await reverseGeocode(coords);
            
            if (locationData) {
              setFormData((prev) => ({
                ...prev,
                pickupAddress: locationData.address,
                pickupCity: locationData.city,
                pickupCoordinates: coords,
              }));
            } else {
              // Fallback if reverse geocoding fails
              setFormData((prev) => ({
                ...prev,
                pickupAddress: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
                pickupCity: "Pakistan",
                pickupCoordinates: coords,
              }));
            }
            setIsDetectingLocation(false);
          },
          (error) => {
            console.error("Location error:", error);
            alert("Unable to detect location. Please enter manually or check location permissions.");
            setIsDetectingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        alert("Geolocation is not supported by your browser");
        setIsDetectingLocation(false);
      }
    } catch (error) {
      console.error("Error detecting location:", error);
      setIsDetectingLocation(false);
    }
  };

  // Calculate distance and cost when locations are filled
  useEffect(() => {
    const calculateDistanceAndCost = async () => {
      if (
        formData.pickupAddress &&
        formData.pickupCity &&
        formData.dropoffAddress &&
        formData.dropoffCity
      ) {
        setIsCalculating(true);
        try {
          let pickupCoords = formData.pickupCoordinates;
          let dropoffCoords = formData.dropoffCoordinates;

          // Geocode pickup if not already done
          if (!pickupCoords) {
            const coords = await getCoordinates(
              formData.pickupAddress,
              formData.pickupCity
            );
            pickupCoords = coords || undefined;
          }

          // Geocode dropoff
          if (!dropoffCoords) {
            const coords = await getCoordinates(
              formData.dropoffAddress,
              formData.dropoffCity
            );
            dropoffCoords = coords || undefined;
          }

          if (pickupCoords && dropoffCoords) {
            const distance = calculateDistance(pickupCoords, dropoffCoords);
            const fee = calculateDeliveryFee(distance, formData.deliverySpeed);

            setFormData((prev) => ({
              ...prev,
              pickupCoordinates: pickupCoords!,
              dropoffCoordinates: dropoffCoords!,
              distance,
              estimatedCost: fee.total,
            }));

            setDeliveryFee(fee);
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
        } finally {
          setIsCalculating(false);
        }
      }
    };

    // Debounce the calculation
    const timer = setTimeout(calculateDistanceAndCost, 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.pickupAddress,
    formData.pickupCity,
    formData.dropoffAddress,
    formData.dropoffCity,
    formData.deliverySpeed,
  ]);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save booking data to localStorage for payment page
      localStorage.setItem("bookingData", JSON.stringify({ formData, deliveryFee }));
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
            {[1, 2, 3, 4].map((s) => (
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
            <span className={step >= 1 ? "text-orange-600" : "text-gray-400"}>Sender</span>
            <span className={step >= 2 ? "text-orange-600" : "text-gray-400"}>Receiver</span>
            <span className={step >= 3 ? "text-orange-600" : "text-gray-400"}>Package</span>
            <span className={step >= 4 ? "text-orange-600" : "text-gray-400"}>Delivery</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Sender Details & Pickup */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sender Details</h2>
                    <p className="text-sm text-gray-600">We&apos;ll pick up from this location</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name *
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.senderName}
                      onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                      leftIcon={<User className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      value={formData.senderPhone}
                      onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                      leftIcon={<Phone className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Pickup Address *
                      </label>
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
                    <Input
                      placeholder="House/Building, Street, Area"
                      value={formData.pickupAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupAddress: e.target.value })
                      }
                      leftIcon={<MapPin className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                      value={formData.pickupCity}
                      onChange={(e) =>
                        setFormData({ ...formData, pickupCity: e.target.value })
                      }
                      leftIcon={<Building2 className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Home Pickup Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Home Pickup Included!</p>
                    <p className="text-blue-700">
                      Our rider will come to your location to collect the package. No need to visit our office!
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Receiver Details & Dropoff */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Receiver Details</h2>
                    <p className="text-sm text-gray-600">Where should we deliver?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receiver Name *
                    </label>
                    <Input
                      placeholder="Enter receiver's name"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      leftIcon={<User className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="03XX-XXXXXXX"
                      value={formData.receiverPhone}
                      onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                      leftIcon={<Phone className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <Input
                      placeholder="House/Building, Street, Area"
                      value={formData.dropoffAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, dropoffAddress: e.target.value })
                      }
                      leftIcon={<MapPin className="h-5 w-5" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                      value={formData.dropoffCity}
                      onChange={(e) =>
                        setFormData({ ...formData, dropoffCity: e.target.value })
                      }
                      leftIcon={<Building2 className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Distance Calculation */}
                {isCalculating && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200 flex items-center gap-3">
                    <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-orange-800">Calculating distance...</span>
                  </div>
                )}

                {formData.distance && !isCalculating && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Distance</p>
                          <p className="font-semibold text-gray-900">Ready to calculate price</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-orange-600">
                          {formData.distance}
                        </span>
                        <span className="text-lg font-semibold text-orange-500 ml-1">km</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Step 3: Package Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Package Details</h2>
                    <p className="text-sm text-gray-600">Tell us about your package</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package Type
                    </label>
                    <select
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="parcel">Parcel</option>
                      <option value="document">Document</option>
                      <option value="fragile">Fragile Item</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food Item</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) *
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      leftIcon={<Weight className="h-5 w-5" />}
                    />
                  </div>

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
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Delivery Options & Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Delivery Speed */}
              <Card variant="elevated" padding="lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Delivery Speed</h2>

                <div className="space-y-3">
                  {deliveryOptions.map((option) => {
                    const optionFee = formData.distance
                      ? calculateDeliveryFee(formData.distance, option.id as "standard" | "express" | "fast-track")
                      : null;

                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            deliverySpeed: option.id as "standard" | "express" | "fast-track",
                          });
                          if (optionFee) {
                            setDeliveryFee(optionFee);
                          }
                        }}
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
                          <div className="text-sm text-gray-600">{option.description}</div>
                          {optionFee && (
                            <div className="text-xs text-gray-500 mt-1">
                              {optionFee.estimatedTime}
                            </div>
                          )}
                        </div>
                        {optionFee && (
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              PKR {optionFee.total.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {formData.deliverySpeed === option.id && (
                          <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Pickup Schedule */}
              <Card variant="elevated" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-4">
                  When should we pick up?
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      leftIcon={<Calendar className="h-5 w-5" />}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <Input
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      leftIcon={<Clock className="h-5 w-5" />}
                    />
                  </div>
                </div>

                {/* Pickup Notification */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Rider on the way!</p>
                    <p className="text-blue-700">
                      You&apos;ll receive SMS and app notifications when the rider is assigned and on the way to your location.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Bill Summary */}
              {deliveryFee && (
                <Card
                  variant="elevated"
                  padding="lg"
                  className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-none"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Cost Breakdown</h3>
                    <Badge variant="neutral" className="bg-white/20 border-white/30">
                      {formData.distance} km
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between opacity-90">
                      <span>Base charge</span>
                      <span>PKR {deliveryFee.baseCharge}</span>
                    </div>
                    <div className="flex justify-between opacity-90">
                      <span>Distance charge ({formData.distance} km)</span>
                      <span>PKR {deliveryFee.distanceCharge}</span>
                    </div>
                    <div className="flex justify-between opacity-90">
                      <span>Home pickup service</span>
                      <span>PKR {deliveryFee.pickupCharge}</span>
                    </div>
                    {deliveryFee.serviceMultiplier > 1 && (
                      <div className="flex justify-between opacity-90">
                        <span>Service multiplier</span>
                        <span>×{deliveryFee.serviceMultiplier}</span>
                      </div>
                    )}
                    <div className="flex justify-between opacity-90">
                      <span>GST (5%)</span>
                      <span>PKR {deliveryFee.gst}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/30">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-sm opacity-90">Total Amount</span>
                        <div className="text-xs opacity-75 mt-1">
                          Estimated delivery: {deliveryFee.estimatedTime}
                        </div>
                      </div>
                      <motion.div
                        key={deliveryFee.total}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold"
                      >
                        PKR {deliveryFee.total.toLocaleString()}
                      </motion.div>
                    </div>
                  </div>
                </Card>
              )}
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
                (!formData.senderName ||
                  !formData.senderPhone ||
                  !formData.pickupAddress ||
                  !formData.pickupCity)) ||
              (step === 2 &&
                (!formData.receiverName ||
                  !formData.receiverPhone ||
                  !formData.dropoffAddress ||
                  !formData.dropoffCity)) ||
              (step === 3 && !formData.weight) ||
              (step === 4 && (!formData.pickupDate || !formData.pickupTime))
            }
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {step === 4 ? "Proceed to Payment" : "Continue"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
