"use client";

import Link from "next/link";
import { Package, Github, Twitter, Linkedin, Mail } from "lucide-react";
import Container from "./Container";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Track Order", href: "/tracking" },
            { label: "API", href: "/api" },
        ],
        company: [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
        ],
        legal: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Cookie Policy", href: "/cookies" },
            { label: "Refund Policy", href: "/refund" },
        ],
    };

    const socialLinks = [
        { icon: Github, href: "https://github.com", label: "GitHub" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: Mail, href: "mailto:hello@acetransit.com", label: "Email" },
    ];

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <Container>
                <div className="py-12 sm:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    AceTransit
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                                Premium AI-assisted courier platform for home-to-home deliveries with real-time tracking and smart billing.
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-3">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-200 group"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Product
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.product.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-3">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                © {currentYear} AceTransit. All rights reserved.
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Built with ❤️ using Next.js & TypeScript
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
