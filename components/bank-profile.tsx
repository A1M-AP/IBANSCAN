"use client";
import type { BankRecord } from "@/lib/banks";
import { useUi } from "./locale-provider";
import { Icon } from "./icon";

export function BankProfile({ bank }: { bank: BankRecord | null }) {
  const ui = useUi();
  const t = ui.bankDetails;
  if (!bank) return <p className="alert">{t.unavailable}</p>;
  return <div className="bank-profile">
    <span className="eyebrow">{t.title}</span>
    <h4>{bank.name}</h4>
    <div className="bank-profile-links">
      {bank.website && <a className="text-link" href={bank.website} target="_blank" rel="noopener noreferrer">{t.website}<Icon name="external" size={13}/></a>}
      {bank.contact && <a className="text-link" href={bank.contact.url} target="_blank" rel="noopener noreferrer">{t.contact}<Icon name="external" size={13}/></a>}
    </div>
    {bank.contact?.phone && <><span className="bank-profile-label">{t.phone}</span><a className="text-link" href={`tel:${bank.contact.phone.replace(/[^+\d]/g, "")}`}>{bank.contact.phone}</a></>}
    {bank.office ? <>
      <span className="bank-profile-label">{bank.office.kind === "headquarters" ? t.headquarters : t.registeredOffice}</span>
      <address>{bank.office.address}</address>
      <p className="fine-print"><a href={bank.office.source} target="_blank" rel="noopener noreferrer">{t.source}<Icon name="external" size={12}/></a> · {t.reviewed} {bank.office.verifiedAt}</p>
      {bank.office.kind !== "headquarters" && <p className="fine-print">{t.addressUnavailable}</p>}
    </> : <p className="fine-print">{t.addressUnavailable}</p>}
    {bank.contact && <p className="fine-print"><a href={bank.contact.source} target="_blank" rel="noopener noreferrer">{t.contact}: {t.source}</a> · {t.reviewed} {bank.contact.verifiedAt}</p>}
    <p className="fine-print">{t.scope}</p>
  </div>;
}
