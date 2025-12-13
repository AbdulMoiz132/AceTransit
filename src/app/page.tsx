"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to splash screen on initial load
    router.push("/splash");
  }, [router]);

  return null;
}
