import React from 'react';
import { 
  FileText, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  Eye, 
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

type FilterCategory = "all" | "diagnostics" | "sales" | "rentals" | "payments" | "devices" | "accessories";

interface TableRow {
  id: string;
  date: string;
  type: string;
  category: FilterCategory;
  description: string;
  amount?: number;
  status?: string;
  details: Record<string, any>;
}

interface PatientDetailsTableProps {
  tableData: TableRow[];
}

const PatientDetailsTable: React.FC<PatientDetailsTableProps> = ({ tableData }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "payé":
        return "bg-green-100 text-green-800";
      case "pending":
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "en retard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: FilterCategory) => {
    switch (category) {
      case "diagnostics":
        return "bg-blue-100 text-blue-800";
      case "sales":
        return "bg-green-100 text-green-800";
      case "rentals":
        return "bg-purple-100 text-purple-800";
      case "payments":
        return "bg-yellow-100 text-yellow-800";
      case "devices":
        return "bg-indigo-100 text-indigo-800";
      case "accessories":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: FilterCategory) => {
    switch (category) {
      case "diagnostics":
        return <FileText className="h-4 w-4" />;
      case "sales":
        return <ShoppingBag className="h-4 w-4" />;
      case "rentals":
        return <Package className="h-4 w-4" />;
      case "payments":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "payé":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
      case "en attente":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "en retard":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDetails = (row: TableRow) => {
    const details = [];
    
    if (row.category === 'diagnostics') {
      if (row.details.polygraph) details.push(`Polygraphe: ${row.details.polygraph}`);
      if (row.details.iahResult) details.push(`IAH: ${row.details.iahResult}`);
      if (row.details.idResult) details.push(`ID: ${row.details.idResult}`);
      if (row.details.remarks) details.push(`Remarques: ${row.details.remarks}`);
    } else if (row.category === 'sales') {
      if (row.details.devices?.length > 0) {
        details.push(`Appareils: ${row.details.devices.map((d: any) => d.name).join(', ')}`);
      }
      if (row.details.accessories?.length > 0) {
        details.push(`Accessoires: ${row.details.accessories.map((a: any) => a.name).join(', ')}`);
      }
    } else if (row.category === 'rentals') {
      if (row.details.devices?.length > 0) {
        details.push(`Appareils: ${row.details.devices.map((d: any) => d.name).join(', ')}`);
      }
      if (row.details.returnStatus) details.push(`Statut retour: ${row.details.returnStatus}`);
    } else if (row.category === 'payments') {
      if (row.details.type) details.push(`Type: ${row.details.type}`);
      if (row.details.chequeNumber) details.push(`Chèque: ${row.details.chequeNumber}`);
      if (row.details.cnamStatus) details.push(`CNAM: ${row.details.cnamStatus}`);
      if (row.details.isOverdue) details.push(`Jours de retard: ${row.details.overdueDays || 0}`);
    }
    
    return details;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Type
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Montant
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {row.date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(row.category)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(row.category)}`}>
                      {row.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    <p className="font-medium">{row.description}</p>
                    {formatDetails(row).length > 0 && (
                      <div className="mt-1 space-y-1">
                        {formatDetails(row).map((detail, index) => (
                          <p key={index} className="text-xs text-gray-500 truncate">
                            {detail}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.amount ? (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{row.amount.toLocaleString()} TND</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
            
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => console.log('Row details:', row.details)}
                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 px-2 py-1 rounded"
                  >
                    <Eye className="h-4 w-4" />
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {tableData.length === 0 && (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Aucune donnée trouvée</p>
            <p className="text-gray-400 text-sm mt-2">Ajustez vos filtres ou ajoutez de nouvelles données</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsTable;