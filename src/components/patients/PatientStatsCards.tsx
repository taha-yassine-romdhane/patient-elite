import React from 'react';
import { 
  BarChart3, 
  FileText, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react';

interface PatientStatsCardsProps {
  stats: {
    total: number;
    diagnostics: number;
    sales: number;
    rentals: number;
    payments: number;
    totalAmount: number;
    overduePayments: number;
  };
}

const PatientStatsCards: React.FC<PatientStatsCardsProps> = ({ stats }) => {
  const statsData = [
    {
      title: 'Total',
      value: stats.total,
      icon: BarChart3,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Diagnostics',
      value: stats.diagnostics,
      icon: FileText,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Ventes',
      value: stats.sales,
      icon: ShoppingBag,
      color: 'bg-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Locations',
      value: stats.rentals,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Paiements',
      value: stats.payments,
      icon: CreditCard,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Montant total',
      value: `${stats.totalAmount.toLocaleString()} TND`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'En retard',
      value: stats.overduePayments,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 text-white ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientStatsCards;