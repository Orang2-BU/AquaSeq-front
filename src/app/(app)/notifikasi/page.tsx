import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowUpRight, BellOff, CheckCheck } from "lucide-react";
import { api } from "@/lib/api";
import { withSession } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { NOTIFICATION_KIND } from "@/lib/notifications";
import { EmptyState } from "@/components/app/empty-state";
import { PageSkeleton } from "@/components/app/page-parts";
import { Icon } from "@/components/ui";
import { openNotification, readAllNotifications } from "./actions";

export const metadata: Metadata = { title: "Notifikasi" };

export default function Page() {
  return (
    <div className="page-enter">
      <Suspense fallback={<PageSkeleton title="Notifikasi" />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}

async function NotificationList() {
  const { items, unread } = await withSession((token) => api.notifications.list(token));
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Notifikasi</h1>
          <p>{unread ? `${unread} belum dibaca` : "Semua sudah dibaca"}</p>
        </div>
        {unread > 0 && (
          <form action={readAllNotifications} className="page-actions">
            <button className="button secondary" type="submit">
              <Icon icon={CheckCheck} />
              Tandai semua dibaca
            </button>
          </form>
        )}
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Belum ada notifikasi"
          text="Tugas baru, laporan teknisi, dan peringatan kolam akan muncul di sini."
        />
      ) : (
        <section className="panel">
          <ul className="row-list">
            {items.map((n) => (
              <li key={n.id}>
                <form action={openNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className={`row-link notification-row ${n.read_at ? "" : "unread"}`}>
                    <span className="unread-dot" aria-hidden="true" />
                    <span className="row-main">
                      <span className="row-title">{n.title}</span>
                      <span className="small muted">
                        {NOTIFICATION_KIND[n.kind]} · {formatDateTime(n.created_at)}
                        {!n.read_at && <span className="sr-only">, belum dibaca</span>}
                      </span>
                    </span>
                    <Icon icon={ArrowUpRight} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
