import { ToolVisual } from "@/components/tool-visual";
import Link from "next/link";

import { getLocalizedTools, toolGroupName } from "@/lib/localized-tools";
import { pageMetadata } from "@/lib/seo";
import { getServerUi, getLocale } from "@/lib/i18n-server";
export async function generateMetadata() {
  const ui = await getServerUi();
  return pageMetadata(
    ui.toolsPage.metadataTitle,
    ui.toolsPage.metadataDescription,
    "/tools",
    await getLocale(),
  );
}
export default async function ToolsPage() {
  const ui = await getServerUi();
  const locale = await getLocale();
  const toolCatalog = getLocalizedTools(locale);
  return (
    <div className="page-shell tools-directory">
      <div className="page-heading">
        <span className="eyebrow">{ui.tools.eyebrow}</span>
        <h1>{ui.tools.title}</h1>
        <p>{ui.tools.description}</p>
      </div>
      {[...new Set(toolCatalog.map((tool) => tool.group))].map((group) => (
        <section key={group} className="tool-group">
          <h2>
            {toolGroupName(group, locale)}
            <span>{toolCatalog.filter((t) => t.group === group).length}</span>
          </h2>
          <div className="grid-3">
            {toolCatalog
              .filter((t) => t.group === group)
              .map((t) => (
                <Link
                  key={t.slug}
                  className="directory-tool-card card"
                  href={`/tools/${t.slug}`}
                >
                  <ToolVisual slug={t.slug} />
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
