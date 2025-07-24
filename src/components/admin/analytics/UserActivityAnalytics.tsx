"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserCheck, Activity } from 'lucide-react';

interface UserActivityData {
  activeUsers: number;
  totalUsers: number;
  userActivity?: Array<{ user: string; actions: number; lastActive: string; avatar: string }>;
}

interface UserActivityAnalyticsProps {
  data: UserActivityData;
}

export function UserActivityAnalytics({ data }: UserActivityAnalyticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* User Overview Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Tous les comptes enregistrés</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% des utilisateurs actifs ce mois-ci
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activité moyenne</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.userActivity && data.userActivity.length > 0 && data.activeUsers > 0 
              ? Math.round(data.userActivity.reduce((acc, u) => acc + u.actions, 0) / data.activeUsers)
              : 0
            }
          </div>
          <p className="text-xs text-muted-foreground">Actions par utilisateur actif</p>
        </CardContent>
      </Card>

      {/* Recent Activity List */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Activité des utilisateurs</CardTitle>
          <CardDescription>Aperçu de l'activité récente des utilisateurs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.userActivity && data.userActivity.length > 0 ? (
              data.userActivity.sort((a,b) => b.actions - a.actions).map((activity) => (
                <div key={activity.user} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={activity.avatar} alt={activity.user} />
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">Dernière activité: {activity.lastActive}</p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className="text-sm font-semibold">{activity.actions} actions</p>
                      <p className="text-xs text-muted-foreground">Ce mois-ci</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune données d'activité utilisateur disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
