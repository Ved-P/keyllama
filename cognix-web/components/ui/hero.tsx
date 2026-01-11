"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center h-[90vh] bg-white text-gray-900 text-center px-6">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
        Learn to Code Responsibly with AI
      </h1>
      <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed text-gray-700">
        Transforming AI into a tool that supports learning, not replaces it
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Button 
          className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-6 py-3 font-semibold"
          onClick={() => window.location.href = '/create-class'}
        >
          Create a Class
          <ChevronRight className="w-5 h-5 animate-horizontal" />
        </Button>
        <Button 
          className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 font-semibold"
          onClick={() => window.location.href = '/view-class'}
        >
          View Class Sessions
        </Button>
      </div>

      {/* Tailwind custom animation */}
      <style jsx>{`
        @keyframes horizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .animate-horizontal {
          animation: horizontal 1s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
