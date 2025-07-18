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
    
    await prisma.patient.create({
      data: {
        ...finalData,
        createdById: user.id,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Patient.',
    };
  }

  revalidatePath('/patients');
  redirect('/patients/success');
}
