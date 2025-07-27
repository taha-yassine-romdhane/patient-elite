"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, ShoppingCart, Calendar, BarChart3, Shield } from "lucide-react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      title: "Gestion des Patients",
      description: "Base de données complète des patients avec informations médicales, coordonnées, et historique.",
      icon: Users,
      color: "text-black"
    },
    {
      title: "Diagnostics Avancés",
      description: "Enregistrement des résultats polygraphiques (NOX, PORTI) avec calcul automatique de la sévérité.",
      icon: Activity,
      color: "text-black"
    },
    {
      title: "Ventes & Facturation",
      description: "Système de vente d'appareils et accessoires avec gestion des paiements multiples.",
      icon: ShoppingCart,
      color: "text-black"
    },
    {
      title: "Locations d'Appareils",
      description: "Gestion complète des locations avec suivi des retours et rappels de paiement.",
      icon: Calendar,
      color: "text-black"
    },
    {
      title: "Calendrier Intégré",
      description: "Planification des tâches, rappels de paiement et suivi des échéances.",
      icon: BarChart3,
      color: "text-black"
    },
    {
      title: "Rapports & Analytics",
      description: "Tableaux de bord complets avec statistiques et indicateurs de performance.",
      icon: Shield,
      color: "text-black"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6">
              Patients Elite
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Système de gestion médical complet pour diagnostics, ventes et locations d'appareils respiratoires
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                className="bg-black text-white hover:bg-gray-800 h-12 px-8 text-lg"
              >
                <Link href="/login">
                  Accéder au système
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">500+</div>
              <div className="text-gray-600">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">1,200+</div>
              <div className="text-gray-600">Diagnostics</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">800+</div>
              <div className="text-gray-600">Ventes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">300+</div>
              <div className="text-gray-600">Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Fonctionnalités Principales</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les fonctionnalités avancées de notre système de gestion médical
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-black">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    asChild 
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    <Link href="/login">
                      Explorer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Accès Rapide</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Commencez immédiatement avec nos modules principaux
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Gestion Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Accédez à la base de données complète des patients
                </CardDescription>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href="/login">Accéder</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Diagnostics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Enregistrez et analysez les résultats polygraphiques
                </CardDescription>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href="/login">Accéder</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Ventes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Gérez les ventes d'appareils et accessoires
                </CardDescription>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href="/login">Accéder</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Gérez les locations avec suivi complet
                </CardDescription>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
                  <Link href="/login">Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Patients Elite CRM</h3>
            <p className="text-gray-400 mb-6">
              Solution complète pour la gestion médicale spécialisée
            </p>
            <div className="flex justify-center space-x-6">
              <Button asChild variant="link" className="text-gray-400 hover:text-white">
                <Link href="/login">Connexion</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
