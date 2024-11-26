"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/"); // Redirect to welcome page
  };

  return (
    <nav className="bg-blue-500 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-semibold">Chatbot App</h1>
      <div className="flex space-x-4">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 bg-green-500 rounded hover:bg-green-400"
            >
              Signup
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-400"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
