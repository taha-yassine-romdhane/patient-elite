"use client";

export default function PatientLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Patient info skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {[...Array(5)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(5)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-5 w-full bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rentals skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
