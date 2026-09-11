"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { Modal } from "@/components/ui/Modal";
import { adminSession } from "@/data/admin-session";
import type { Invoice, NewPaymentMethodInput, PaymentMethod } from "@/types/domain";

const invoiceColumns = ["INVOICE NO", "DATE", "TOTAL DUE", "STATUS"] as const;

function PaymentProviderIcon({ provider }: { provider: PaymentMethod["provider"] }) {
  return <img className="admin-billing-provider-icon" src={provider === "Visa" ? "/assets/admin/payment-visa.png" : "/assets/admin/payment-stripe.png"} alt={provider} width="57" height="41" />;
}

function PaymentMethodMeta({ method }: { method: PaymentMethod }) {
  return <div className="admin-billing-payment-meta"><strong>•••• {method.last4} ({method.currency})</strong><span>expires {method.expiryMonth}/{method.expiryYear}</span></div>;
}

function BillingButton({ children, tone = "primary", type = "button", onClick }: { children: React.ReactNode; tone?: "primary" | "secondary" | "danger"; type?: "button" | "submit"; onClick?: () => void }) {
  return <button className={`admin-billing-button ${tone}`} type={type} onClick={onClick}>{children}</button>;
}

function AddCreditModal({ open, methods, onClose, onSubmit }: { open: boolean; methods: readonly PaymentMethod[]; onClose: () => void; onSubmit: (amount: number, paymentMethodId: string) => void }) {
  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setPaymentMethodId("");
    setSubmitted(false);
  }, [open]);

  const submit = () => {
    const parsed = Number(amount.replace(/[^0-9.]/g, ""));
    setSubmitted(true);
    if (!Number.isFinite(parsed) || parsed <= 0 || !paymentMethodId) return;
    onSubmit(parsed, paymentMethodId);
  };

  return (
    <Modal open={open} title="Add credit balance" onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-billing-modal admin-billing-credit-modal" layerClassName="admin-billing-modal-layer" footer={<><BillingButton tone="secondary" onClick={onClose}>Cancel</BillingButton><BillingButton onClick={submit}>Submit</BillingButton></>}>
      <p className="admin-billing-modal-copy">A processing fee of 3.5% of the Payment Amount will be applied to Credit Card and PayPal payments. Services will be subject to immediate suspension if Payment Amount is returned for any reason.</p>
      <label className="admin-billing-field admin-billing-amount-field"><span>Payment amount</span><span className="admin-billing-amount-row"><input aria-invalid={submitted && (!Number(amount.replace(/[^0-9.]/g, "")) || Number(amount.replace(/[^0-9.]/g, "")) <= 0)} value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="$0.00" /><output>1 USD = 0.82 GBP</output></span></label>
      <fieldset className="admin-billing-method-choice"><legend>Payment method</legend>{methods.map((method) => <label key={method.id}><input type="radio" name="billing-payment-method" value={method.id} checked={paymentMethodId === method.id} onChange={() => setPaymentMethodId(method.id)} /><PaymentProviderIcon provider={method.provider} /><PaymentMethodMeta method={method} /></label>)}{submitted && !paymentMethodId ? <span className="admin-billing-field-error">Select a payment method</span> : null}</fieldset>
    </Modal>
  );
}

function AddPaymentMethodModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (input: NewPaymentMethodInput) => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCardNumber("");
    setExpiryDate("");
    setSecurityCode("");
    setNameOnCard("");
    setSubmitted(false);
  }, [open]);

  const save = () => {
    setSubmitted(true);
    if (cardNumber.replace(/\D/g, "").length < 4 || !expiryDate.trim() || !securityCode.trim() || !nameOnCard.trim()) return;
    onSave({ cardNumber, expiryDate, securityCode, nameOnCard });
  };

  return (
    <Modal open={open} title="Add payment method" onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-billing-modal admin-billing-add-method-modal" layerClassName="admin-billing-modal-layer" footer={<><BillingButton tone="secondary" onClick={onClose}>Cancel</BillingButton><BillingButton onClick={save}>Save</BillingButton></>}>
      <p className="admin-billing-modal-copy">Add a payment method to make payments for services. All fields are required unless marked otherwise. Your payment method will be submitted for verification only. <strong>Payment will not be charged at this time.</strong></p>
      <div className="admin-billing-method-fields">
        <label className="admin-billing-field"><span>Card number</span><input aria-invalid={submitted && cardNumber.replace(/\D/g, "").length < 4} value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9101 1123" /></label>
        <div><label className="admin-billing-field admin-billing-expiry-field"><span>Expiry date</span><input aria-invalid={submitted && !expiryDate.trim()} value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} autoComplete="cc-exp" placeholder="MM/YY" /></label><label className="admin-billing-field"><span>Security code</span><input aria-invalid={submitted && !securityCode.trim()} value={securityCode} onChange={(event) => setSecurityCode(event.target.value)} inputMode="numeric" autoComplete="cc-csc" placeholder="3 digits" /></label></div>
        <label className="admin-billing-field"><span>Name on card</span><input aria-invalid={submitted && !nameOnCard.trim()} value={nameOnCard} onChange={(event) => setNameOnCard(event.target.value)} autoComplete="cc-name" placeholder="J. Smith" /></label>
      </div>
    </Modal>
  );
}

