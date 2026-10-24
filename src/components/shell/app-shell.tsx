"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  LogOut,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import type { Role } from "@/lib/api";
import { logout } from "@/lib/auth/actions";
import { openNotification } from "@/app/(app)/notifikasi/actions";
import { selectFarm } from "@/app/(app)/actions";
import { NAVIGATION, PAGES, TECHNICIAN_NAVIGATION, activeRoute, matchPage } from "@/lib/nav";
import { Badge, Icon } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { BrandLockup, BrandWordmark } from "./brand";

// Port shell template Soft Op Dashboard (acuan: K-DASP/MilkGraph components/shell/app-shell.tsx).

export interface ShellAccount {
  name: string;
  initials: string;
  role: Role;
  farms: { id: string; name: string; regency: string; pond_count: number }[];
  currentFarmId?: string;
  /** Lokasi aktif berisi data simulasi (badge di top bar, 08-DESIGN Components). */
  simulated: boolean;
  /** Notifikasi terbaru (P32) dan jumlah yang belum dibaca. */
  notifications: { id: string; title: string; subtitle: string; unread: boolean }[];
  unread: number;
}

const GUIDE: Record<Role, { intro: string; steps: [string, string][] }> = {
  pemilik: {
    intro: "Alur dari hasil lab sampai tindakan di kolam.",
    steps: [
      ["Unggah hasil lab", "Pilih CSV qPCR, periksa QC plate, cocokkan sampel ke kolam, lalu kirim."],
      ["Baca risiko", "Dasbor mengurutkan kolam dari peluang wabah tertinggi beserta rekomendasinya."],
      ["Tugaskan teknisi", "Ubah peringatan jadi tugas untuk teknisi pemegang kolam."],
      ["Tutup tugas", "Periksa laporan dan foto teknisi, lalu tutup atau minta ulang."],
    ],
  },
  teknisi: {
    intro: "Pekerjaan harian di kolam yang kamu pegang.",
    steps: [
      ["Cek tugas hari ini", "Tugas diurutkan dari batas waktu terdekat."],
      ["Catat kimia air", "Isi suhu, pH, DO, dan TAN tiap kolam; NH₃ bebas dihitung otomatis."],
      ["Laporkan tugas", "Tulis catatan dan lampirkan foto saat tugas selesai."],
    ],
  },
};

type Panel = "location" | "notifications" | "profile" | "help";

