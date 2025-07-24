import fs from 'fs/promises';

const API_URL = 'http://localhost:3000/api/rentals';
const OUTPUT_FILE = 'payments.md';

async function fetchAndSavePayments() {
  console.log(`Fetching data from ${API_URL}...`);

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const rentals = await response.json();
    console.log(`Successfully fetched ${rentals.length} rentals.`);

    let markdownContent = '# Payments Data\n\n';
    markdownContent += '| Rental ID | Patient | Payment ID | Amount (TND) | Method | Payment Date | Due Date | Notes |\n';
    markdownContent += '|---|---|---|---|---|---|---|---|\n';

    let paymentCount = 0;
    for (const rental of rentals) {
      if (rental.payments && rental.payments.length > 0) {
        for (const payment of rental.payments) {
          const rentalId = rental.id.slice(-6);
          const patientName = rental.patient.fullName;
          const paymentId = payment.id.slice(-6);
          const amount = payment.amount.toFixed(2);
          const method = payment.type || 'N/A';
          const paymentDate = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('fr-CA') : 'N/A';
          const dueDate = payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('fr-CA') : 'N/A';
          const notes = payment.notes || '';

          markdownContent += `| ${rentalId} | ${patientName} | ${paymentId} | ${amount} | ${method} | ${paymentDate} | ${dueDate} | ${notes} |\n`;
          paymentCount++;
        }
      }
    }

    if (paymentCount === 0) {
      markdownContent += '| No payment data found | | | | | | | |\n';
    }

    await fs.writeFile(OUTPUT_FILE, markdownContent);
    console.log(`Successfully saved ${paymentCount} payments to ${OUTPUT_FILE}.`);

  } catch (error) {
    console.error('An error occurred:', error.message);
    console.error('Please ensure your local development server is running on http://localhost:3000 before executing this script.');
  }
}

fetchAndSavePayments();