function RemovePaymentMethodModal({ method, onClose, onConfirm }: { method: PaymentMethod | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={Boolean(method)} title="Are you sure you want to remove this payment method?" onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-billing-modal admin-billing-remove-modal" layerClassName="admin-billing-modal-layer" footer={<><BillingButton tone="secondary" onClick={onClose}>Cancel</BillingButton><BillingButton onClick={onConfirm}>Confirm</BillingButton></>}>
      <p className="admin-billing-modal-copy">This will <strong>IMMEDIATELY</strong> and <strong>PERMANENTLY</strong> disable it. To make payments, you will need to add a new payment method.</p>
    </Modal>
  );
}

const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function InvoiceSheet({ invoice }: { invoice: Invoice }) {
  return (
    <article className="admin-billing-invoice-sheet">
      <header className="admin-billing-invoice-head"><div><h3>INVOICE {invoice.invoiceNumber}</h3><span>{invoice.status.toLocaleLowerCase()}</span></div><span className="admin-billing-invoice-logo" role="img" aria-label="Orbit" /></header>
      <div className="admin-billing-invoice-parties"><section><strong>Billed to:</strong><b>{invoice.billedTo.name}</b>{invoice.billedTo.addressLines.map((line) => <span key={line}>{line}</span>)}</section><section><strong>Billed from:</strong><b>{invoice.billedFrom.name}</b>{invoice.billedFrom.addressLines.map((line) => <span key={line}>{line}</span>)}</section><section className="issuer"><b>{invoice.issuer.name}</b>{invoice.issuer.addressLines.map((line) => <span key={line}>{line}</span>)}<span>TAX ID&nbsp; {invoice.issuer.taxId}</span></section></div>
      <div className="admin-billing-invoice-body"><dl><div><dt>Invoice #</dt><dd>AB2324-01</dd></div><div><dt>Invoice date</dt><dd>{invoice.invoiceDate}</dd></div><div><dt>Reference</dt><dd>{invoice.reference}</dd></div><div><dt>Due date</dt><dd>{invoice.dueDate}</dd></div></dl><div><table><thead><tr><th>Services</th><th>Qty</th><th>Rate</th><th>Line total</th></tr></thead><tbody>{invoice.lines.map((line) => <tr key={line.id}><td>{line.description}</td><td>{line.quantity}</td><td>{money(line.rate)}</td><td>{money(line.lineTotal)}</td></tr>)}<tr className="summary"><th colSpan={3}>Subtotal</th><td>{money(invoice.subtotal)}</td></tr><tr className="summary"><th colSpan={3}>Tax ({invoice.taxRate}%)</th><td>{money(invoice.tax)}</td></tr><tr className="total"><th colSpan={3}>Total due</th><td>US$ {invoice.totalDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td></tr></tbody></table><p className="admin-billing-payment-note"><span aria-hidden="true">▣</span>{invoice.paymentNote}</p></div></div>
      <p className="admin-billing-exchange-note">{invoice.exchangeRateDisclaimer}</p>
    </article>
  );
}

