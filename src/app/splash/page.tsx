"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.push("/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#FF9D42] via-[#FF8C61] to-[#FF6B35] flex items-center justify-center overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Logo and Brand */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        {/* Logo Icon */}
        <motion.div
          className="mb-6 relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl" />
          <div className="relative h-32 w-32 rounded-3xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
            <Package className="h-16 w-16 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="text-5xl font-bold text-white mb-3 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          AceTransit
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-white/90 text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Smart Courier. Swift Delivery.
        </motion.p>

        {/* Loading Indicator */}
        <motion.div
          className="mt-12 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
