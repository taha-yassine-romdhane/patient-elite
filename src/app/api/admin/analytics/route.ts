import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Patients
    const totalPatients = await prisma.patient.count();
    const newPatientsThisMonth = await prisma.patient.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Rentals
    const totalRentals = await prisma.rental.count();
    const activeRentals = await prisma.rental.count({
      where: { 
        OR: [
          { status: 'COMPLETED', returnStatus: 'NOT_RETURNED' },
          { status: 'PENDING', returnStatus: 'NOT_RETURNED' }
        ]
      },
    });
    const overduePayments = await prisma.payment.count({
      where: { isOverdue: true },
    });

    // Sales
    const totalSales = await prisma.sale.count();
    const totalRevenueSales = await prisma.sale.aggregate({
      _sum: { amount: true },
    });

    // Rentals Revenue
    const totalRevenueRentals = await prisma.rental.aggregate({
      _sum: { amount: true },
    });

    // Diagnostics
    const totalDiagnostics = await prisma.diagnostic.count();
    const diagnosticsThisMonth = await prisma.diagnostic.count({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Users and Activity
    const totalUsers = await prisma.technician.count();
    const recentUsers = await prisma.technician.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    const activeUsers = recentUsers.length;

    // Revenue by month (last 6 months)
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const sales = await prisma.sale.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: monthStart, lte: monthEnd },
        },
      });
      const rentals = await prisma.rental.aggregate({
        _sum: { amount: true },
        where: {
          startDate: { gte: monthStart, lte: monthEnd },
        },
      });
      monthly.push({
        month: monthStart.toLocaleString('fr-TN', { month: 'short' }),
        sales: sales._sum.amount || 0,
        rentals: rentals._sum.amount || 0,
        total: (sales._sum.amount || 0) + (rentals._sum.amount || 0),
      });
    }

    // Compose response
    return NextResponse.json({
      overview: {
        totalPatients,
        totalRentals,
        totalSales,
        totalDiagnostics,
        totalRevenue: (totalRevenueSales._sum.amount || 0) + (totalRevenueRentals._sum.amount || 0),
        activeRentals,
        overduePayments,
        newPatientsThisMonth,
      },
      revenue: {
        monthly,
        yearly: [{ year: now.getFullYear(), total: (totalRevenueSales._sum.amount || 0) + (totalRevenueRentals._sum.amount || 0) }],
      },
      patients: {
        totalPatients,
        newPatientsThisMonth,
        activePatients: totalPatients, // All patients are considered active
        inactivePatients: 0,
        patientsByAge: await getPatientsByAge(),
        patientsByCondition: await getPatientsByCondition(),
        patientGrowth: await getPatientGrowth(),
      },
      rentals: {
        activeRentals,
        totalRentals,
        overduePayments,
        rentalsByStatus: await getRentalsByStatus(),
        rentalRevenue: totalRevenueRentals._sum.amount || 0,
        averageRentalDuration: await getAverageRentalDuration(),
        patientRentals: await getPatientRentalsTimeline(),
        activeRentalsWithProgress: await getActiveRentalsWithProgress(),
        rentalsByPatient: await getRentalsByPatient(),
      },
      diagnostics: {
        totalDiagnostics,
        diagnosticsThisMonth,
        diagnosticsByType: await getDiagnosticsByType(),
        diagnosticsByTechnician: await getDiagnosticsByTechnician(),
      },
      users: {
        totalUsers,
        activeUsers,
        userActivity: recentUsers.map(user => ({
          user: user.name,
          actions: Math.floor(Math.random() * 50) + 1, // Placeholder until real activity tracking
          lastActive: new Date(user.updatedAt).toLocaleDateString('fr-FR'),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Failed to load analytics', details: error }, { status: 500 });
  }
}

// Helper functions for additional analytics
async function getPatientsByAge() {
  try {
    const patients = await prisma.patient.findMany({
      select: { dateOfBirth: true },
    });
    
    const ageGroups = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '80+': 0 };
    
    patients.forEach(patient => {
      if (patient.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        if (age <= 20) ageGroups['0-20']++;
        else if (age <= 40) ageGroups['21-40']++;
        else if (age <= 60) ageGroups['41-60']++;
        else if (age <= 80) ageGroups['61-80']++;
        else ageGroups['80+']++;
      }
    });
    
    return Object.entries(ageGroups).map(([age, count]) => ({ age, count }));
  } catch {
    return [];
  }
}

async function getPatientsByCondition() {
  try {
    const diagnostics = await prisma.diagnostic.groupBy({
      by: ['condition'],
      _count: { condition: true },
      orderBy: { _count: { condition: 'desc' } },
      take: 10,
    });
    
    return diagnostics.map(d => ({
      condition: d.condition || 'Non spécifié',
      count: d._count.condition,
    }));
  } catch {
    return [];
  }
}

async function getPatientGrowth() {
  try {
    const now = new Date();
    const growth = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const count = await prisma.patient.count({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });
      
      growth.push({
        month: monthStart.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        count,
      });
    }
    
    return growth;
  } catch {
    return [];
  }
}

async function getRentalsByStatus() {
  try {
    const statuses = await prisma.rental.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    
    return statuses.map(s => ({
      status: s.status,
      count: s._count.status,
    }));
  } catch {
    return [];
  }
}

async function getAverageRentalDuration() {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        endDate: { not: null },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });
    
    if (rentals.length === 0) return 0;
    
    const totalDays = rentals.reduce((sum, rental) => {
      const start = new Date(rental.startDate);
      const end = new Date(rental.endDate!);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round(totalDays / rentals.length);
  } catch {
    return 0;
  }
}

async function getDiagnosticsByType() {
  try {
    const types = await prisma.diagnostic.groupBy({
      by: ['type'],
      _count: { type: true },
      orderBy: { _count: { type: 'desc' } },
    });
    
    return types.map(t => ({
      type: t.type || 'Non spécifié',
      count: t._count.type,
    }));
  } catch {
    return [];
  }
}

async function getDiagnosticsByTechnician() {
  try {
    const diagnostics = await prisma.diagnostic.groupBy({
      by: ['technicianId'],
      _count: { technicianId: true },
      orderBy: { _count: { technicianId: 'desc' } },
    });
    
    const results = [];
    for (const d of diagnostics) {
      if (d.technicianId) {
        const technician = await prisma.technician.findUnique({
          where: { id: d.technicianId },
          select: { name: true },
        });
        
        results.push({
          technician: technician?.name || 'Inconnu',
          count: d._count.technicianId,
        });
      }
    }
    
    return results;
  } catch {
    return [];
  }
}

// New function to get patient rentals timeline
async function getPatientRentalsTimeline() {
  try {
    const rentals = await prisma.rental.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        returnStatus: true,
        actualReturnDate: true,
        contractNumber: true,
        amount: true,
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        },
        devices: {
          select: {
            name: true,
            model: true,
          }
        },
        accessories: {
          select: {
            name: true,
            model: true,
          }
        }
      },
      orderBy: { startDate: 'desc' },
      take: 50, // Limit to recent rentals
    });

    const now = new Date();
    
    return rentals.map(rental => {
      const startDate = new Date(rental.startDate);
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      const actualReturn = rental.actualReturnDate ? new Date(rental.actualReturnDate) : null;
      
      // Handle open rentals (no endDate)
      let totalDays, daysElapsed, daysRemaining, progressPercentage;
      
      if (endDate) {
        // Closed rental with defined end date
        totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, totalDays - daysElapsed);
        progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
      } else {
        // Open rental - calculate based on start date to now
        totalDays = null; // Undefined duration
        daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = null; // Unknown remaining days
        progressPercentage = null; // Cannot calculate percentage without end date
      }
      
      // Determine status
      let timelineStatus = 'active';
      if (rental.returnStatus === 'RETURNED') {
        timelineStatus = 'completed';
      } else if (rental.status === 'CANCELLED') {
        timelineStatus = 'cancelled';
      } else if (endDate && now > endDate && rental.returnStatus === 'NOT_RETURNED') {
        timelineStatus = 'overdue';
      } else if (!endDate && rental.returnStatus === 'NOT_RETURNED') {
        timelineStatus = 'open'; // New status for open rentals
      }
      
      return {
        id: rental.id,
        contractNumber: rental.contractNumber,
        patient: rental.patient,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        actualReturnDate: actualReturn?.toISOString().split('T')[0],
        status: rental.status,
        returnStatus: rental.returnStatus,
        timelineStatus,
        totalDays,
        daysElapsed: Math.max(0, daysElapsed),
        daysRemaining,
        progressPercentage: Math.round(progressPercentage),
        amount: rental.amount,
        equipment: [
          ...rental.devices.map(d => ({ type: 'device', name: d.name, model: d.model })),
          ...rental.accessories.map(a => ({ type: 'accessory', name: a.name, model: a.model }))
        ]
      };
    });
  } catch (error) {
    console.error('Error getting patient rentals timeline:', error);
    return [];
  }
}

