import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Ban,
  Bell,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Factory,
  FileSearch,
  Fingerprint,
  Hospital,
  Link2,
  Menu,
  MoonStar,
  QrCode,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Store,
  Sun,
  Timer,
  Truck,
  X,
} from 'lucide-react';

import { useTheme } from '../theme/ThemeContext';

const APK_URL =
  'https://github.com/kalavalashivaharikowshik/pharmaguard-ai/releases/latest/download/PharmaGuard-AI.apk';
const GITHUB_URL = 'https://github.com/kalavalashivaharikowshik/pharmaguard-ai';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const features = [
  {
    icon: Link2,
    title: 'Blockchain traceability',
    text: 'Every batch gets a tamper-proof fingerprint on an Ethereum smart contract. Any change to its data is caught instantly.',
  },
  {
    icon: Ban,
    title: 'Unsafe sales blocked',
    text: 'A scan at the counter checks the chain, recalls, expiry and stock. Recalled, expired or fake medicine cannot be sold.',
  },
  {
    icon: Bot,
    title: 'AI recall agents',
    text: 'Five AI agents find every unit, assign a task with a deadline to each holder, notify them and escalate when late.',
  },
  {
    icon: Timer,
    title: 'Expiry enforcement',
    text: 'Holders are warned 30 days ahead, and expired batches are revoked automatically, on-chain and in the database.',
  },
  {
    icon: Bell,
    title: 'Instant alerts',
    text: 'In-app, push, SMS and email notifications so the right person acts within minutes, not days.',
  },
  {
    icon: ClipboardCheck,
    title: 'Compliance built in',
    text: 'Audit log of every critical action, violation tracking, safety KPIs and exportable compliance reports.',
  },
];

const steps = [
  {
    icon: Factory,
    title: 'Register the batch',
    text: 'The manufacturer creates a batch. Its fingerprint is written to the blockchain and a QR code is issued.',
  },
  {
    icon: Truck,
    title: 'Track every transfer',
    text: 'Stock moves from manufacturer to distributor to pharmacy or hospital, with stock checks and full history.',
  },
  {
    icon: ScanLine,
    title: 'Scan before dispensing',
    text: 'The pharmacist scans the QR and gets an instant verdict: Safe, Expiring soon, Blocked or Counterfeit.',
  },
  {
    icon: ShieldAlert,
    title: 'Recall in minutes',
    text: 'If a batch turns unsafe, it is revoked everywhere and AI agents run the recall until every unit is handled.',
  },
];

const roles = [
  { icon: Factory, name: 'Manufacturers', text: 'Register batches, issue QR codes and launch recalls.' },
  { icon: Truck, name: 'Distributors', text: 'Receive and forward verified stock with full traceability.' },
  { icon: Store, name: 'Pharmacies', text: 'Scan before every sale and act on recall tasks fast.' },
  { icon: Hospital, name: 'Hospitals', text: 'Keep wards supplied with safe, verified medicine.' },
  { icon: FileSearch, name: 'Regulators', text: 'Watch the whole network, violations and recall progress.' },
  { icon: Building2, name: 'Administrators', text: 'Approve organisations and manage access by role.' },
];

const tech = ['React', 'React Native', 'NestJS', 'PostgreSQL', 'Solidity', 'Ethereum', 'Google Gemini', 'LangGraph', 'Redis'];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/logo-mark.svg" alt="" className="h-9 w-9" />
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        PharmaGuard <span className="text-[#2E8B57]">AI</span>
      </span>
    </span>
  );
}

