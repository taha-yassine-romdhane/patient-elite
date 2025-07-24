"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 font-semibold text-sm
                ${
                  i < currentStep
                    ? "bg-black border-black text-white shadow-lg"
                    : i === currentStep
                    ? "border-black text-black bg-white shadow-md ring-2 ring-gray-200"
                    : "border-gray-300 text-gray-400 bg-gray-50"
                }
                ${onStepClick ? "cursor-pointer hover:scale-105" : ""}
              `}
              onClick={() => onStepClick && i <= currentStep && onStepClick(i)}
            >
              {i < currentStep ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="font-bold">{i + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 mx-4 transition-colors duration-300 ${
                  i < currentStep ? "border-black" : "border-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex text-sm mt-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex-1 text-center font-medium transition-colors duration-300 ${
              i < currentStep 
                ? "text-black" 
                : i === currentStep 
                ? "text-black font-semibold" 
                : "text-gray-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