function InvoiceModal({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  return (
    <Modal open={Boolean(invoice)} title={invoice ? `Invoice ${invoice.invoiceNumber}` : "Invoice"} onClose={onClose} showClose={false} portal initialFocus="panel" panelClassName="admin-billing-modal admin-billing-invoice-modal" layerClassName="admin-billing-modal-layer admin-billing-invoice-layer" footer={<><BillingButton tone="secondary" onClick={onClose}>Cancel</BillingButton><a className="admin-billing-button primary" href="/assets/admin/invoice-2024111834033.pdf" download="Orbit-Invoice-2024111834033.pdf">Download PDF</a></>}>
      {invoice ? <InvoiceSheet invoice={invoice} /> : null}
    </Modal>
  );
}

export function AdminBillingManagement() {
  const { repository, addCreditForSubtenant, addPaymentMethodForSubtenant, setPrimaryPaymentMethodForSubtenant, removePaymentMethodForSubtenant } = useDomain();
  const organizationId = adminSession.organizationId;
  const account = repository.getBillingAccountForSubtenant(organizationId);
  const methods = repository.getPaymentMethodsForSubtenant(organizationId);
  const invoices = repository.getInvoicesForSubtenant(organizationId);
  const [creditOpen, setCreditOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const [deleting, setDeleting] = useState<PaymentMethod | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [page, setPage] = useState(1);
  const creditMethods = useMemo(() => methods.filter((method) => !method.isPrimary), [methods]);
  const visibleInvoices = page === 1 ? invoices.slice(0, 5) : invoices.slice(10, 12);

  if (!account) return null;

  return (
    <div className="admin-billing-page">
      <header className="admin-billing-heading"><h1>Billing</h1><button className="admin-billing-add-method" type="button" onClick={() => setMethodOpen(true)}>Add payment method</button></header>
      <div className="admin-billing-overview">
        <section className="admin-card admin-billing-credit-card"><h2>Credit balance</h2><output>${account.creditBalance.toFixed(2)} {account.currency}</output><p><strong>Your credit balance is currently overdrafted</strong><span>Please make a payment immediately to prevent service suspension.</span></p><button type="button" onClick={() => setCreditOpen(true)}>Add credit</button></section>
        <section className={`admin-card admin-billing-methods-card${methods.length > 3 ? " has-added-methods" : ""}`}><h2>Payment methods</h2><div className="admin-billing-method-list">{methods.map((method) => <div className="admin-billing-method-row" key={method.id}><span className="admin-billing-method-main"><PaymentProviderIcon provider={method.provider} /><PaymentMethodMeta method={method} /></span>{method.isPrimary ? <span className="admin-billing-primary-label">primary payment method</span> : <span className="admin-billing-method-actions"><BillingButton onClick={() => setPrimaryPaymentMethodForSubtenant(organizationId, method.id)}>Set as primary</BillingButton><BillingButton tone="danger" onClick={() => setDeleting(method)}>Delete</BillingButton></span>}</div>)}</div></section>
      </div>
      <section className="admin-card admin-billing-invoices-card"><header><h2>Invoices</h2></header><div className="admin-billing-table-scroll"><table><thead><tr>{invoiceColumns.map((column) => <th key={column}>{column}<span className="admin-sort-mark" aria-hidden="true" /></th>)}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleInvoices.map((invoice) => <tr key={invoice.id}><td data-label="INVOICE NO"><button type="button" className="admin-billing-invoice-link" onClick={() => setSelectedInvoice(invoice)}>{invoice.invoiceNumber}</button></td><td data-label="DATE">{invoice.tableDate}</td><td data-label="TOTAL DUE">${invoice.tableTotalDue.toFixed(2)}</td><td data-label="STATUS"><span className="admin-billing-paid"><span aria-hidden="true">✓</span>{invoice.status}</span></td><td><button className="admin-billing-view" type="button" onClick={() => setSelectedInvoice(invoice)}>view more</button></td></tr>)}</tbody></table></div><div className="admin-table-footer admin-billing-table-footer"><span className="admin-entries-label">Showing {page === 1 ? "1 to 10" : "11 to 12"} of 12 entries</span><div className="admin-pager" aria-label="Invoice table pages"><button className="admin-pager-button" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(1)}>‹</button><button className={`admin-pager-button${page === 1 ? " active" : ""}`} type="button" aria-current={page === 1 ? "page" : undefined} onClick={() => setPage(1)}>1</button><button className={`admin-pager-button${page === 2 ? " active" : ""}`} type="button" aria-current={page === 2 ? "page" : undefined} onClick={() => setPage(2)}>2</button><button className="admin-pager-button" type="button" aria-label="Next page" disabled={page === 2} onClick={() => setPage(2)}>›</button></div><span /></div></section>
      <AdminFooter />
      <AddCreditModal open={creditOpen} methods={creditMethods} onClose={() => setCreditOpen(false)} onSubmit={(amount, paymentMethodId) => { addCreditForSubtenant(organizationId, amount, paymentMethodId); setCreditOpen(false); }} />
      <AddPaymentMethodModal open={methodOpen} onClose={() => setMethodOpen(false)} onSave={(input) => { addPaymentMethodForSubtenant(organizationId, input); setMethodOpen(false); }} />
      <RemovePaymentMethodModal method={deleting} onClose={() => setDeleting(null)} onConfirm={() => { if (deleting) removePaymentMethodForSubtenant(organizationId, deleting.id); setDeleting(null); }} />
      <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}
