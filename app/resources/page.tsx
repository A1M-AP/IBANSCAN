import Link from "next/link";
import { getLocale, getServerMessages } from "@/lib/i18n-server";
import { getEditorialCopy, localizedGuides } from "@/lib/localized-content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const c = getEditorialCopy(await getLocale());
  return pageMetadata(c.resourceMeta, c.resourceDescription, "/resources", await getLocale());
}

export default async function ResourcesPage() {
  const t = await getServerMessages();
  const guides = localizedGuides(await getLocale());
  return <div className="page-shell"><header className="page-heading"><p className="eyebrow">{t.resources.eyebrow}</p><h1>{t.resources.title}</h1><p className="muted">{t.resources.intro}</p></header>
    <div className="grid-3 resource-grid">{guides.map((guide) => <article className="card" key={guide.slug}><p className="eyebrow">{guide.category} <span aria-hidden="true">·</span> {guide.readTime}</p><h2><Link href={`/resources/${guide.slug}`}>{guide.title}</Link></h2><p className="muted">{guide.description}</p><Link className="text-link" href={`/resources/${guide.slug}`}>{t.common.readGuide} →</Link></article>)}</div>
    <p className="muted content-callout">{t.resources.disclaimer}</p>
  </div>;
}
