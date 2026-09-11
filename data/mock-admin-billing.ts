import type { BillingAccount, Invoice, InvoiceLine, PaymentMethod } from "@/types/domain";

const organizationId = "SUB-VODAFONE";

export const mockBillingAccounts: readonly BillingAccount[] = [
  { id: "BILLING-SUB-VODAFONE", subtenantId: organizationId, creditBalance: 0, currency: "USD" },
] as const;

export const mockPaymentMethods: readonly PaymentMethod[] = [
  { id: "PAY-VISA-6442", subtenantId: organizationId, provider: "Visa", last4: "6442", currency: "GBP", expiryMonth: "01", expiryYear: "2028", nameOnCard: "Jane Doe", isPrimary: true, createdAt: "2024-01-02T10:00:00.000Z" },
  { id: "PAY-STRIPE-6442-A", subtenantId: organizationId, provider: "Stripe", last4: "6442", currency: "GBP", expiryMonth: "01", expiryYear: "2028", nameOnCard: "Jane Doe", isPrimary: false, createdAt: "2024-01-03T10:00:00.000Z" },
  { id: "PAY-STRIPE-6442-B", subtenantId: organizationId, provider: "Stripe", last4: "6442", currency: "GBP", expiryMonth: "01", expiryYear: "2028", nameOnCard: "Jane Doe", isPrimary: false, createdAt: "2024-01-04T10:00:00.000Z" },
] as const;

const invoiceLines: readonly InvoiceLine[] = [
  { id: "LINE-1", description: "UK Unlimited LITE - 10 Days", quantity: 1, rate: 3000, lineTotal: 3000 },
  { id: "LINE-2", description: "UK Unlimited LITE - 10 Days", quantity: 1, rate: 3000, lineTotal: 3000 },
  { id: "LINE-3", description: "UK Unlimited LITE - 10 Days", quantity: 1, rate: 1500, lineTotal: 1500 },
  { id: "LINE-4", description: "UK Unlimited LITE - 10 Days", quantity: 1, rate: 1500, lineTotal: 1500 },
] as const;

const invoiceFixture = {
  subtenantId: organizationId,
  invoiceNumber: "2024111834033",
  reference: "INV-057",
  invoiceDate: "01 Aug, 2023",
  dueDate: "15 Aug, 2023",
  tableDate: "2024-04-04 22:07",
  status: "Paid",
  currency: "USD",
  tableTotalDue: 20.88,
  billedTo: { name: "Lifecell", addressLines: ["123 City Road,", "London, Greater London", "GB EC1V 2NX"] },
  billedFrom: { name: "Orbit", addressLines: ["4 The Green, Ste 13521", "Dover, DE 19901", "USA"] },
  issuer: { name: "Orbit, Inc", addressLines: ["4 The Green, Ste 13521", "Dover, DE 19901"], taxId: "005456512346789" },
  lines: invoiceLines,
  subtotal: 9000,
  taxRate: 10,
  tax: 900,
  totalDue: 9900,
  paymentNote: "Please pay within 15 days of receiving this invoice.",
  exchangeRateDisclaimer: "* Total Due converted to GBP based on current mid-market exchange rates, including a 2% foreign exchange fee applicable to GBP payments. Direct bank transfers in USD may be paid with the exact amount shown in Total Due USD",
} as const;

export const mockInvoices: readonly Invoice[] = Array.from({ length: 12 }, (_, index) => ({
  ...invoiceFixture,
  id: `ADMIN-INVOICE-${String(index + 1).padStart(2, "0")}`,
  billedTo: { ...invoiceFixture.billedTo, addressLines: [...invoiceFixture.billedTo.addressLines] },
  billedFrom: { ...invoiceFixture.billedFrom, addressLines: [...invoiceFixture.billedFrom.addressLines] },
  issuer: { ...invoiceFixture.issuer, addressLines: [...invoiceFixture.issuer.addressLines] },
  lines: invoiceLines.map((line) => ({ ...line, id: `${line.id}-${index + 1}` })),
})) satisfies readonly Invoice[];