/** Product preview shown in the hero: a scan verdict and an AI recall card. */
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2rem] bg-[#2E8B57]/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#2E8B57] to-[#4CC38A] p-4 text-white">
          <CheckCircle2 className="h-10 w-10 shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Scan result</p>
            <p className="text-xl font-bold">Safe to dispense</p>
          </div>
        </div>
        <div className="mt-4 space-y-2.5 text-sm">
          {[
            ['Medicine', 'Paracetamol 500 mg'],
            ['Batch', 'PCM-2026-0142'],
            ['Expires', 'Aug 2027 · 268 days left'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-[#2E8B57]" />
          Verified on blockchain · 0x7a3f…c91e
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative -mt-6 ml-10 rounded-2xl bg-white p-4 shadow-2xl sm:ml-20"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">AI recall in progress</p>
            <p className="text-xs text-slate-500">Batch AMX-2026-0077 · 12 holders notified</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.2, delay: 0.9 }}
                className="h-full rounded-full bg-[#2E8B57]"
              />
            </div>
            <p className="mt-1 text-xs font-medium text-slate-600">9 of 12 quarantined</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Simple phone mock for the mobile app section. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-64">
      <div className="absolute -inset-8 rounded-full bg-[#0F4C81]/15 blur-3xl" />
      <div className="relative rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        <div className="overflow-hidden rounded-[1.8rem] bg-[#F5F7FA]">
          <div className="bg-gradient-to-br from-[#0B3A63] to-[#1A6FB5] px-5 pb-6 pt-8 text-white">
            <p className="text-xs opacity-80">Good morning</p>
            <p className="text-lg font-bold">Apollo Pharmacy</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ['1,240', 'Units'],
                ['2', 'Recalls'],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-white/15 p-2.5">
                  <p className="text-lg font-bold">{n}</p>
                  <p className="text-[11px] opacity-80">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2.5 p-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">Recall action required</p>
                <p className="text-[11px] text-slate-500">Due in 23h 41m</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#2E8B57]">
                <Boxes className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">Inventory received</p>
                <p className="text-[11px] text-slate-500">50 units · Cetirizine 10 mg</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center pb-5 pt-1">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2E8B57] to-[#0F4C81] text-white shadow-lg">
              <QrCode className="h-6 w-6" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolved, setMode } = useTheme();
  const nav = [
    ['Features', '#features'],
    ['How it works', '#how'],
    ['Who it is for', '#roles'],
    ['Mobile app', '#app'],
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" aria-label="PharmaGuard AI home">
            <Logo />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="transition hover:text-[#0F4C81] dark:hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Toggle dark mode"
            >
              {resolved === 'dark' ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </button>
            <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-[#0F4C81] transition hover:bg-slate-100 sm:block dark:text-[#9CC4E8]">
              Sign in
            </Link>
            <Link
              to="/register"
              className="hidden rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c3f6b] sm:block"
            >
              Get started
            </Link>
            <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {nav.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-slate-50">
                  {label}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="rounded-lg border border-slate-300 px-4 py-2.5 text-center font-semibold text-[#0F4C81] dark:text-[#9CC4E8]">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-lg bg-[#0F4C81] px-4 py-2.5 text-center font-semibold text-white">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden bg-gradient-to-br from-[#082842] via-[#0F4C81] to-[#1A6FB5]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <Activity className="h-3.5 w-3.5" /> Blockchain + AI for medicine safety
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Every medicine verified.
              <br />
              <span className="bg-gradient-to-r from-[#4CC38A] to-[#9BE3BE] bg-clip-text text-transparent">Every recall handled.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
              PharmaGuard AI tracks each batch from factory to patient, stops recalled, expired and counterfeit medicine at the counter, and
              lets AI agents run recalls end to end.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2E8B57] px-6 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#246f45]"
              >
                Register your organisation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/20"
              >
                Sign in
              </Link>
            </div>
            <a href={APK_URL} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-100 underline-offset-4 hover:underline">
              <Smartphone className="h-4 w-4" /> Download the Android app
            </a>
          </motion.div>
          <HeroPreview />
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[
            ['6', 'roles across the supply chain'],
            ['5', 'AI agents per recall'],
            ['100%', 'batches fingerprinted on-chain'],
            ['1 scan', 'to verify before every sale'],
          ].map(([n, l]) => (
            <motion.div key={l} {...fadeUp} className="text-center">
              <p className="text-3xl font-extrabold text-[#0F4C81] dark:text-[#7DAED9]">{n}</p>
              <p className="mt-1 text-sm text-slate-500">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#2E8B57]">The problem</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Unsafe medicine still reaches patients</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Counterfeit and recalled batches slip through paper records and phone calls. Recalls take days to reach every shelf, expired stock
            gets dispensed, and nobody can prove where a batch has been.
          </p>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: ShieldAlert, title: 'Counterfeits', text: 'Fake batches look real on paper. There is no tamper-proof record to check against.' },
            { icon: Timer, title: 'Slow recalls', text: 'Finding every holder by phone and email takes days, while unsafe stock is still sold.' },
            { icon: FileSearch, title: 'No visibility', text: 'Regulators cannot see in real time where stock sits or who has acted on a recall.' },
          ].map(({ icon: Icon, title, text }) => (
            <motion.div key={title} {...fadeUp} className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-16 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#2E8B57]">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">One platform for the whole medicine journey</h2>
          </motion.div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 3) * 0.08 }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#2E8B57]/40 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#2E8B57] text-white shadow-md">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#2E8B57]">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From factory to patient, in four steps</h2>
        </motion.div>
        <div className="relative mt-14 grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-[#0F4C81] via-[#2E8B57] to-[#0F4C81] opacity-30 md:block" />
          {steps.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative text-center">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0F4C81] shadow-md ring-1 ring-slate-200 dark:text-[#9CC4E8]">
                <Icon className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2E8B57] text-xs font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="scroll-mt-16 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#2E8B57]">Who it is for</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built for everyone who handles medicine</h2>
            <p className="mt-4 text-slate-600">Each role sees exactly what it needs, and nothing it shouldn't.</p>
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map(({ icon: Icon, name, text }) => (
              <motion.div key={name} {...fadeUp} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:bg-[#1A6FB5]/25 dark:text-[#9CC4E8]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE APP */}
      <section id="app" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-sm font-bold uppercase tracking-widest text-[#2E8B57]">Mobile app</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">The counter check, in your pocket</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Pharmacists and hospital staff scan a batch QR and get an answer in a second. Recall tasks, alerts and AI insights go with them.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                [ScanLine, 'One-tap scan with Safe, Expiring, Blocked or Counterfeit verdicts'],
                [Bell, 'Push and SMS alerts for urgent recalls'],
                [Fingerprint, 'Fingerprint or Face ID unlock and secure storage'],
                [MoonStar, 'Dark mode and works with saved data when offline'],
              ].map(([Icon, text]) => {
                const I = Icon as typeof Bell;
                return (
                  <li key={text as string} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#2E8B57]">
                      <I className="h-4 w-4" />
                    </span>
                    {text as string}
                  </li>
                );
              })}
            </ul>
            <a
              href={APK_URL}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <Download className="h-5 w-5" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] font-medium opacity-70">Download for</span>
                Android
              </span>
            </a>
          </motion.div>
          <motion.div {...fadeUp}>
            <PhoneMock />
          </motion.div>
        </div>
      </section>

      {/* TECH */}
      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Built with</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {tech.map((t) => (
              <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C81] to-[#2E8B57] px-6 py-14 text-center shadow-xl sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">Make every dose a safe dose</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-50">
            Register your organisation, get approved, and start verifying medicine today.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#ffffff] px-6 py-3.5 font-semibold text-[#0F4C81] shadow-lg transition hover:bg-[#eef5fb]">
              Register your organisation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="rounded-xl border border-white/40 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#082842] text-blue-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <Logo light />
            <p className="mt-2 text-sm opacity-70">Autonomous pharmaceutical safety & recall management.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-sm">
            <Link to="/login" className="hover:text-white">Sign in</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
            <a href={APK_URL} className="hover:text-white">Android app</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
          © {new Date().getFullYear()} PharmaGuard AI
        </div>
      </footer>
    </div>
  );
}