export function AppShell({ account, children }: { account: ShellAccount; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [switching, startSwitch] = useTransition();
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const home = account.role === "teknisi" ? "/teknisi" : "/dasbor";
  const location = account.farms.find((f) => f.id === account.currentFarmId)?.name ?? "Belum ada lokasi";
  const roleLabel = account.role === "teknisi" ? "Teknisi" : "Pemilik";
  const { notifications, unread } = account;
  const guide = GUIDE[account.role];

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
          <Link href={home} className="brand" aria-label="AquaSeq, ke beranda" onClick={closeDrawer}>
            <BrandLockup />
          </Link>
          {mobile && (
            <button className="icon-button" aria-label="Tutup menu" onClick={closeDrawer}>
              <Icon icon={X} />
            </button>
          )}
        </div>
        <Suspense fallback={<NavLinks role={account.role} pathname="" onNavigate={closeDrawer} />}>
          <CurrentNavLinks role={account.role} onNavigate={closeDrawer} />
        </Suspense>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => openPanel("help")} aria-label="Panduan">
            <span className="nav-icon">
              <Icon icon={CircleHelp} size={19} />
            </span>
            <span className="nav-label">Panduan</span>
          </button>
          <button className="account" onClick={() => openPanel("profile")} aria-label={`Lihat akun ${account.name}`}>
            <span className="avatar">{account.initials}</span>
            <span className="account-copy nav-label">
              <strong>{account.name}</strong>
              <span>{roleLabel}</span>
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
            <Link href={home} className="mobile-brand" aria-label="AquaSeq, ke beranda">
              <BrandWordmark />
            </Link>
            <Suspense fallback={<span className="breadcrumb">{location}</span>}>
              <Breadcrumb location={location} />
            </Suspense>
          </div>
          <div className="topbar-actions">
            {account.simulated && <Badge tone="warn">Data simulasi</Badge>}
            <button className="shift-button" onClick={() => setPanel("location")}>
              <Icon icon={MapPin} size={16} />
              <span>{location}</span>
              <Icon icon={ChevronDown} size={14} />
            </button>
            <button
              className="icon-button notification"
              aria-label={unread ? `Lihat notifikasi, ${unread} belum dibaca` : "Notifikasi"}
              onClick={() => setPanel("notifications")}
            >
              <Icon icon={Bell} />
              {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
            </button>
            <button className="avatar top-avatar" aria-label="Lihat profil" onClick={() => setPanel("profile")}>
              {account.initials}
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
              {account.farms.map((farm) => {
                const selected = farm.id === account.currentFarmId;
                return (
                  <button
                    key={farm.id}
                    className="period-choice"
                    aria-pressed={selected}
                    disabled={switching}
                    onClick={() =>
                      startSwitch(async () => {
                        if (!selected) await selectFarm(farm.id);
                        setPanel(null);
                      })
                    }
                  >
                    <strong>{farm.name}</strong>
                    <span>
                      {farm.regency} · {farm.pond_count} kolam
                    </span>
                    {selected && <Badge tone="ok">Dipilih</Badge>}
                  </button>
                );
              })}
              {account.farms.length === 0 && <p className="small muted">Belum ada lokasi aktif.</p>}
              {account.role === "pemilik" && (
                <p className="small muted">
                  Kelola lokasi di{" "}
                  <Link className="text-link" href="/lokasi" onClick={() => setPanel(null)}>
                    halaman Lokasi
                  </Link>
                  .
                </p>
              )}
            </>
          )}
          {panel === "notifications" && (
            <div className="notification-list">
              {notifications.length === 0 && <p className="muted">Belum ada notifikasi.</p>}
              {notifications.map((n) => (
                <form key={n.id} action={openNotification} onSubmit={() => setPanel(null)}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className={n.unread ? "unread" : undefined}>
                    <span>
                      <strong>{n.title}</strong>
                      <span>{n.subtitle}</span>
                    </span>
                    <Icon icon={ArrowUpRight} />
                  </button>
                </form>
              ))}
              <Link className="text-link small" href="/notifikasi" onClick={() => setPanel(null)}>
                Semua notifikasi
              </Link>
            </div>
          )}
          {panel === "profile" && (
            <div className="profile-info">
              <span className="avatar large">{account.initials}</span>
              <h3>{account.name}</h3>
              <p>
                {roleLabel} · {location}
              </p>
              <p className="muted">Skor membantu menentukan prioritas kolam. Keputusan tindakan tetap di tanganmu.</p>
              <div className="profile-links">
                <Link className="button secondary" href="/pengaturan" onClick={() => setPanel(null)}>
                  Pengaturan akun
                </Link>
                {account.role === "pemilik" && (
                  <>
                    <Link className="button secondary" href="/pengaturan/tambak" onClick={() => setPanel(null)}>
                      Pengaturan tambak
                    </Link>
                    <Link className="button secondary" href="/aktivitas" onClick={() => setPanel(null)}>
                      Log aktivitas
                    </Link>
                  </>
                )}
                <form action={logout}>
                  <button className="button secondary wide" type="submit">
                    <Icon icon={LogOut} />
                    Keluar
                  </button>
                </form>
              </div>
            </div>
          )}
          {panel === "help" && (
            <>
              <p>{guide.intro}</p>
              <ol className="guide-list">
                {guide.steps.map(([title, text]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
              <Badge tone="warn">Semua data adalah simulasi</Badge>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// usePathname butuh Suspense di rute ber-param dinamis (Next 16 cacheComponents).
function CurrentNavLinks({ role, onNavigate }: { role: Role; onNavigate: () => void }) {
  return <NavLinks role={role} pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavLinks({ role, pathname, onNavigate }: { role: Role; pathname: string; onNavigate: () => void }) {
  const navigation = role === "teknisi" ? TECHNICIAN_NAVIGATION : NAVIGATION;
  const current = activeRoute(
    pathname,
    navigation.flatMap((g) => g.routes),
  );
  return (
    <nav aria-label="Navigasi utama">
      {navigation.map(({ group, routes }) => (
        <div className="nav-group" key={group}>
          <p className="group-title nav-label">{group}</p>
          {routes.map((href) => {
            const item = PAGES[href];
            const active = href === current;
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

function Breadcrumb({ location }: { location: string }) {
  const page = matchPage(usePathname());
  return (
    <span className="breadcrumb">
      {location}
      <span>/</span>
      <strong>{page?.label ?? "Halaman"}</strong>
    </span>
  );
}
