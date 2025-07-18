"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import TabSwitcher from "@/components/admin/dashboard/TabSwitcher";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Patient CRM</h1>
          
          <div className="flex items-center space-x-4">
            {status !== 'loading' && session && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Bienvenue,</span>
                <span className="text-sm font-medium text-gray-900">{session.user?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="ml-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-1">Gérez vos activités quotidiennes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          title="Diagnostics" 
          description="Créer et gérer les diagnostics des patients"
          linkHref="/admin/diagnostics"
          color="from-blue-500 to-blue-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
          stats="Creation des diagnostics"
        />
        
        <DashboardCard 
          title="Ventes" 
          description="Gérer les ventes d'appareils et d'accessoires"
          linkHref="/admin/sales"
          color="from-green-500 to-green-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          stats="Creation des ventes"
        />
        
        <DashboardCard 
          title="Locations" 
          description="Suivre les locations d'appareils et les retours"
          linkHref="/admin/rentals"
          color="from-purple-500 to-purple-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          stats="En cours: 0"
        />
        
        <DashboardCard 
          title="Patients" 
          description="Gérer vos patients"
          linkHref="/admin/patients"
          color="from-yellow-500 to-yellow-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          stats="Total: 0"
        />
        
        <DashboardCard 
          title="Calendrier" 
          description="Gérer les tâches et notifications"
          linkHref="/admin/calendar"
          color="from-indigo-500 to-indigo-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
          stats="Tâches et Notifications"
        />
        
 
        
        <DashboardCard 
          title="Utilisateurs" 
          description="Gérer les comptes utilisateurs du système"
          linkHref="/admin/users"
          color="from-red-500 to-red-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>}
          stats="Tous les utilisateurs"
        />
        
 
        

        </div>
        
        <TabSwitcher />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} Patient CRM. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  linkHref: string;
  color: string;
  icon: React.ReactNode;
  stats: string;
}

function DashboardCard({ title, description, linkHref, color, icon, stats }: DashboardCardProps) {
  return (
    <Link href={linkHref} className="block">
      <div className={`bg-gradient-to-br ${color} text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-lg bg-white/20">
              {icon}
            </div>
            <div className="text-xs font-semibold bg-white/20 rounded-full px-3 py-1">
              {stats}
            </div>
          </div>
          <h2 className="text-xl font-bold mt-4 mb-2">{title}</h2>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
        <div className="bg-black/10 px-6 py-3 flex justify-between items-center">
          <span className="text-sm font-medium">Accéder</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
