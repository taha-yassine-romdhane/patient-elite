import { SALETYPE } from "@prisma/client";
import { RentalAccessory } from "../simple/AccessoriesSection";
import { PaymentInfo } from "../simple/PaymentsSection";

// Enhanced Device interface to include everything per device
export interface EnhancedRentalDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  notes: string;
  // Device-specific dates
  startDate: string;
  endDate: string;
  // Device-specific accessories
  accessories: RentalAccessory[];
  // Device-specific payments
  payments: PaymentInfo[];
  // Device status
  status: string;
  actualReturnDate: string;
}
