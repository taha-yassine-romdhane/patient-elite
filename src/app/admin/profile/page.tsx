"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X, Settings, Bell, Lock } from "lucide-react";

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "Administrateur Principal",
    email: "admin@patientelite.com",
    phone: "+33 1 23 45 67 89",
    role: "Super Administrateur",
    department: "Administration",
    joinedDate: "1 Janvier 2023",
    address: "123 Avenue de la République, Paris 75011",
    permissions: "Tous les accès",
    lastLogin: "24 Juillet 2025 à 14:30",
    securityLevel: "Haute"
  });

  const [formData, setFormData] = useState(adminData);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setAdminData(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(adminData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Profil Administrateur</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations d'administrateur et paramètres de sécurité</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Photo de Profil</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/admin-avatar.png" alt={adminData.name} />
                    <AvatarFallback className="bg-black text-white text-2xl">
                      {adminData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-black">{adminData.name}</h3>
                    <Badge className="bg-black text-white mt-2">{adminData.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info Card */}
            <Card className="border-gray-200 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Sécurité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Niveau de sécurité</span>
                  <Badge variant="outline" className="border-black text-black">{adminData.securityLevel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dernière connexion</span>
                  <span className="text-sm text-black">{adminData.lastLogin}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Informations Personnelles</CardTitle>
                      <div className="space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Sauvegarder
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom Complet</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => handleInputChange('role', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Super Administrateur">Super Administrateur</SelectItem>
                            <SelectItem value="Administrateur">Administrateur</SelectItem>
                            <SelectItem value="Médecin">Médecin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="joinedDate">Date d'inscription</Label>
                        <Input
                          id="joinedDate"
                          value={formData.joinedDate}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="permissions">Permissions</Label>
                        <Input
                          id="permissions"
                          value={formData.permissions}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle>Paramètres de Sécurité</CardTitle>
                    <CardDescription>
                      Gérez les paramètres de sécurité de votre compte administrateur
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Mot de passe</h4>
                          <p className="text-sm text-gray-600">Changer votre mot de passe</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Changer
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Authentification à deux facteurs</h4>
                          <p className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Activer
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Sessions actives</h4>
                          <p className="text-sm text-gray-600">Gérez vos sessions de connexion</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle>Préférences de Notifications</CardTitle>
                    <CardDescription>
                      Configurez vos préférences de notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Notifications email</h4>
                          <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Configurer
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Alertes système</h4>
                          <p className="text-sm text-gray-600">Notifications importantes du système</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Configurer
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-black">Rappels de tâches</h4>
                          <p className="text-sm text-gray-600">Notifications pour les tâches en attente</p>
                        </div>
                        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                          Configurer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
