'use client';

import { Technician, Affiliation, Beneficiary } from '@prisma/client';
import { useState, useEffect, FormEvent, useRef, useActionState } from 'react';
import { createPatient } from '@/app/patients/actions';
import { createPatient as createAdminPatient, createPatientForSales } from '@/app/admin/patients/actions';
import { getAllRegionNames, getDelegationsForRegion } from '@/utils/tunisianRegions';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Loader2 } from 'lucide-react';

// Exporting this type to be used in other components
export interface PatientFormData {
  fullName: string;
  phone: string;
  cin?: string;
  date?: string;
  hasCnam: boolean;
  cnamId?: string;
  affiliation?: Affiliation;
  beneficiary?: Beneficiary;
  region: string;
  address: string;
  addressDetails?: string;
  doctorName?: string;
  technicianId?: string;
  supervisorId?: string;
}

interface PatientFormProps {
  technicians: Technician[];
  currentTechnicianId?: string;
  initialData?: PatientFormData;
  onSubmit?: (data: PatientFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  context?: 'admin' | 'employee' | 'sales';
}

export default function PatientForm({ 
  technicians, 
  currentTechnicianId, 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading,
  context = 'employee' 
}: PatientFormProps) {
  const initialState = { message: undefined, errors: {} };
  
  // Select the appropriate action based on context
  const getAction = () => {
    if (context === 'admin') return createAdminPatient;
    if (context === 'sales') return createPatientForSales;
    return createPatient;
  };
  
  const [state, dispatch] = useActionState(getAction(), initialState);
  const loggedInUserId = currentTechnicianId || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset submitting state when form submission completes
  useEffect(() => {
    if (state?.errors || state?.message) {
      setIsSubmitting(false);
    }
  }, [state]);

  // Handle successful patient creation in sales context
  useEffect(() => {
    if (context === 'sales' && onSubmit) {
      const salesState = state as any;
      if (salesState?.success && salesState?.patient) {
        onSubmit(salesState);
      }
    }
  }, [state, context, onSubmit]);

  const [formData, setFormData] = useState<PatientFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      };
    }
    return {
      fullName: '',
      phone: '',
      date: '',
      region: 'Tunis',
      address: '',
      addressDetails: '',
      cin: '',
      hasCnam: false,
      cnamId: '',
      affiliation: Affiliation.CNSS,
      beneficiary: Beneficiary.SOCIAL_INSURED,
      doctorName: '',
      technicianId: loggedInUserId,
      supervisorId: '',
    };
  });

  const [availableDelegations, setAvailableDelegations] = useState<string[]>([]);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.region) {
      const delegations = getDelegationsForRegion(formData.region);
      setAvailableDelegations(delegations);
      if (!isInitialLoad.current && formData.address && !delegations.includes(formData.address)) {
        setFormData(prev => ({ ...prev, address: '' }));
      }
    } else {
      setAvailableDelegations([]);
      if (!isInitialLoad.current && formData.address) {
        setFormData(prev => ({ ...prev, address: '' }));
      }
    }
    isInitialLoad.current = false;
  }, [formData.region, formData.address]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submission triggered', { formData, onSubmit: !!onSubmit });
    
    if (onSubmit) {
      // Direct form submission for modals/custom handlers
      console.log('Using direct onSubmit handler');
      setIsSubmitting(true);
      onSubmit(formData);
    } else {
      // Use form actions for server actions
      console.log('Using server action dispatch');
      setIsSubmitting(true);
      const formEl = e.currentTarget;
      const formDataObj = new FormData(formEl);
      
      // Add form data to FormData object
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.set(key, String(value));
        }
      });
      
      console.log('FormData entries:', Array.from(formDataObj.entries()));
      dispatch(formDataObj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {(initialData || onSubmit) && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Modifier le Patient' : 'Nouveau Patient'}
          </h1>
          <p className="text-gray-600 mt-2">
            {initialData ? 'Modifiez les informations du patient' : 'Saisissez les informations du patient'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {state?.message && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{state.message}</span>
          </div>
        )}
        
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Renseignez les informations de base du patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Nom et Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Entrez le nom complet"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={state?.errors?.fullName ? 'border-red-500' : ''}
                  required
                />
                {state?.errors?.fullName && (
                  <p className="text-sm text-red-600">{state.errors.fullName[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={state?.errors?.phone ? 'border-red-500' : ''}
                  required
                />
                {state?.errors?.phone && (
                  <p className="text-sm text-red-600">{state.errors.phone[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cin">CIN</Label>
                <Input
                  id="cin"
                  name="cin"
                  placeholder="Carte d'identité nationale"
                  value={formData.cin || ''}
                  onChange={(e) => handleInputChange('cin', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Date <span className="text-gray-400">(optionnel)</span></Label>
                <DatePicker
                  id="date"
                  value={formData.date || ''}
                  onChange={(value) => handleInputChange('date', value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Assurance
            </CardTitle>
            <CardDescription>
              Informations sur la couverture sociale du patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Le patient a-t-il la CNAM?</Label>
              <RadioGroup
                name="hasCnam"
                value={formData.hasCnam ? 'true' : 'false'}
                onValueChange={(value) => handleInputChange('hasCnam', value === 'true')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="cnam-yes" />
                  <Label htmlFor="cnam-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="cnam-no" />
                  <Label htmlFor="cnam-no">Non</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.hasCnam && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cnamId">Identifiant CNAM</Label>
                    <Input
                      id="cnamId"
                      name="cnamId"
                      placeholder="Numéro d'assuré"
                      value={formData.cnamId || ''}
                      onChange={(e) => handleInputChange('cnamId', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Caisse d'affiliation</Label>
                    <RadioGroup
                      name="affiliation"
                      value={formData.affiliation || 'CNSS'}
                      onValueChange={(value) => handleInputChange('affiliation', value as Affiliation)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CNSS" id="cnss" />
                        <Label htmlFor="cnss">CNSS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CNRPS" id="cnrps" />
                        <Label htmlFor="cnrps">CNRPS</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Bénéficiaire</Label>
                    <RadioGroup
                      name="beneficiary"
                      value={formData.beneficiary || 'SOCIAL_INSURED'}
                      onValueChange={(value) => handleInputChange('beneficiary', value as Beneficiary)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SOCIAL_INSURED" id="social-insured" />
                        <Label htmlFor="social-insured">Assuré Social</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SPOUSE" id="spouse" />
                        <Label htmlFor="spouse">Conjoint</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CHILD" id="child" />
                        <Label htmlFor="child">Enfant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ANCESTOR" id="ancestor" />
                        <Label htmlFor="ancestor">Ascendant</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Adresse
            </CardTitle>
            <CardDescription>
              Localisation et contact du patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="region">
                  Région <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="region"
                  value={formData.region}
                  onValueChange={(value) => handleInputChange('region', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une région" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllRegionNames().map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Délégation <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="address"
                  value={formData.address}
                  onValueChange={(value) => handleInputChange('address', value)}
                  disabled={!formData.region}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une délégation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDelegations.map(delegation => (
                      <SelectItem key={delegation} value={delegation}>{delegation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressDetails">
                Adresse Détaillée <span className="text-gray-400">(optionnel)</span>
              </Label>
              <Textarea
                id="addressDetails"
                name="addressDetails"
                placeholder="Ex: 123 Rue de la Liberté, Cité El Khadra"
                value={formData.addressDetails || ''}
                onChange={(e) => handleInputChange('addressDetails', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Médical & Attribution
            </CardTitle>
            <CardDescription>
              Informations médicales et attribution du personnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="doctorName">Médecin traitant</Label>
                <Input
                  id="doctorName"
                  name="doctorName"
                  placeholder="Nom du médecin traitant"
                  value={formData.doctorName || ''}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  className={state?.errors?.doctorName ? 'border-red-500' : ''}
                />
                {state?.errors?.doctorName && (
                  <p className="text-sm text-red-600">{state.errors.doctorName[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technicianId">
                  Technicien Attribué <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="technicianId"
                  value={formData.technicianId || loggedInUserId}
                  onValueChange={(value) => handleInputChange('technicianId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name} {tech.id === loggedInUserId && "(Vous)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="supervisorId">
                  Superviseur <span className="text-gray-400">(optionnel)</span>
                </Label>
                <Select
                  name="supervisorId"
                  value={formData.supervisorId || 'none'}
                  onValueChange={(value) => handleInputChange('supervisorId', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un superviseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun superviseur</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name} {tech.id === loggedInUserId && "(Vous)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="min-w-[140px]"
          >
            {(isLoading || isSubmitting) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {(isLoading || isSubmitting) 
              ? (initialData ? 'Modification...' : 'Enregistrement...') 
              : (initialData ? 'Modifier' : 'Enregistrer')
            }
          </Button>
        </div>
      </form>
    </div>
  );
}