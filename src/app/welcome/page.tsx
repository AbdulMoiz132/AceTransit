"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

const onboardingSteps = [
  {
    icon: Package,
    title: "Home-to-Home Delivery",
    description: "Request courier pickups directly from your doorstep. We come to you.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    description: "Track your package every step of the way with live GPS updates and notifications.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: Shield,
    title: "AI-Powered Smart Billing",
    description: "Automatic price calculation based on distance, weight, and delivery speed.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Clock,
    title: "24/7 AI Assistant",
    description: "Get instant help from our intelligent chatbot anytime, anywhere.",
    color: "from-green-400 to-teal-500",
  },
];

export default function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/auth/login");
    }
  };

  const handleSkip = () => {
    router.push("/auth/login");
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleSkip}
          className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-md text-center"
          >
            {/* Icon */}
            <motion.div
              className="mb-8 mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div
                className={`h-32 w-32 mx-auto rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
              >
                <step.icon className="h-16 w-16 text-white" strokeWidth={2} />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {step.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="px-6 pb-12">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-12 bg-gradient-to-r from-orange-500 to-red-500"
                  : "w-2 bg-gray-300"
              }`}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
