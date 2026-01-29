'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import {
  Database,
  ScanSearch,
  Package,
  FileText,
  ArrowRight,
  Camera,
  Library,
} from 'lucide-react';

export default function Dashboard() {
  const [partsCount, setPartsCount] = useState<number | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);
  const [invoicesCount, setInvoicesCount] = useState<number | null>(null);
  const [inventoryItemsCount, setInventoryItemsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.parts.list().then((p) => p.length),
      api.scan.sessions().then((s) => s.length),
      api.invoices.list().then((i) => i.length),
      api.inventory.list().then((inv) => inv.length),
    ])
      .then(([p, s, i, inv]) => {
        setPartsCount(p);
        setSessionsCount(s);
        setInvoicesCount(i);
        setInventoryItemsCount(inv);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Parts Library',
      label: 'DATABASE',
      count: partsCount,
      href: '/library',
      desc: 'Manage part types, size variants, and reference images for recognition.',
      icon: Database,
      cta: 'View catalog',
    },
    {
      title: 'Scan',
      label: 'ACTIVE',
      count: sessionsCount,
      href: '/scan',
      desc: 'Upload images for part recognition. Only unrecognized or low-confidence parts are highlighted.',
      icon: ScanSearch,
      cta: 'Initialize scanning',
    },
    {
      title: 'Inventory',
      label: 'STOCK',
      count: inventoryItemsCount,
      href: '/inventory',
      desc: 'View and adjust quantity on hand per part and size. Track stock levels in real time.',
      icon: Package,
      cta: 'View stock',
    },
    {
      title: 'Invoices',
      label: 'REPORTING',
      count: invoicesCount,
      href: '/invoices',
      desc: 'Create invoices from scan sessions or manually. Line items, totals, and history.',
      icon: FileText,
      cta: 'View invoices',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <p className="text-sm font-medium tracking-widest text-blue-400 uppercase">
          Phase 1 MVP · Web Platform
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Precision{' '}
          <span className="text-blue-400">Intelligence</span>
          {' '}For Parts Control
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Experience the next generation of industrial inventory management. Seamlessly identify, track, and manage components with vision-powered accuracy.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium border-2 border-blue-500 text-blue-400 bg-transparent hover:bg-blue-500/10 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Initialize scanning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors"
          >
            <Library className="w-4 h-4" />
            View catalog
          </Link>
        </div>
      </section>

      {/* Stats / Quick info */}
      <section className="flex flex-wrap justify-center gap-6 text-sm">
        {loading ? (
          <span className="text-slate-500">Loading…</span>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Parts in library</span>
              <span className="font-semibold text-white">{partsCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <ScanSearch className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Scan sessions</span>
              <span className="font-semibold text-white">{sessionsCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Inventory lines</span>
              <span className="font-semibold text-white">{inventoryItemsCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Invoices</span>
              <span className="font-semibold text-white">{invoicesCount ?? 0}</span>
            </div>
          </>
        )}
      </section>

      {/* Cards grid */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-1">Overview</h2>
        <p className="text-slate-500 text-sm mb-6">Access core modules from the dashboard</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="block group">
                <BackgroundGradient containerClassName="h-full">
                  <div className="card-base h-full p-6 flex flex-col group-hover:border-blue-500/40 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium tracking-widest text-blue-400/90 uppercase">
                        {card.label}
                      </span>
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{card.title}</h3>
                    {card.count !== undefined && (
                      <div className="mb-3">
                        {loading ? (
                          <span className="text-blue-400/70 text-2xl font-bold">—</span>
                        ) : (
                          <span className="text-2xl font-bold text-blue-400">{card.count}</span>
                        )}
                        <span className="text-slate-500 text-sm ml-1">
                          {card.count === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-slate-400 leading-relaxed flex-1">
                      {card.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:text-blue-300 group-hover:gap-2 transition-all">
                      {card.cta}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </BackgroundGradient>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
