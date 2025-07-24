"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnalyticsOverview } from "@/components/admin/analytics/AnalyticsOverview";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { PatientAnalytics } from "@/components/admin/analytics/PatientAnalytics";
import { DiagnosticAnalytics } from "@/components/admin/analytics/DiagnosticAnalytics";
import { RentalAnalytics } from "@/components/admin/analytics/RentalAnalytics";
import { UserActivityAnalytics } from "@/components/admin/analytics/UserActivityAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { fetchWithAuth } from "@/lib/apiClient";

interface AnalyticsData {
  overview: any;
  revenue: any;
  patients: any;
  rentals: any;
  diagnostics: any;
  users: any;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = async () => {
    if (refreshing) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/analytics');
      if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
      const analyticsData = await res.json();
      setData(analyticsData);

    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <AdminPageHeader 
          title="Statistiques" 
          description="Chargement des données..."
        />
        <main className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement des statistiques...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <AdminPageHeader 
          title="Statistiques" 
          description="Erreur lors du chargement"
        />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-600 font-medium">{error}</p>
                <Button onClick={handleRefresh} className="mt-4" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-full flex-1 flex-col">
      <AdminPageHeader 
        title="Statistiques et Analytics" 
        description="Vue d'ensemble complète de vos données d'activité"
      >
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm" 
            disabled={refreshing}
            className="border-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={handleExport}
            variant="outline" 
            size="sm"
            className="border-gray-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </AdminPageHeader>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-gray-50">
        <div className="container mx-auto max-w-7xl space-y-8">
          {/* Overview Cards */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vue d'ensemble</h2>
              <p className="text-gray-600 text-sm">Métriques principales de votre activité</p>
            </div>
            <AnalyticsOverview data={data?.overview || {
              totalPatients: 0,
              totalRentals: 0,
              totalSales: 0,
              totalDiagnostics: 0,
              totalRevenue: 0,
              activeRentals: 0,
              overduePayments: 0,
              newPatientsThisMonth: 0
            }} />
          </div>

          {/* Tabs for detailed analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <Tabs defaultValue="revenue" className="">
              <div className="border-b border-gray-200 px-6 pt-6">
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="revenue" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    Revenus
                  </TabsTrigger>
                  <TabsTrigger 
                    value="patients" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    Patients
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rentals" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    Locations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="diagnostics" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    Diagnostics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600 font-medium"
                  >
                    Utilisateurs
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="revenue" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Analyse des revenus</h3>
                    <p className="text-gray-600 text-sm">Évolution des revenus par source et période</p>
                  </div>
                  <RevenueChart data={data?.revenue || { monthly: [], yearly: [] }} />
                </TabsContent>

                <TabsContent value="patients" className="mt-0">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Analyse des patients</h3>
                    <p className="text-gray-600 text-sm">Statistiques détaillées sur votre patientèle</p>
                  </div>
                  <PatientAnalytics data={data?.patients || {
                    totalPatients: 0,
                    newPatientsThisMonth: 0,
                    activePatients: 0,
                    inactivePatients: 0,
                    patientsByAge: [],
                    patientsByCondition: [],
                    patientGrowth: []
                  }} />
                </TabsContent>

                <TabsContent value="rentals" className="mt-0">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Analyse des locations</h3>
                    <p className="text-gray-600 text-sm">Performance et statut des équipements loués</p>
                  </div>
                  <RentalAnalytics data={data?.rentals || {
                    activeRentals: 0,
                    totalRentals: 0,
                    overduePayments: 0,
                    rentalsByStatus: [],
                    rentalRevenue: 0,
                    averageRentalDuration: 0
                  }} />
                </TabsContent>

                <TabsContent value="diagnostics" className="mt-0">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Analyse des diagnostics</h3>
                    <p className="text-gray-600 text-sm">Statistiques sur les examens et diagnostics réalisés</p>
                  </div>
                  <DiagnosticAnalytics data={data?.diagnostics || {
                    totalDiagnostics: 0,
                    diagnosticsThisMonth: 0,
                    diagnosticsByType: [],
                    diagnosticsByTechnician: []
                  }} />
                </TabsContent>

                <TabsContent value="users" className="mt-0">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Activité des utilisateurs</h3>
                    <p className="text-gray-600 text-sm">Suivi de l'activité et performance des utilisateurs</p>
                  </div>
                  <UserActivityAnalytics data={data?.users || {
                    totalUsers: 0,
                    activeUsers: 0,
                    userActivity: []
                  }} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}