// Function to get active rentals with detailed progress
async function getActiveRentalsWithProgress() {
  try {
    const activeRentals = await prisma.rental.findMany({
      where: {
        OR: [
          { status: 'COMPLETED', returnStatus: { in: ['NOT_RETURNED', 'PARTIALLY_RETURNED'] } },
          { status: 'PENDING', returnStatus: { in: ['NOT_RETURNED', 'PARTIALLY_RETURNED'] } }
        ]
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        contractNumber: true,
        amount: true,
        patient: {
          select: {
            fullName: true,
            phone: true,
          }
        },
        devices: { select: { name: true } },
        accessories: { select: { name: true } }
      },
      orderBy: { startDate: 'desc' }
    });

    const now = new Date();
    
    return activeRentals.map(rental => {
      const startDate = new Date(rental.startDate);
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      
      // Handle open rentals (no endDate)
      let totalDays, daysElapsed, daysRemaining, progressPercentage, isOverdue;
      
      if (endDate) {
        // Closed rental with defined end date
        totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
        isOverdue = now > endDate;
      } else {
        // Open rental - calculate based on start date to now
        totalDays = null; // Undefined duration
        daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        daysRemaining = null; // Unknown remaining days
        progressPercentage = null; // Cannot calculate percentage without end date
        isOverdue = false; // Open rentals cannot be overdue
      }
      
      return {
        id: rental.id,
        contractNumber: rental.contractNumber,
        patient: rental.patient,
        startDate: startDate.toLocaleDateString('fr-FR'),
        endDate: endDate ? endDate.toLocaleDateString('fr-FR') : 'Location ouverte',
        totalDays,
        daysElapsed,
        daysRemaining,
        progressPercentage: progressPercentage ? Math.round(progressPercentage) : null,
        isOverdue,
        amount: rental.amount,
        equipmentCount: rental.devices.length + rental.accessories.length,
        equipmentSummary: [
          ...rental.devices.map(d => d.name),
          ...rental.accessories.map(a => a.name)
        ].slice(0, 3).join(', ') + (rental.devices.length + rental.accessories.length > 3 ? '...' : '')
      };
    });
  } catch (error) {
    console.error('Error getting active rentals with progress:', error);
    return [];
  }
}

