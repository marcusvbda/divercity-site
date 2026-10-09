export type PartyStatus = "pending" | "confirmed" | "cancelled";
export type ContractStatus =
  | "draft"
  | "pending"
  | "in_review"
  | "signed"
  | "completed"
  | "cancelled";

export type ContractPaymentStatus = "unpaid" | "partial" | "paid";
export type ContractVariableType = "text" | "time" | "number" | "date";

export interface Customer {
  id: number;
  cpf: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplate {
  id: number;
  name: string;
  body: string;
  variables: string[];
  variableTypes: Record<string, ContractVariableType>;
  variableLabels: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PartyPaymentOption = "salon_only" | "salon_and_passports";

export interface Party {
  id: number;
  customerId: number;
  customer: Customer;
  contractTemplateId: number;
  contractTemplate: ContractTemplate;
  date: string;
  dateEnd?: string | null;
  status: PartyStatus;
  contract?: Contract | null;
  childrenCount?: number | null;
  adultsCount?: number | null;
  totalParticipants?: number | null;
  paymentOption?: PartyPaymentOption | null;
  salonPrice?: string | null;
  passportPackagePrice?: string | null;
  passportSinglePrice?: string | null;
  passportSingleCount?: number | null;
  totalPrice?: string | null;
  termsAcceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  partyId: number;
  party?: Party;
  body: string;
  fieldValues: Record<string, string>;
  status: ContractStatus;
  clientToken?: string | null;
  clientLinkOpen: boolean;
  docusignEnvelopeId?: string | null;
  value?: string | null;
  additionalInfo?: string | null;
  paymentStatus: ContractPaymentStatus;
  clientFilledKeys: string[];
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartyWithDetails extends Party {
  customer: Customer;
  contractTemplate: ContractTemplate;
  contract?: Contract | null;
}

export type GuestType = "child" | "adult";
export interface Guest {
  id: number;
  partyId: number;
  name: string;
  type: GuestType;
  createdAt: string;
}

export interface Service {
  id: number;
  key?: string | null;
  name: string;
  weekdayPrice: string;
  weekendPrice: string;
  createdAt: string;
  updatedAt: string;
}
