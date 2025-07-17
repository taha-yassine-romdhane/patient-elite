"use client";

import { Diagnostic } from "@/types/patient";
import { formatDate } from "@/utils/formatters";

interface PatientDiagnosticsProps {
  diagnostics: Diagnostic[];
}

export default function PatientDiagnostics({ diagnostics }: PatientDiagnosticsProps) {
  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Diagnostics</h2>
        <p className="text-gray-500 italic">Aucun diagnostic disponible pour ce patient.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Diagnostics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Polygraphe
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IAH
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarques
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {diagnostics.map((diagnostic) => (
              <tr key={diagnostic.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(diagnostic.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {diagnostic.polygraph}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {diagnostic.iahResult}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {diagnostic.idResult}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {diagnostic.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
