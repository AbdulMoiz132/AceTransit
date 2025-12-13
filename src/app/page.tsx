"use client";

import { motion } from "framer-motion";
import { Package, Zap, Brain, MapPin, Shield, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Same-day delivery with real-time tracking for all your packages.",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Smart routing and pricing powered by advanced AI algorithms.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      description: "Track your packages every step of the way with live updates.",
      color: "from-green-400 to-teal-500",
    },
    {
      icon: Shield,
      title: "Secure & Safe",
      description: "End-to-end insurance and secure handling for peace of mind.",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our AI chatbot and support team are always here to help.",
      color: "from-red-400 to-pink-500",
    },
    {
      icon: Package,
      title: "Premium Experience",
      description: "White-glove service with professional couriers.",
      color: "from-cyan-400 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto px-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col items-center"
            >
              <Badge variant="info" size="md" className="mb-8">
                🚀 Now Live in Beta
              </Badge>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight">
                Smart Courier.
                <br className="hidden sm:block" />
                <span className="sm:inline block">Swift Delivery.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl w-full mx-auto leading-relaxed">
                Premium AI-assisted courier platform for home-to-home deliveries with real-time tracking and smart billing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 w-full sm:w-auto">
                <Button size="lg" rightIcon={<Package className="h-5 w-5" />} className="w-full sm:w-auto">
                  Book a Delivery
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Track Package
                </Button>
              </div>

              {/* Quick Tracking Input */}
              <div className="w-full max-w-md mx-auto">
                <Input
                  placeholder="Enter tracking ID..."
                  leftIcon={<MapPin className="h-5 w-5" />}
                  variant="filled"
                />
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="success" size="lg" className="mb-4">
              Why Choose AceTransit
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Modern Logistics
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the future of courier services with cutting-edge technology and premium service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card variant="elevated" hoverable>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { value: "10K+", label: "Deliveries Completed" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card variant="gradient" className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers enjoying premium courier services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                rightIcon={<Package className="h-5 w-5" />}
              >
                Start Shipping Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

