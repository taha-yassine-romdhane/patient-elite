"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";

export interface PatientData {
  totalPatients: number;
  newPatientsThisMonth: number;
  activePatients: number;
  inactivePatients: number;
  patientsByAge: Array<{ age: string; count: number }>;
  patientsByCondition: Array<{ condition: string; count: number }>;
  patientGrowth: Array<{ month: string; count: number }>;
}

export function PatientAnalytics({ data: patientData }: { data: PatientData }) {
  if (!patientData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Patient Overview Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patientData.totalPatients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +{patientData.newPatientsThisMonth} ce mois-ci
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patientData.activePatients.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {patientData.totalPatients > 0 ? ((patientData.activePatients / patientData.totalPatients) * 100).toFixed(1) : 0}% du total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <UserPlus className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patientData.newPatientsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Nouveaux patients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{patientData.inactivePatients}</div>
          <p className="text-xs text-muted-foreground">
            {patientData.totalPatients > 0 ? ((patientData.inactivePatients / patientData.totalPatients) * 100).toFixed(1) : 0}% du total
          </p>
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card className="col-span-full md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Patients by Age Group</CardTitle>
          <CardDescription>Distribution of patients across different age ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patientData.patientsByAge && patientData.patientsByAge.length > 0 ? (
              patientData.patientsByAge.map((item) => (
                <div key={item.age} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium w-12">{item.age}</div>
                    <div className="flex-1 bg-secondary rounded-full h-2 max-w-[200px]">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300" 
                        style={{ 
                          width: `${(item.count / Math.max(...patientData.patientsByAge.map(p => p.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Condition Distribution */}
      <Card className="col-span-full md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Patients by Condition</CardTitle>
          <CardDescription>Most common conditions among patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patientData.patientsByCondition && patientData.patientsByCondition.length > 0 ? (
              patientData.patientsByCondition.map((item) => (
                <div key={item.condition} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-[80px] justify-center">
                      {item.condition}
                    </Badge>
                    <div className="flex-1 bg-secondary rounded-full h-2 max-w-[150px]">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300" 
                        style={{ 
                          width: `${(item.count / Math.max(...patientData.patientsByCondition.map(p => p.count))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}