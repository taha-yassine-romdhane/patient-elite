"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, AlertTriangle, Activity } from 'lucide-react';

interface DiagnosticData {
  totalDiagnostics: number;
  diagnosticsThisMonth: number;
  diagnosticsByType: Array<{ type: string; count: number }>;
  diagnosticsByTechnician: Array<{ technician: string; count: number }>;
}

interface DiagnosticAnalyticsProps {
  data: DiagnosticData;
}

export function DiagnosticAnalytics({ data }: DiagnosticAnalyticsProps) {

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Diagnostic Overview Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des diagnostics</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalDiagnostics.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +{data.diagnosticsThisMonth} ce mois-ci
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Délai d'exécution moyen</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.diagnosticsThisMonth}</div>
          <p className="text-xs text-muted-foreground">Diagnostics ce mois-ci</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Diagnostics (Mois)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.diagnosticsByType.length}</div>
          <p className="text-xs text-muted-foreground">Types de diagnostics différents</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertes critiques</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.diagnosticsByTechnician.length}</div>
          <p className="text-xs text-muted-foreground">Techniciens actifs</p>
        </CardContent>
      </Card>

      {/* Type Distribution */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Diagnostics par type</CardTitle>
          <CardDescription>Distribution des diagnostics par type d'examen.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
           <div className="space-y-4">
            {data.diagnosticsByType && data.diagnosticsByType.length > 0 ? (
              data.diagnosticsByType.map((item) => (
                <div key={item.type} className="flex items-center">
                  <div className="text-sm font-medium w-32 text-right pr-4">{item.type}</div>
                  <div className="flex-1 bg-secondary rounded-full h-4">
                    <div 
                      className={`bg-primary rounded-full h-4 flex items-center justify-end pr-2 text-white text-xs font-bold`}
                      style={{ 
                        width: `${data.totalDiagnostics > 0 ? (item.count / data.totalDiagnostics) * 100 : 0}%` 
                      }}
                    >
                     {data.totalDiagnostics > 0 ? ((item.count / data.totalDiagnostics) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                   <div className="text-sm text-muted-foreground w-12 text-left pl-2">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée de type disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technician Performance */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Performance par technicien</CardTitle>
          <CardDescription>Nombre de diagnostics réalisés par technicien.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.diagnosticsByTechnician && data.diagnosticsByTechnician.length > 0 ? (
              data.diagnosticsByTechnician.sort((a, b) => b.count - a.count).map((item) => (
                <div key={item.technician} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Badge variant="outline" className="text-xs">
                      {item.technician}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{item.count.toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée de technicien disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
