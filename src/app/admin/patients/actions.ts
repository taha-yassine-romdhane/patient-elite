'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserForServerAction } from '@/lib/serverActionAuth';
import { Affiliation, Beneficiary } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const PatientSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis'),
  cin: z.string().optional(),
  hasCnam: z.boolean().default(false),
  cnamId: z.string().optional(),
  affiliation: z.nativeEnum(Affiliation).optional(),
  beneficiary: z.nativeEnum(Beneficiary).optional(),
  date: z.coerce.date(),
  region: z.string().min(2, 'La région est requise'),
  address: z.string().min(2, "La délégation est requise"),
  addressDetails: z.string().optional(),
  doctorName: z.string().min(3, 'Le nom du médecin est requis'),
  technicianId: z.string().cuid('L\'ID du technicien est invalide'),
  supervisorId: z.string().cuid('L\'ID du superviseur est invalide').optional(),
});

export async function createPatient(prevState: unknown, formData: FormData) {
  const user = await getCurrentUserForServerAction();

  if (!user) {
    return {
      message: 'Unauthorized: You must be logged in to create a patient.',
    };
  }
  // Get the address details (optional)
  const addressDetails = formData.get('addressDetails');
  
  // Get the delegation from the address field
  const delegation = formData.get('address');
  
  // Combine delegation and addressDetails if both exist
  const fullAddress = addressDetails 
    ? `${delegation}, ${addressDetails}` 
    : delegation;
  
  const hasCnam = formData.get('hasCnam') === 'true';

  const validatedFields = PatientSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    cin: formData.get('cin'),
    hasCnam: hasCnam,
    cnamId: hasCnam ? formData.get('cnamId') : undefined,
    affiliation: hasCnam ? formData.get('affiliation') : undefined,
    beneficiary: hasCnam ? formData.get('beneficiary') : undefined,
    date: formData.get('date'),
    region: formData.get('region'),
    address: fullAddress, // Use the combined address
    addressDetails: addressDetails,
    doctorName: formData.get('doctorName'),
    technicianId: formData.get('technicianId'),
    supervisorId: formData.get('supervisorId') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // addressDetails is now a separate field in the schema, so we can include it
    // Only include supervisorId if it's not empty
    const finalData = validatedFields.data.supervisorId 
      ? validatedFields.data 
      : { ...validatedFields.data, supervisorId: undefined };
    
    const patient = await prisma.patient.create({
      data: {
        ...finalData,
        createdById: user.id,
      },
    });

    // Revalidate paths
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/patients');
    
    // For admin context, redirect to admin dashboard instead of success page
    redirect('/admin/dashboard');
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Patient.',
    };
  }
}

// Admin patient creation for dialogs - doesn't redirect, just revalidates and returns success
export async function createPatientDialog(prevState: unknown, formData: FormData) {
  const user = await getCurrentUserForServerAction();

  if (!user) {
    return {
      message: 'Unauthorized: You must be logged in to create a patient.',
    };
  }
  
  // Get the address details (optional)
  const addressDetails = formData.get('addressDetails');
  
  // Get the delegation from the address field
  const delegation = formData.get('address');
  
  // Combine delegation and addressDetails if both exist
  const fullAddress = addressDetails 
    ? `${delegation}, ${addressDetails}` 
    : delegation;
  
  const hasCnam = formData.get('hasCnam') === 'true';

  const validatedFields = PatientSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    cin: formData.get('cin'),
    hasCnam: hasCnam,
    cnamId: hasCnam ? formData.get('cnamId') : undefined,
    affiliation: hasCnam ? formData.get('affiliation') : undefined,
    beneficiary: hasCnam ? formData.get('beneficiary') : undefined,
    date: formData.get('date'),
    region: formData.get('region'),
    address: fullAddress, // Use the combined address
    addressDetails: addressDetails,
    doctorName: formData.get('doctorName'),
    technicianId: formData.get('technicianId'),
    supervisorId: formData.get('supervisorId') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Only include supervisorId if it's not empty
    const finalData = validatedFields.data.supervisorId 
      ? validatedFields.data 
      : { ...validatedFields.data, supervisorId: undefined };
    
    const patient = await prisma.patient.create({
      data: {
        ...finalData,
        createdById: user.id,
      },
    });

    // Revalidate paths to update the UI
    revalidatePath('/admin/patients');
    revalidatePath('/admin/dashboard');
    
    // Return success without redirecting
    return {
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        region: patient.region,
        address: patient.address,
        doctorName: patient.doctorName,
      },
      message: 'Patient créé avec succès!',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Patient.',
    };
  }
}

// Admin-specific patient creation action that doesn't redirect
export async function createPatientForSales(prevState: unknown, formData: FormData) {
  const user = await getCurrentUserForServerAction();

  if (!user) {
    return {
      message: 'Unauthorized: You must be logged in to create a patient.',
    };
  }
  
  // Get the address details (optional)
  const addressDetails = formData.get('addressDetails');
  
  // Get the delegation from the address field
  const delegation = formData.get('address');
  
  // Combine delegation and addressDetails if both exist
  const fullAddress = addressDetails 
    ? `${delegation}, ${addressDetails}` 
    : delegation;
  
  const hasCnam = formData.get('hasCnam') === 'true';

  const validatedFields = PatientSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    cin: formData.get('cin'),
    hasCnam: hasCnam,
    cnamId: hasCnam ? formData.get('cnamId') : undefined,
    affiliation: hasCnam ? formData.get('affiliation') : undefined,
    beneficiary: hasCnam ? formData.get('beneficiary') : undefined,
    date: formData.get('date'),
    region: formData.get('region'),
    address: fullAddress, // Use the combined address
    addressDetails: addressDetails,
    doctorName: formData.get('doctorName'),
    technicianId: formData.get('technicianId'),
    supervisorId: formData.get('supervisorId') || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // addressDetails is now a separate field in the schema, so we can include it
    // Only include supervisorId if it's not empty
    const finalData = validatedFields.data.supervisorId 
      ? validatedFields.data 
      : { ...validatedFields.data, supervisorId: undefined };
    
    const patient = await prisma.patient.create({
      data: {
        ...finalData,
        createdById: user.id,
      },
    });

    // Revalidate paths
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/patients');
    
    // Return success with patient data instead of redirecting
    return {
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        region: patient.region,
        address: patient.address,
        doctorName: patient.doctorName,
      },
      message: 'Patient créé avec succès!',
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Patient.',
    };
  }
}
