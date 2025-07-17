"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {/* Step circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${
                  i < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : i === currentStep
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-300 text-gray-300"
                }
                ${onStepClick ? "cursor-pointer" : ""}
              `}
              onClick={() => onStepClick && i <= currentStep && onStepClick(i)}
            >
              {i < currentStep ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 ${
                  i < currentStep ? "border-blue-600" : "border-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex text-sm mt-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex-1 text-center ${
              i <= currentStep ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
