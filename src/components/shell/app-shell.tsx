"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { NAVIGATION, PAGES, isActive, matchPage } from "@/lib/nav";
import { Badge, Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { BrandLockup, BrandWordmark } from "./brand";

// Port shell template Soft Op Dashboard (acuan: K-DASP/MilkGraph components/shell/app-shell.tsx).

// Akun, lokasi, dan notifikasi demo; diganti sesi login (T5) dan data API (T8, T40).
const DEMO_USER = { name: "Hendra Kusuma", role: "Pemilik", initials: "HK" };
const LOCATION = { label: "Tambak Sumber Rejeki", area: "Puger, Jember · 12 kolam" };
const NOTIFICATIONS = [
  { title: "Kolam B3 Waspada tinggi (34,8%)", subtitle: "Sampel 23 Okt · pirAB dan TOM naik", href: "/peringatan" },
  { title: "Rizky Pratama melaporkan tugas", subtitle: "Ganti air 20% kolam B3 · 2 foto", href: "/tugas" },
  { title: "Sampel A4-1023 ditolak", subtitle: "PPC di luar rentang · ambil sampel ulang", href: "/lab" },
];

type Panel = "location" | "notifications" | "profile" | "help";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!drawer) return;
    const node = drawerRef.current;
    const trigger = menuButton.current;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (media.matches) setDrawer(false);
    };
    media.addEventListener("change", close);
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      media.removeEventListener("change", close);
      trigger?.focus();
    };
  }, [drawer]);

  const closeDrawer = () => setDrawer(false);
  const openPanel = (next: Panel) => {
    setDrawer(false);
    setPanel(next);
  };

  function renderNavigation(mobile = false) {
    return (
      <>
        <div className="brand-row">
          <Link href="/dasbor" className="brand" aria-label="AquaSeq, ke Dasbor" onClick={closeDrawer}>
            <BrandLockup />
          </Link>
          {mobile && (
            <button className="icon-button" aria-label="Tutup menu" onClick={closeDrawer}>
              <Icon icon={X} />
            </button>
          )}
        </div>
        <Suspense fallback={<NavLinks pathname="" onNavigate={closeDrawer} />}>
          <CurrentNavLinks onNavigate={closeDrawer} />
        </Suspense>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => openPanel("help")} aria-label="Panduan">
            <span className="nav-icon">
              <Icon icon={CircleHelp} size={19} />
            </span>
            <span className="nav-label">Panduan</span>
          </button>
          <button className="account" onClick={() => openPanel("profile")} aria-label={`Lihat akun ${DEMO_USER.name}`}>
            <span className="avatar">{DEMO_USER.initials}</span>
            <span className="account-copy nav-label">
              <strong>{DEMO_USER.name}</strong>
              <span>{DEMO_USER.role}</span>
            </span>
            <Icon icon={ChevronDown} size={15} className="nav-label" />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className={`app-frame ${collapsed === null ? "auto-sidebar" : collapsed ? "collapsed" : "expanded"}`}>
      <a className="skip-link" href="#main-content">
        Lewati ke konten
      </a>
      <aside className="sidebar" id="desktop-navigation">
        {renderNavigation()}
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-start">
            <button
              className="icon-button desktop-toggle"
              aria-label="Buka atau ciutkan sidebar"
              aria-expanded={collapsed === null ? undefined : !collapsed}
              aria-controls="desktop-navigation"
              onClick={() => setCollapsed(collapsed === null ? window.innerWidth >= 1200 : !collapsed)}
            >
              <Icon icon={collapsed === false ? ChevronsLeft : ChevronsRight} />
            </button>
            <button
              ref={menuButton}
              className="icon-button mobile-menu"
              aria-label="Buka menu"
              aria-expanded={drawer}
              aria-controls="mobile-navigation"
              onClick={() => setDrawer(true)}
            >
              <Icon icon={Menu} />
            </button>
            <Link href="/dasbor" className="mobile-brand" aria-label="AquaSeq, ke Dasbor">
              <BrandWordmark />
            </Link>
            <Suspense fallback={<span className="breadcrumb">{LOCATION.label}</span>}>
              <Breadcrumb />
            </Suspense>
          </div>
          <div className="topbar-actions">
            <Badge tone="warn">Data simulasi</Badge>
            <button className="shift-button" onClick={() => setPanel("location")}>
              <Icon icon={MapPin} size={16} />
              <span>{LOCATION.label}</span>
              <Icon icon={ChevronDown} size={14} />
            </button>
            <button
              className="icon-button notification"
              aria-label={`Lihat ${NOTIFICATIONS.length} notifikasi`}
              onClick={() => setPanel("notifications")}
            >
              <Icon icon={Bell} />
              <span>{NOTIFICATIONS.length}</span>
            </button>
            <button className="avatar top-avatar" aria-label="Lihat profil" onClick={() => setPanel("profile")}>
              {DEMO_USER.initials}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            AquaSeq <span className="footer-divider">/</span> Pemantau risiko kolam
          </span>
          <span>
            Model V1-GSI · bukan diagnosis resmi <span className="status-dot" />
          </span>
        </footer>
      </div>
      {drawer && (
        <dialog
          ref={drawerRef}
          id="mobile-navigation"
          aria-label="Menu navigasi"
          className="mobile-drawer"
          onCancel={closeDrawer}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
        >
          <div className="drawer-content">{renderNavigation(true)}</div>
        </dialog>
      )}
      {panel && (
        <Modal
          title={
            { location: "Pilih lokasi", notifications: "Notifikasi", profile: "Profil pengguna", help: "Panduan" }[
              panel
            ]
          }
          onClose={() => setPanel(null)}
        >
          {panel === "location" && (
            <>
              <p className="muted">Data di semua halaman mengikuti lokasi yang dipilih.</p>
              <button className="period-choice" onClick={() => setPanel(null)}>
                <strong>{LOCATION.label}</strong>
                <span>{LOCATION.area}</span>
                <Badge tone="ok">Dipilih</Badge>
              </button>
              <p className="small muted">
                Kelola lokasi di{" "}
                <Link className="text-link" href="/lokasi" onClick={() => setPanel(null)}>
                  halaman Lokasi
                </Link>
                .
              </p>
            </>
          )}
          {panel === "notifications" && (
            <div className="notification-list">
              {NOTIFICATIONS.map((n) => (
                <Link key={n.title} href={n.href} onClick={() => setPanel(null)}>
                  <span>
                    <strong>{n.title}</strong>
                    <span>{n.subtitle}</span>
                  </span>
                  <Icon icon={ArrowUpRight} />
                </Link>
              ))}
            </div>
          )}
          {panel === "profile" && (
            <div className="profile-info">
              <span className="avatar large">{DEMO_USER.initials}</span>
              <h3>{DEMO_USER.name}</h3>
              <p>
                {DEMO_USER.role} · {LOCATION.label}
              </p>
              <Badge tone="warn">Akun demo</Badge>
              <p className="muted">Skor membantu menentukan prioritas kolam. Keputusan tindakan tetap di tanganmu.</p>
              <div className="profile-links">
                <Link className="button secondary" href="/pengaturan" onClick={() => setPanel(null)}>
                  Pengaturan akun
                </Link>
                <Link className="button secondary" href="/notifikasi" onClick={() => setPanel(null)}>
                  Semua notifikasi
                </Link>
                <Link className="button secondary" href="/masuk" onClick={() => setPanel(null)}>
                  Keluar
                </Link>
              </div>
            </div>
          )}
          {panel === "help" && (
            <>
              <p>Alur dari hasil lab sampai tindakan di kolam.</p>
              <ol className="guide-list">
                <li>
                  <strong>Unggah hasil lab</strong>
                  <p>Pilih CSV qPCR, periksa QC plate, cocokkan sampel ke kolam, lalu kirim.</p>
                </li>
                <li>
                  <strong>Baca risiko</strong>
                  <p>Dasbor mengurutkan kolam dari peluang wabah tertinggi beserta rekomendasinya.</p>
                </li>
                <li>
                  <strong>Tugaskan teknisi</strong>
                  <p>Ubah peringatan jadi tugas untuk teknisi pemegang kolam.</p>
                </li>
                <li>
                  <strong>Tutup tugas</strong>
                  <p>Periksa laporan dan foto teknisi, lalu tutup atau minta ulang.</p>
                </li>
              </ol>
              <Badge tone="warn">Semua data adalah simulasi</Badge>
              <p className="small muted">
                <Link className="text-link" href="/bantuan" onClick={() => setPanel(null)}>
                  Buka halaman bantuan
                </Link>
              </p>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// usePathname butuh Suspense di rute ber-param dinamis (Next 16 cacheComponents).
function CurrentNavLinks({ onNavigate }: { onNavigate: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav aria-label="Navigasi utama">
      {NAVIGATION.map(({ group, routes }) => (
        <div className="nav-group" key={group}>
          <p className="group-title nav-label">{group}</p>
          {routes.map((href) => {
            const item = PAGES[href];
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
                title={item.core ? item.label : `${item.label} · Belum dibangun`}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <span className="nav-icon">
                  <Icon icon={item.icon} size={19} />
                </span>
                <span className="nav-label">{item.label}</span>
                {!item.core && <span className="placeholder-dot nav-label" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Breadcrumb() {
  const page = matchPage(usePathname());
  return (
    <span className="breadcrumb">
      {LOCATION.label}
      <span>/</span>
      <strong>{page?.label ?? "Halaman"}</strong>
    </span>
  );
}