// Function to get rentals grouped by patient
async function getRentalsByPatient() {
  try {
    const rentals = await prisma.rental.findMany({
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        returnStatus: true,
        amount: true,
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    // Group by patient
    const patientRentalsMap = new Map();
    
    rentals.forEach(rental => {
      const patientId = rental.patient.id;
      if (!patientRentalsMap.has(patientId)) {
        patientRentalsMap.set(patientId, {
          patient: rental.patient,
          rentals: [],
          totalRentals: 0,
          activeRentals: 0,
          totalRevenue: 0,
          avgDuration: 0
        });
      }
      
      const patientData = patientRentalsMap.get(patientId);
      patientData.rentals.push(rental);
      patientData.totalRentals++;
      patientData.totalRevenue += rental.amount;
      
      if (rental.status === 'COMPLETED' && rental.returnStatus !== 'RETURNED') {
        patientData.activeRentals++;
      }
    });

    // Convert to array and calculate averages
    return Array.from(patientRentalsMap.values())
      .map(patientData => {
        const durations = patientData.rentals
          .filter(r => r.endDate) // Only include rentals with defined end dates
          .map(r => {
            const start = new Date(r.startDate);
            const end = new Date(r.endDate);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          });
        
        patientData.avgDuration = durations.length > 0 
          ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
          : 0; // No average for patients with only open rentals
        
        return patientData;
      })
      .sort((a, b) => b.totalRentals - a.totalRentals)
      .slice(0, 20); // Top 20 patients by rental count
  } catch (error) {
    console.error('Error getting rentals by patient:', error);
    return [];
  }
} 