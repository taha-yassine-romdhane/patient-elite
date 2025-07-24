"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RevenueData {
  monthly: Array<{ month: string; sales: number; rentals: number; total: number }>;
  yearly: Array<{ year: number; total: number }>;
}

interface RevenueChartProps {
  data: RevenueData;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const maxRevenue = Math.max(...data.monthly.map(d => d.total));
  const totalYearRevenue = data.monthly.reduce((sum, d) => sum + d.total, 0);
  const totalSalesRevenue = data.monthly.reduce((sum, d) => sum + d.sales, 0);
  const totalRentalsRevenue = data.monthly.reduce((sum, d) => sum + d.rentals, 0);

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      {/* Monthly Revenue Chart */}
      <Card className="lg:col-span-2 bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Revenus Mensuels</CardTitle>
          <CardDescription className="text-gray-600">
            Comparaison des revenus par source sur 12 mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthly.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(month.total)}</span>
                </div>
                
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Sales bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300"
                    style={{ width: `${maxRevenue ? (month.sales / maxRevenue) * 100 : 0}%` }}
                  />
                  {/* Rentals bar */}
                  <div
                    className="absolute top-0 bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-300"
                    style={{ 
                      left: `${maxRevenue ? (month.sales / maxRevenue) * 100 : 0}%`,
                      width: `${maxRevenue ? (month.rentals / maxRevenue) * 100 : 0}%`,
                      height: '100%'
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Ventes: {formatCurrency(month.sales)}</span>
                  <span>Locations: {formatCurrency(month.rentals)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Ventes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Locations</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Résumé Annuel</CardTitle>
            <CardDescription className="text-gray-600">
              Performance financière globale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(totalYearRevenue)}
              </div>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Total 2024
              </Badge>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ventes</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(totalSalesRevenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {totalYearRevenue > 0 ? Math.round((totalSalesRevenue / totalYearRevenue) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Locations</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(totalRentalsRevenue)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {totalYearRevenue > 0 ? Math.round((totalRentalsRevenue / totalYearRevenue) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Métriques Clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenu moyen/mois</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(totalYearRevenue / 12)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Meilleur mois</span>
              <span className="font-semibold text-gray-900">
                {data.monthly.reduce((best, current) => 
                  current.total > best.total ? current : best, data.monthly[0]
                )?.month || '-'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Croissance</span>
              <Badge variant="outline" className="border-green-200 text-green-700">
                +12.5%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}