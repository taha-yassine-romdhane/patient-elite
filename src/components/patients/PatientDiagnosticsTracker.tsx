"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Diagnostic {
  id: number;
  date: string;
  polygraph: string;
  iahResult: number;
  idResult: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientDiagnosticsTrackerProps {
  diagnostics: Diagnostic[];
  patientId: string;
  onDiagnosticUpdate?: () => void;
}

export default function PatientDiagnosticsTracker({ diagnostics }: PatientDiagnosticsTrackerProps) {
  const router = useRouter();
  const [expandedDiagnostic, setExpandedDiagnostic] = useState<number | null>(null);
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort diagnostics by date
  const sortedDiagnostics = [...diagnostics].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Calculate statistics
  const totalDiagnostics = diagnostics.length;
  const latestDiagnostic = sortedDiagnostics[0];
  const firstDiagnostic = sortedDiagnostics[sortedDiagnostics.length - 1];

  // Calculate averages
  const avgIAH = diagnostics.length > 0 ? 
    diagnostics.reduce((sum, d) => sum + d.iahResult, 0) / diagnostics.length : 0;
  const avgID = diagnostics.length > 0 ? 
    diagnostics.reduce((sum, d) => sum + d.idResult, 0) / diagnostics.length : 0;

  // Get equipment usage stats
  const equipmentStats = diagnostics.reduce((acc, diagnostic) => {
    acc[diagnostic.polygraph] = (acc[diagnostic.polygraph] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Analyze trends
  const analyzeTrend = (values: number[]) => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(0, Math.min(3, values.length));
    const older = values.slice(Math.min(3, values.length));
    
    if (recent.length < 2) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.length > 0 ? 
      older.reduce((sum, val) => sum + val, 0) / older.length : recentAvg;
    
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  };

  const iahTrend = analyzeTrend(sortedDiagnostics.map(d => d.iahResult));
  const idTrend = analyzeTrend(sortedDiagnostics.map(d => d.idResult));

  // Get severity classification
  const getIAHSeverity = (iah: number) => {
    if (iah < 5) return { level: 'Normal', color: 'bg-green-100 text-green-800' };
    if (iah < 15) return { level: 'Légère', color: 'bg-yellow-100 text-yellow-800' };
    if (iah < 30) return { level: 'Modérée', color: 'bg-orange-100 text-orange-800' };
    return { level: 'Sévère', color: 'bg-red-100 text-red-800' };
  };

  const getPolygraphColor = (polygraph: string) => {
    switch (polygraph) {
      case 'NOX':
        return 'bg-blue-100 text-blue-800';
      case 'PORTI':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return { icon: '↗', color: 'text-red-600' };
      case 'decreasing':
        return { icon: '↘', color: 'text-green-600' };
      default:
        return { icon: '→', color: 'text-gray-600' };
    }
  };

  const getRecommendation = (diagnostic: Diagnostic) => {
    const severity = getIAHSeverity(diagnostic.iahResult);
    if (severity.level === 'Normal') {
      return 'Surveillance régulière recommandée';
    } else if (severity.level === 'Légère') {
      return 'Considérer un traitement conservateur';
    } else if (severity.level === 'Modérée') {
      return 'Traitement CPAP recommandé';
    } else {
      return 'Traitement CPAP urgent requis';
    }
  };

  if (diagnostics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnostics</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500">Aucun diagnostic enregistré</p>
          <button
            onClick={() => router.push('/employee/diagnostics')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Créer un diagnostic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Diagnostics médicaux</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTrendAnalysis(!showTrendAnalysis)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            {showTrendAnalysis ? 'Masquer' : 'Analyse'} des tendances
          </button>
          <button
            onClick={() => router.push('/employee/diagnostics')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau diagnostic
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total diagnostics</p>
          <p className="text-2xl font-bold text-blue-700">{totalDiagnostics}</p>
          <p className="text-xs text-blue-600">
            {firstDiagnostic && `Depuis ${new Date(firstDiagnostic.date).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">IAH moyen</p>
          <p className="text-2xl font-bold text-green-700">{avgIAH.toFixed(1)}</p>
          <div className="flex items-center text-xs">
            <span className={getTrendIcon(iahTrend).color}>
              {getTrendIcon(iahTrend).icon}
            </span>
            <span className="ml-1 text-green-600">Tendance {iahTrend}</span>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">ID moyen</p>
          <p className="text-2xl font-bold text-purple-700">{avgID.toFixed(1)}</p>
          <div className="flex items-center text-xs">
            <span className={getTrendIcon(idTrend).color}>
              {getTrendIcon(idTrend).icon}
            </span>
            <span className="ml-1 text-purple-600">Tendance {idTrend}</span>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Dernier diagnostic</p>
          <p className="text-lg font-bold text-yellow-700">
            {latestDiagnostic && new Date(latestDiagnostic.date).toLocaleDateString('fr-FR')}
          </p>
          <p className="text-xs text-yellow-600">
            {latestDiagnostic && `IAH: ${latestDiagnostic.iahResult}`}
          </p>
        </div>
      </div>

      {/* Trend Analysis */}
      {showTrendAnalysis && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-700 mb-4">Analyse des tendances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Équipement utilisé</h4>
              <div className="space-y-2">
                {Object.entries(equipmentStats).map(([equipment, count]) => (
                  <div key={equipment} className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPolygraphColor(equipment)}`}>
                      {equipment}
                    </span>
                    <span className="text-sm text-gray-600">{count} fois</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Recommandations</h4>
              <div className="space-y-2 text-sm">
                {latestDiagnostic && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Dernière évaluation:</p>
                    <p className="text-blue-700">{getRecommendation(latestDiagnostic)}</p>
                  </div>
                )}
                {diagnostics.length > 1 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-800">Suivi recommandé:</p>
                    <p className="text-green-700">
                      {avgIAH > 15 ? 'Contrôle tous les 3 mois' : 'Contrôle tous les 6 mois'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Trier par date:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            {sortOrder === 'asc' ? 'Plus ancien d\'abord' : 'Plus récent d\'abord'}
          </button>
        </div>
        <p className="text-sm text-gray-600">{totalDiagnostics} diagnostic(s) au total</p>
      </div>

      {/* Diagnostics Timeline */}
      <div className="space-y-4">
        {sortedDiagnostics.map((diagnostic, index) => {
          const isExpanded = expandedDiagnostic === diagnostic.id;
          const severity = getIAHSeverity(diagnostic.iahResult);
          const isLatest = index === 0 && sortOrder === 'desc';

          return (
            <div key={diagnostic.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`p-4 ${isLatest ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Diagnostic #{diagnostic.id}
                      </h3>
                      {isLatest && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Dernier
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getPolygraphColor(diagnostic.polygraph)}`}>
                        {diagnostic.polygraph}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${severity.color}`}>
                        {severity.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Date:</strong> {new Date(diagnostic.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p>
                        <strong>IAH:</strong> {diagnostic.iahResult} événements/heure
                      </p>
                      <p>
                        <strong>ID:</strong> {diagnostic.idResult}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedDiagnostic(isExpanded ? null : diagnostic.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className={`w-5 h-5 transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t space-y-4">
                  {/* Detailed Results */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Résultats détaillés</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-700">Index d&apos;apnée-hypopnée (IAH)</h5>
                        <p className="text-2xl font-bold text-gray-900">{diagnostic.iahResult}</p>
                        <p className="text-sm text-gray-600">événements par heure</p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${severity.color}`}>
                            {severity.level}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-gray-700">Index de désaturation (ID)</h5>
                        <p className="text-2xl font-bold text-gray-900">{diagnostic.idResult}</p>
                        <p className="text-sm text-gray-600">désaturations par heure</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommandations</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-800">{getRecommendation(diagnostic)}</p>
                    </div>
                  </div>

                  {/* Remarks */}
                  {diagnostic.remarks && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Remarques</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {diagnostic.remarks}
                      </p>
                    </div>
                  )}

                  {/* Comparison with Previous */}
                  {index < sortedDiagnostics.length - 1 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Comparaison avec le diagnostic précédent</h4>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p>
                              <strong>IAH:</strong> {diagnostic.iahResult} vs {sortedDiagnostics[index + 1].iahResult}
                              <span className={`ml-2 ${
                                diagnostic.iahResult > sortedDiagnostics[index + 1].iahResult ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ({diagnostic.iahResult > sortedDiagnostics[index + 1].iahResult ? '+' : ''}{(diagnostic.iahResult - sortedDiagnostics[index + 1].iahResult).toFixed(1)})
                              </span>
                            </p>
                          </div>
                          <div>
                            <p>
                              <strong>ID:</strong> {diagnostic.idResult} vs {sortedDiagnostics[index + 1].idResult}
                              <span className={`ml-2 ${
                                diagnostic.idResult > sortedDiagnostics[index + 1].idResult ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ({diagnostic.idResult > sortedDiagnostics[index + 1].idResult ? '+' : ''}{(diagnostic.idResult - sortedDiagnostics[index + 1].idResult).toFixed(1)})
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 