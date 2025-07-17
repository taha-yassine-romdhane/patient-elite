'use client';

import { Technician, Affiliation, Beneficiary } from '@prisma/client';
import { useState, useEffect, FormEvent, useRef, useActionState } from 'react';
import { createPatient } from '@/app/patients/actions';
import { getAllRegionNames, getDelegationsForRegion } from '@/utils/tunisianRegions';

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
}

export default function PatientForm({ 
  technicians, 
  currentTechnicianId, 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: PatientFormProps) {
  const initialState = { message: undefined, errors: {} };
  const [state, dispatch] = useActionState(createPatient, initialState);
  const loggedInUserId = currentTechnicianId || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset submitting state when form submission completes
  useEffect(() => {
    if (state?.errors || state?.message) {
      setIsSubmitting(false);
    }
  }, [state]);

  const [formData, setFormData] = useState<PatientFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };
    }
    return {
      fullName: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
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
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.region) {
      const delegations = getDelegationsForRegion(formData.region);
      setAvailableDelegations(delegations);
      // Reset address if region changed and current address is not valid for new region
      // But don't reset on initial load to preserve existing patient data
      if (!isInitialLoad.current && formData.address && !delegations.includes(formData.address)) {
        setFormData(prev => ({ ...prev, address: '' }));
      }
    } else {
      setAvailableDelegations([]);
      // Reset address if no region selected (but not on initial load)
      if (!isInitialLoad.current && formData.address) {
        setFormData(prev => ({ ...prev, address: '' }));
      }
    }
    isInitialLoad.current = false;
  }, [formData.region, formData.address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';

    let finalValue: string | boolean | number = value;
    if (isNumber) {
      finalValue = value ? parseFloat(value) : 0;
    } else if (name === 'hasCnam') {
      finalValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Only show title if not using the component in a page with its own header */}
      {(initialData || onSubmit) && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {initialData ? 'Modifier le Patient' : 'Nouveau Patient'}
          </h1>
          <p className="text-slate-600">
            {initialData ? 'Modifiez les informations du patient' : 'Saisissez les informations du patient'}
          </p>
        </div>
      )}

      <form 
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          if (onSubmit) {
            e.preventDefault();
            onSubmit(formData);
          } else {
            setIsSubmitting(true);
            const formEl = e.currentTarget;
            const formDataObj = new FormData(formEl);
            if (!formEl.querySelector('input[name="hasCnam"]:checked')) {
                formDataObj.set('hasCnam', 'false');
            }
            dispatch(formDataObj);
          }
        }}
        className="flex flex-col flex-grow"
      >
        <div className="flex-grow bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
          
          {/* Error Display */}
          {state?.message && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.message}
              </div>
            </div>
          )}
          
          {/* Personal Information Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Informations Personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                  Nom et Prénom <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                    state?.errors?.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="Entrez le nom complet" 
                  required 
                  value={formData.fullName} 
                  onChange={handleChange} 
                />
                {state?.errors?.fullName && (
                  <p className="text-sm text-red-600 mt-1">{state.errors.fullName[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                    state?.errors?.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="+216 XX XXX XXX" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
                {state?.errors?.phone && (
                  <p className="text-sm text-red-600 mt-1">{state.errors.phone[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="cin" className="block text-sm font-medium text-slate-700">
                  CIN
                </label>
                <input 
                  type="text" 
                  id="cin" 
                  name="cin" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  placeholder="Carte d'identité nationale" 
                  value={formData.cin || ''} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-slate-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  required 
                  value={formData.date || ''} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Insurance Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Assurance
            </h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Le patient a-t-il la CNAM?
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasCnam" 
                      value="true" 
                      checked={formData.hasCnam === true} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-slate-700">Oui</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasCnam" 
                      value="false" 
                      checked={formData.hasCnam === false} 
                      onChange={handleChange} 
                      className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-slate-700">Non</span>
                  </label>
                </div>
              </div>
              
              {formData.hasCnam && (
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="cnamId" className="block text-sm font-medium text-slate-700">
                      Identifiant CNAM
                    </label>
                    <input 
                      type="text" 
                      id="cnamId" 
                      name="cnamId" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                      placeholder="Numéro d'assuré" 
                      value={formData.cnamId || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Caisse d&apos;affiliation
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="affiliation" 
                          value="CNSS" 
                          checked={formData.affiliation === 'CNSS'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">CNSS</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="affiliation" 
                          value="CNRPS" 
                          checked={formData.affiliation === 'CNRPS'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">CNRPS</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Bénéficiaire
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="beneficiary" 
                          value="SOCIAL_INSURED" 
                          checked={formData.beneficiary === 'SOCIAL_INSURED'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Assuré Social</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="beneficiary" 
                          value="SPOUSE" 
                          checked={formData.beneficiary === 'SPOUSE'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Conjoint</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="beneficiary" 
                          value="CHILD" 
                          checked={formData.beneficiary === 'CHILD'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Enfant</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="beneficiary" 
                          value="ANCESTOR" 
                          checked={formData.beneficiary === 'ANCESTOR'} 
                          onChange={handleChange} 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Ascendant</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Adresse
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="region" className="block text-sm font-medium text-slate-700">
                  Région <span className="text-red-500">*</span>
                </label>
                <select 
                  id="region" 
                  name="region" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  value={formData.region} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Sélectionner une région</option>
                  {getAllRegionNames().map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                  Délégation <span className="text-red-500">*</span>
                </label>
                <select 
                  id="address" 
                  name="address" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  required 
                  disabled={!formData.region} 
                  value={formData.address} 
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une délégation</option>
                  {availableDelegations.map(delegation => (
                    <option key={delegation} value={delegation}>{delegation}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="addressDetails" className="block text-sm font-medium text-slate-700">
                Adresse Détaillée <span className="text-slate-400">(optionnel)</span>
              </label>
              <input 
                type="text" 
                id="addressDetails" 
                name="addressDetails" 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                placeholder="Ex: 123 Rue de la Liberté, Cité El Khadra" 
                value={formData.addressDetails || ''} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Medical & Assignment Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Médical & Attribution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="doctorName" className="block text-sm font-medium text-slate-700">
                  Médecin traitant
                </label>
                <input 
                  type="text" 
                  id="doctorName" 
                  name="doctorName" 
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${
                    state?.errors?.doctorName ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                  placeholder="Nom du médecin traitant" 
                  value={formData.doctorName || ''} 
                  onChange={handleChange} 
                />
                {state?.errors?.doctorName && (
                  <p className="text-sm text-red-600 mt-1">{state.errors.doctorName[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="technicianId" className="block text-sm font-medium text-slate-700">
                  Technicien Attribué <span className="text-red-500">*</span>
                </label>
                <select 
                  id="technicianId" 
                  name="technicianId" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  required 
                  value={formData.technicianId || loggedInUserId} 
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un technicien</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} {tech.id === loggedInUserId && "(Vous)"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="supervisorId" className="block text-sm font-medium text-slate-700">
                  Superviseur <span className="text-slate-400">(optionnel)</span>
                </label>
                <select 
                  id="supervisorId" 
                  name="supervisorId" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                  value={formData.supervisorId || ''} 
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un superviseur</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} {tech.id === loggedInUserId && "(Vous)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          )}
          <button 
            type="submit" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2" 
            disabled={isLoading || isSubmitting}
          >
            {(isLoading || isSubmitting) && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>
              {(isLoading || isSubmitting) ? (initialData ? 'Modification...' : 'Enregistrement...') : (initialData ? 'Modifier' : 'Enregistrer')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}