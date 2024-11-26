"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const navigateToChatbot = () => {
    if (isLoggedIn) {
      router.push("/chatbot");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to Chatbot!</h1>
      <p className="text-gray-700 text-center mb-6">
        Discover the power of AI with our chatbot. Get instant answers to your questions
        and enjoy seamless communication powered by state-of-the-art technology.
      </p>
      <button
        onClick={navigateToChatbot}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      >
        Go to Chatbot
      </button>
    </div>
  );
}
