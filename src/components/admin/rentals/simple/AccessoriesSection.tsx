"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

export interface RentalAccessory {
  id: string;
  name: string;
  model: string;
  isFree: boolean;
  notes: string;
}

interface AccessoriesSectionProps {
  accessories: RentalAccessory[];
  onAccessoriesChange: (accessories: RentalAccessory[]) => void;
}

export default function AccessoriesSection({ accessories, onAccessoriesChange }: AccessoriesSectionProps) {
  const addAccessory = () => {
    const newAccessory: RentalAccessory = {
      id: Date.now().toString(),
      name: "",
      model: "",
      isFree: true, // Default to free
      notes: ""
    };
    onAccessoriesChange([...accessories, newAccessory]);
  };

  const updateAccessory = (id: string, field: keyof RentalAccessory, value: string | boolean) => {
    const updatedAccessories = accessories.map(accessory => {
      if (accessory.id === id) {
        return { ...accessory, [field]: value };
      }
      return accessory;
    });
    onAccessoriesChange(updatedAccessories);
  };

  const removeAccessory = (id: string) => {
    const updatedAccessories = accessories.filter(a => a.id !== id);
    onAccessoriesChange(updatedAccessories);
  };

  const freeAccessoriesCount = accessories.filter(a => a.isFree).length;
  const paidAccessoriesCount = accessories.filter(a => !a.isFree).length;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Accessoires</h3>
          <div className="flex space-x-2">
            {accessories.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {accessories.length} accessoire{accessories.length > 1 ? 's' : ''}
                {freeAccessoriesCount > 0 && ` (${freeAccessoriesCount} gratuit${freeAccessoriesCount > 1 ? 's' : ''})`}
              </span>
            )}
          </div>
        </div>
        <Button type="button" onClick={addAccessory} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un accessoire
        </Button>
      </div>
      
      {accessories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Aucun accessoire ajouté
        </p>
      ) : (
        <div className="space-y-4">
          {accessories.map((accessory, index) => (
            <div key={accessory.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <span>Accessoire {index + 1}</span>
                  {accessory.isFree && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      GRATUIT
                    </span>
                  )}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAccessory(accessory.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={accessory.name}
                    onChange={(e) => updateAccessory(accessory.id, 'name', e.target.value)}
                    placeholder="ex: Masque nasal"
                    required
                  />
                </div>
                <div>
                  <Label>Modèle</Label>
                  <Input
                    value={accessory.model}
                    onChange={(e) => updateAccessory(accessory.id, 'model', e.target.value)}
                    placeholder="ex: AirFit N20"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`free-${accessory.id}`}
                    checked={accessory.isFree}
                    onCheckedChange={(checked) => updateAccessory(accessory.id, 'isFree', !!checked)}
                  />
                  <Label htmlFor={`free-${accessory.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Gratuit
                  </Label>
                </div>
              </div>
              
              <div className="mt-3">
                <Label>Notes</Label>
                <Input
                  value={accessory.notes}
                  onChange={(e) => updateAccessory(accessory.id, 'notes', e.target.value)}
                  placeholder="Notes spécifiques à cet accessoire..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}