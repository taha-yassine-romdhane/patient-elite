import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get a patient for testing
    const patient = await prisma.patient.findFirst();
    
    if (!patient) {
      return NextResponse.json({ error: "No patient found for testing" }, { status: 404 });
    }
    
    // Test results container
    const results = {
      patient: patient,
      saleTest: null as unknown,
      rentalTest: null as unknown,
      error: null as { saleError?: string; rentalError?: string } | null
    };
    
    try {
      // Test creating a sale with accessories
      const sale = await prisma.sale.create({
        data: {
          date: new Date(),
          amount: 100,
          status: "COMPLETED",
          patient: {
            connect: { id: patient.id }
          }
        }
      });
      
      // Create an accessory connected only to the sale
      const saleAccessory = await prisma.accessory.create({
        data: {
          name: "Test Sale Accessory",
          model: "Test Model",
          quantity: 1,
          price: 50,
          sale: { connect: { id: sale.id } }
          // No rental connection
        }
      });
      
      results.saleTest = {
        sale,
        accessory: saleAccessory
      };
    } catch (error) {
      results.error = {
        saleError: String(error)
      };
    }
    
    try {
      // Test creating a rental with accessories
      const rental = await prisma.rental.create({
        data: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          amount: 200,
          status: "PENDING",
          returnStatus: "NOT_RETURNED",
          notes: "Test rental",
          type: "CASH",
          patient: {
            connect: { id: patient.id }
          }
        }
      });
      
      // Create an accessory connected only to the rental
      const rentalAccessory = await prisma.accessory.create({
        data: {
          name: "Test Rental Accessory",
          model: "Test Model",
          quantity: 1,
          price: 25,
          rental: { connect: { id: rental.id } }
          // No sale connection
        }
      });
      
      results.rentalTest = {
        rental,
        accessory: rentalAccessory
      };
    } catch (error) {
      results.error = {
        saleError: results.error?.saleError,
        rentalError: String(error)
      };
    }
    
    return NextResponse.json({
      success: !results.error,
      message: "Schema test completed",
      results
    });
  } catch (error) {
    console.error('Error testing schema:', error);
    return NextResponse.json(
      { message: 'Error testing schema', error: String(error) },
      { status: 500 }
    );
  }
}
