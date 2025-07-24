"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  Stethoscope, 
  Euro, 
  Calendar,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface OverviewData {
  totalPatients?: number;
  totalRentals?: number;
  totalSales?: number;
  totalDiagnostics?: number;
  totalRevenue?: number;
  activeRentals?: number;
  overduePayments?: number;
  newPatientsThisMonth?: number;
}

interface AnalyticsOverviewProps {
  data: OverviewData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const overviewCards = [
    {
      title: "Total Patients",
      value: (data.totalPatients || 0).toString(),
      icon: Users,
      description: "Patients enregistrés",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "Revenus Totaux",
      value: formatCurrency(data.totalRevenue || 0),
      icon: Euro,
      description: "Ventes + Locations",
      color: "from-green-500 to-green-600",
      textColor: "text-green-600"
    },
    {
      title: "Locations Actives",
      value: (data.activeRentals || 0).toString(),
      icon: Calendar,
      description: `${data.totalRentals || 0} au total`,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600"
    },
    {
      title: "Ventes",
      value: (data.totalSales || 0).toString(),
      icon: ShoppingCart,
      description: "Transactions complétées",
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600"
    },
    {
      title: "Diagnostics",
      value: (data.totalDiagnostics || 0).toString(),
      icon: Stethoscope,
      description: "Analyses effectuées",
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600"
    },
    {
      title: "Nouveaux Patients",
      value: (data.newPatientsThisMonth || 0).toString(),
      icon: UserPlus,
      description: "Ce mois-ci",
      color: "from-teal-500 to-teal-600",
      textColor: "text-teal-600"
    },
    {
      title: "Paiements en Retard",
      value: (data.overduePayments || 0).toString(),
      icon: AlertTriangle,
      description: "Nécessitent attention",
      color: "from-red-500 to-red-600",
      textColor: "text-red-600",
      isAlert: true
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {overviewCards.map((card, index) => (
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-1">
              <div className={`text-2xl font-bold ${card.isAlert && parseInt(card.value || '0') > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {card.value}
              </div>
              <p className="text-xs text-gray-500">
                {card.description}
              </p>
              {card.isAlert && parseInt(card.value || '0') > 0 && (
                <div className="flex items-center text-xs text-red-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Action requise
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}