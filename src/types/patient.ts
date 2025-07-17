export type Patient = {
  id: string;
  date: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  addressDetails?: string;
  doctorName?: string;
  technicianId?: string;
  supervisorId?: string;
  createdById?: string | null;
  cin?: string;
  hasCnam?: boolean;
  cnamId?: string;
  affiliation?: string;
  beneficiary?: string;
  createdAt: string;
  updatedAt: string;
  technician?: {
    id: string;
    name: string;
    email: string;
  };
  supervisor?: {
    id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  diagnostics?: Diagnostic[];
  sales?: Sale[];
  rentals?: Rental[];
};

export type Diagnostic = {
  id: number;
  date: string;
  polygraph: "NOX" | "PORTI";
  iahResult: number;
  idResult: number;
  remarks?: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
};

export type Device = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  price: number;
  saleId?: string;
  rentalId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Accessory = {
  id: string;
  name: string;
  model: string;
  quantity: number;
  price: number;
  saleId?: string;
  rentalId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Sale = {
  id: string;
  date: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  type: "CASH" | "CHEQUE" | "TRAITE" | "CNAM" | "VIREMENT" | "MONDAT";
  patientId: string;
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
};

export type Rental = {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  returnStatus: "RETURNED" | "NOT_RETURNED" | "PARTIALLY_RETURNED" | "DAMAGED";
  notes: string;
  actualReturnDate?: string;
  type: "CASH" | "CHEQUE" | "TRAITE" | "CNAM" | "VIREMENT" | "MONDAT";
  patientId: string;
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
  rentalItems: RentalItem[];
  createdAt: string;
  updatedAt: string;
};
export type RentalItem = {
  id: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  device?: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
  };
  accessory?: {
    id: string;
    name: string;
    model: string;
    quantity: number;
  };
  payments: {
    id: string;
    amount: number;
    type: string;
    paymentDate: string;
    periodStartDate?: string;
    periodEndDate?: string;
    notes?: string;
  }[];
};

export type Payment = {
  id: string;
  amount: number;
  type: string;
  paymentDate: string;
  periodStartDate?: string;
  periodEndDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};