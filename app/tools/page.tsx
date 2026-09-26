import Link from "next/link";
import { Icon } from "@/components/icon";
import { getLocalizedTools, toolGroupName } from "@/lib/localized-tools";
import { pageMetadata } from "@/lib/seo";
import { getServerUi, getLocale } from "@/lib/i18n-server";
export async function generateMetadata() { const ui = await getServerUi(); return pageMetadata(ui.toolsPage.metadataTitle, ui.toolsPage.metadataDescription, "/tools", await getLocale()); }
export default async function ToolsPage() {
  const ui = await getServerUi();
  const locale = await getLocale();
  const toolCatalog = getLocalizedTools(locale); return <div className="page-shell tools-directory"><div className="page-heading"><span className="eyebrow">{ui.tools.eyebrow}</span><h1>{ui.tools.title}</h1><p>{ui.tools.description}</p></div>{[...new Set(toolCatalog.map(tool => tool.group))].map(group=><section key={group} className="tool-group"><h2>{toolGroupName(group,locale)}<span>{toolCatalog.filter(t=>t.group===group).length+(group==="Business tools"?1:0)}</span></h2><div className="grid-3">{toolCatalog.filter(t=>t.group===group).map(t=><Link key={t.slug} className="directory-tool-card card" href={`/tools/${t.slug}`}><div><span className="feature-icon"><Icon name={t.icon}/></span><Icon name="upRight" size={17}/></div><h3>{t.name}</h3><p>{t.description}</p></Link>)}{group==="Business tools"&&<Link className="directory-tool-card card" href="/api/playground"><div><span className="feature-icon"><Icon name="terminal"/></span><Icon name="upRight" size={17}/></div><h3>{ui.toolsPage.playgroundTitle}</h3><p>{ui.toolsPage.playgroundDescription}</p></Link>}</div></section>)}</div>; }
