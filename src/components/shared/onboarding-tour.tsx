"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, ChevronLeft, X } from "lucide-react";

export interface TourStep {
  title: string;
  description: string;
  badge?: string;
}

interface OnboardingTourProps {
  storageKey: string;
  steps: TourStep[];
  autoStartDelay?: number;
}

export function OnboardingTour({
  storageKey,
  steps,
  autoStartDelay = 1200,
}: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Periksa apakah pengguna sudah pernah menyelesaikan tour ini
    const isCompleted = localStorage.getItem(storageKey);
    if (!isCompleted && steps.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoStartDelay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, steps, autoStartDelay]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    setIsOpen(false);
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950/90 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-xl"
        >
          {/* Glowing Ambient Gradient */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {step.badge || `Panduan ${currentStep + 1}/${steps.length}`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Lewati Panduan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-bold text-white leading-tight">
              {step.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Step Dots Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-6 bg-amber-500"
                      : "w-1.5 bg-zinc-800"
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Kembali
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="h-8 text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-md shadow-amber-500/20"
              >
                {currentStep === steps.length - 1 ? (
                  "Mengerti & Mulai"
                ) : (
                  <>
                    Lanjut
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
