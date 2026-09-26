import Link from "next/link";
import { getServerUi } from "@/lib/i18n-server";
export default async function NotFound() {
  const ui = await getServerUi(); return <div className="page-shell page-heading"><span className="eyebrow">404 / IBANSCAN</span><h1>{ui.error.notFoundTitle}</h1><p>{ui.error.notFoundText}</p><Link className="button primary" href="/">{ui.error.home}</Link></div>; }
