"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      title: "Gestion des Patients",
      description: "Base de données complète des patients avec informations médicales, coordonnées, et historique.",
      icon: "👥",
      color: "bg-blue-500"
    },
    {
      title: "Diagnostics Avancés",
      description: "Enregistrement des résultats polygraphiques (NOX, PORTI) avec calcul automatique de la sévérité.",
      icon: "🔬",
      color: "bg-indigo-500"
    },
    {
      title: "Ventes & Facturation",
      description: "Système de vente d'appareils et accessoires avec gestion des paiements multiples.",
      icon: "💰",
      color: "bg-green-500"
    },
    {
      title: "Locations d'Appareils",
      description: "Gestion complète des locations avec suivi des retours et rappels de paiement.",
      icon: "📋",
      color: "bg-purple-500"
    },
    {
      title: "Calendrier Intégré",
      description: "Planification des tâches, rappels de paiement et suivi des échéances.",
      icon: "📅",
      color: "bg-orange-500"
    },
    {
      title: "Rapports & Analytics",
      description: "Tableaux de bord complets avec statistiques et indicateurs de performance.",
      icon: "📊",
      color: "bg-pink-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
              Patients Elite
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Système de gestion médical complet pour diagnostics, ventes et locations d&apos;appareils respiratoires
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/login" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Accéder au système
              </Link>
              <Link 
                href="/signup" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-blue-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-slate-600">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">1,200+</div>
              <div className="text-slate-600">Diagnostics</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">800+</div>
              <div className="text-slate-600">Ventes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">300+</div>
              <div className="text-slate-600">Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Carousel */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Fonctionnalités Principales</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Une solution complète pour la gestion de votre cabinet médical spécialisé
            </p>
          </div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0 p-12">
                  <div className="flex flex-col md:flex-row items-center max-w-4xl mx-auto">
                    <div className="mb-8 md:mb-0 md:mr-12">
                      <div className={`w-32 h-32 rounded-full ${feature.color} flex items-center justify-center text-6xl shadow-lg`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                      <p className="text-lg text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Actions Rapides</h2>
            <p className="text-xl text-slate-600">
              Accès direct aux fonctionnalités principales du système
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Diagnostic Card */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Nouveau Diagnostic</h3>
                <p className="text-slate-600 mb-6">
                  Enregistrez les résultats polygraphiques et calculez automatiquement la sévérité IAH.
                </p>
                <Link 
                  href="/employee/diagnostics" 
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold"
                >
                  Commencer
                </Link>
              </div>
            </div>

            {/* Sales Card */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Nouvelle Vente</h3>
                <p className="text-slate-600 mb-6">
                  Enregistrez la vente d&apos;appareils et accessoires avec gestion des paiements.
                </p>
                <Link 
                  href="/employee/sales" 
                  className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold"
                >
                  Vendre
                </Link>
              </div>
            </div>

            {/* Rental Card */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Nouvelle Location</h3>
                <p className="text-slate-600 mb-6">
                  Gérez les locations d&apos;appareils avec suivi des retours et rappels automatiques.
                </p>
                <Link 
                  href="/employee/rentals" 
                  className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold"
                >
                  Louer
                </Link>
              </div>
            </div>

            {/* Patients Card */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Gestion Patients</h3>
                <p className="text-slate-600 mb-6">
                  Consultez et gérez la base de données complète des patients et leur historique.
                </p>
                <Link 
                  href="/employee/patients" 
                  className="block w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-center py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-semibold"
                >
                  Gérer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Patients Elite CRM</h3>
            <p className="text-slate-400 mb-6">
              Solution complète pour la gestion médicale spécialisée
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
