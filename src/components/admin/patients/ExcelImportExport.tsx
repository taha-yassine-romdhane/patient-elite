'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Download, Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PatientFormData } from '@/components/PatientForm';
import { Technician } from '@prisma/client';

interface ExcelImportExportProps {
  patients: any[];
  technicians: Technician[];
  onImport: (patients: PatientFormData[]) => Promise<void>;
  isLoading?: boolean;
}

interface ImportResult {
  success: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
}

const REQUIRED_FIELDS = ['fullName', 'phone', 'region', 'address'];

export default function ExcelImportExport({ 
  patients, 
  technicians, 
  onImport, 
  isLoading 
}: ExcelImportExportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [validatedData, setValidatedData] = useState<PatientFormData[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create name-to-ID lookup maps for technicians
  const technicianNameToId = technicians.reduce((acc, tech) => {
    acc[tech.name.toLowerCase()] = tech.id;
    return acc;
  }, {} as Record<string, string>);

  const exportToExcel = () => {
    // Prepare data with readable names
    const exportData = patients.map((patient) => ({
      'Nom Complet': patient.fullName || '',
      'Téléphone': patient.phone || '',
      'CIN': patient.cin || '',
      'Date': patient.date ? new Date(patient.date).toLocaleDateString('fr-FR') : '',
      'A CNAM': patient.hasCnam ? 'Oui' : 'Non',
      'ID CNAM': patient.cnamId || '',
      'Affiliation': patient.affiliation || '',
      'Bénéficiaire': patient.beneficiary || '',
      'Région': patient.region || '',
      'Délégation': patient.address || '',
      'Adresse Détaillée': patient.addressDetails || '',
      'Médecin Traitant': patient.doctorName || '',
      'Technicien': technicians.find(t => t.id === patient.technicianId)?.name || '',
      'Superviseur': technicians.find(t => t.id === patient.supervisorId)?.name || '',
      'Date Création': patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('fr-FR') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patients');

    // Auto-width columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    const fileName = `patients_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const downloadTemplate = () => {
    const templateData = [{
      'Nom Complet': 'John Doe',
      'Téléphone': '+216 12 345 678',
      'CIN': '12345678',
      'Date': '01/01/1990',
      'A CNAM': 'Oui',
      'ID CNAM': 'CNAM123456',
      'Affiliation': 'CNSS',
      'Bénéficiaire': 'SOCIAL_INSURED',
      'Région': 'Tunis',
      'Délégation': 'Tunis',
      'Adresse Détaillée': '123 Rue de la Liberté',
      'Médecin Traitant': 'Dr. Ahmed Ben Ali',
      'Technicien': technicians[0]?.name || 'Nom Technicien',
      'Superviseur': technicians[0]?.name || 'Nom Superviseur',
    }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Add data validation comments
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!comments'] = {
      'E1': [{ a: 'Excel', t: 'Valeurs: Oui, Non' }],
      'G1': [{ a: 'Excel', t: 'Valeurs: CNSS, CNRPS' }],
      'H1': [{ a: 'Excel', t: 'Valeurs: SOCIAL_INSURED, SPOUSE, CHILD, ANCESTOR' }],
    };

    XLSX.writeFile(wb, 'template_patients.xlsx');
  };

  const validateAndParseExcel = (data: any[]): ImportResult => {
    const results: ImportResult = { success: 0, errors: [] };
    const validPatients: PatientFormData[] = [];

    data.forEach((row, index) => {
      const rowIndex = index + 2; // +2 because Excel is 1-indexed and we skip header
      const patient: any = {};
      let hasErrors = false;

      // Map Excel columns to database fields
      const fieldMapping = {
        'Nom Complet': 'fullName',
        'Téléphone': 'phone',
        'CIN': 'cin',
        'Date': 'date',
        'A CNAM': 'hasCnam',
        'ID CNAM': 'cnamId',
        'Affiliation': 'affiliation',
        'Bénéficiaire': 'beneficiary',
        'Région': 'region',
        'Délégation': 'address',
        'Adresse Détaillée': 'addressDetails',
        'Médecin Traitant': 'doctorName',
        'Technicien': 'technicianName',
        'Superviseur': 'supervisorName',
      };

      // Process each field
      Object.entries(fieldMapping).forEach(([excelField, dbField]) => {
        const value = row[excelField];
        
        if (REQUIRED_FIELDS.includes(dbField) && (!value || value.toString().trim() === '')) {
          results.errors.push({
            row: rowIndex,
            field: excelField,
            message: 'Champ requis manquant',
            data: row
          });
          hasErrors = true;
          return;
        }

        // Handle special field processing
        switch (dbField) {
          case 'hasCnam':
            patient[dbField] = value?.toString().toLowerCase() === 'oui';
            break;

          case 'date':
            if (value) {
              try {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                  throw new Error('Invalid date');
                }
                patient[dbField] = date.toISOString().split('T')[0];
              } catch {
                results.errors.push({
                  row: rowIndex,
                  field: excelField,
                  message: 'Format de date invalide (utilisez DD/MM/YYYY)',
                  data: row
                });
                hasErrors = true;
              }
            }
            break;

          case 'affiliation':
            if (value && !['CNSS', 'CNRPS'].includes(value)) {
              results.errors.push({
                row: rowIndex,
                field: excelField,
                message: 'Valeur invalide. Utilisez: CNSS ou CNRPS',
                data: row
              });
              hasErrors = true;
            } else {
              patient[dbField] = value as any; // Assuming Affiliation is a string or number
            }
            break;

          case 'beneficiary':
            if (value && !['SOCIAL_INSURED', 'SPOUSE', 'CHILD', 'ANCESTOR'].includes(value)) {
              results.errors.push({
                row: rowIndex,
                field: excelField,
                message: 'Valeur invalide. Utilisez: SOCIAL_INSURED, SPOUSE, CHILD, ANCESTOR',
                data: row
              });
              hasErrors = true;
            } else {
              patient[dbField] = value as any; // Assuming Beneficiary is a string or number
            }
            break;

          case 'technicianName':
            if (value) {
              const techId = technicianNameToId[value.toLowerCase()];
              if (techId) {
                patient.technicianId = techId;
              } else {
                results.errors.push({
                  row: rowIndex,
                  field: excelField,
                  message: `Technicien "${value}" introuvable. Noms disponibles: ${technicians.map(t => t.name).join(', ')}`,
                  data: row
                });
                hasErrors = true;
              }
            }
            break;

          case 'supervisorName':
            if (value && value.trim() !== '') {
              const supId = technicianNameToId[value.toLowerCase()];
              if (supId) {
                patient.supervisorId = supId;
              } else {
                results.errors.push({
                  row: rowIndex,
                  field: excelField,
                  message: `Superviseur "${value}" introuvable. Noms disponibles: ${technicians.map(t => t.name).join(', ')}`,
                  data: row
                });
                hasErrors = true;
              }
            }
            break;

          default:
            if (value !== undefined && value !== null) {
              patient[dbField] = value.toString().trim();
            }
        }
      });

      if (!hasErrors) {
        // Set default values for missing optional fields
        patient.hasCnam = patient.hasCnam || false;
        patient.affiliation = patient.affiliation || 'CNSS'; // Assuming default is CNSS
        patient.beneficiary = patient.beneficiary || 'SOCIAL_INSURED'; // Assuming default is SOCIAL_INSURED
        
        validPatients.push(patient as PatientFormData);
        results.success++;
      }
    });

    setValidatedData(validPatients);
    return results;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsValidating(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const results = validateAndParseExcel(jsonData);
      setImportResults(results);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setImportResults({
        success: 0,
        errors: [{ row: 0, field: 'File', message: 'Erreur lors de la lecture du fichier Excel', data: {} }]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (validatedData.length === 0) return;
    
    try {
      await onImport(validatedData);
      setIsImportDialogOpen(false);
      setImportResults(null);
      setValidatedData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les Patients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exporter vers Excel ({patients.length} patients)
            </Button>
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Télécharger le Modèle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importer depuis Excel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Importer des Patients depuis Excel</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="excel-file">Fichier Excel</Label>
                  <Input
                    ref={fileInputRef}
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isValidating || isLoading}
                  />
                  <p className="text-sm text-gray-600">
                    Formats acceptés: .xlsx, .xls
                  </p>
                </div>

                {isValidating && (
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Validation du fichier en cours...</span>
                  </div>
                )}

                {importResults && (
                  <div className="space-y-4">
                    {/* Success Summary */}
                    {importResults.success > 0 && (
                      <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">
                          {importResults.success} patient(s) validé(s) et prêt(s) à être importé(s)
                        </span>
                      </div>
                    )}

                    {/* Errors */}
                    {importResults.errors.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-red-800 font-medium">
                            {importResults.errors.length} erreur(s) détectée(s)
                          </span>
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                              <div className="font-medium text-red-800">
                                Ligne {error.row}, Colonne "{error.field}":
                              </div>
                              <div className="text-red-700">{error.message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Import Button */}
                    {importResults.success > 0 && (
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsImportDialogOpen(false);
                            setImportResults(null);
                            setValidatedData([]);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handleImport}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          {isLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          Importer {importResults.success} Patient(s)
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2 text-sm text-blue-800">
                      <p className="font-medium">Instructions:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Les colonnes requises sont: Nom Complet, Téléphone, Région, Délégation</li>
                        <li>Les noms de techniciens/superviseurs doivent correspondre exactement à ceux de la base</li>
                        <li>Pour les dates, utilisez le format DD/MM/YYYY</li>
                        <li>Pour "A CNAM", utilisez "Oui" ou "Non"</li>
                        <li>Téléchargez le modèle pour voir le format exact</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}