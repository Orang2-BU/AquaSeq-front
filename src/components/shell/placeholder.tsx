import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PAGES, matchPage, type PageRoute } from "@/lib/nav";
import { Badge, Icon } from "@/components/ui";

/**
 * Placeholder halaman yang belum dibangun (acuan: starter Soft Op):
 * halaman tetap ada di navigasi, menjelaskan fungsinya, dan punya jalan kembali.
 */
export function Placeholder({ route }: { route: PageRoute }) {
  const page = PAGES[route];
  const back = page.parent ?? (route === "/dasbor" ? null : "/dasbor");
  const backLabel = back ? `Kembali ke ${matchPage(back)?.label ?? "Dasbor"}` : null;
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <h1>{page.label}</h1>
          <p>{page.group}</p>
        </div>
      </div>
      <section className="placeholder-panel">
        <div className="placeholder-card">
          <span className="placeholder-symbol">
            <Icon icon={page.icon} size={32} />
          </span>
          <h2>{page.label}</h2>
          <p>{page.description}</p>
          <Badge>Belum dibangun</Badge>
          {back && (
            <Link className="button secondary" href={back}>
              <Icon icon={ArrowLeft} />
              {backLabel}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
