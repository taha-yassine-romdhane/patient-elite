import { prisma } from '@/lib/prisma';
import PatientForm from '@/components/PatientForm';
import Link from 'next/link';

async function getTechnicians() {
  return prisma.technician.findMany();
}

export default async function NewPatientPage() {
  const technicians = await getTechnicians();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/employee/dashboard" className="hover:text-blue-600 transition-colors">
              Patients
            </Link>
            <span>›</span>
            <span className="text-gray-900">Nouveau Patient</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Ajouter un nouveau patient
              </h1>
              <p className="text-gray-600">
                Saisissez les informations du patient pour créer son dossier
              </p>
            </div>
            
            <Link 
              href="/employee/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Retour à la liste</span>
            </Link>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <PatientForm technicians={technicians} />
        </div>
      </div>
    </div>
  );
}
