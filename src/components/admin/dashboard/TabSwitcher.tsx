"use client";

import { useState } from "react";
import DiagnosticTable from "./DiagnosticTable";
import SalesTable from "./SalesTable";
import RentalsTable from "./RentalsTable";

type Tab = "diagnostics" | "sales" | "rentals";

export default function TabSwitcher() {
  const [activeTab, setActiveTab] = useState<Tab>("diagnostics");

  return (
    <div className="mt-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`${
              activeTab === "diagnostics"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Diagnostics
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`${
              activeTab === "sales"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Ventes
          </button>
          <button
            onClick={() => setActiveTab("rentals")}
            className={`${
              activeTab === "rentals"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Locations
          </button>
        </nav>
      </div>
      <div className="mt-4">
        {activeTab === "diagnostics" && <DiagnosticTable />}
        {activeTab === "sales" && <SalesTable />}
        {activeTab === "rentals" && <RentalsTable />}
      </div>
    </div>
  );
}
