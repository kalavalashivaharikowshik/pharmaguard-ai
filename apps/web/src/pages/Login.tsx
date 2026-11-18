import { useEffect, useMemo, useState } from 'react';
import { authService } from '../auth/authService';
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

/* ════════════════════════════════════════════════════════════════════════
   1. DESIGN TOKENS
   ════════════════════════════════════════════════════════════════════════ */

const COLORS = {
  forest: '#1a3d2b',
  pine: '#1f5c3c',
  sage: '#2e7d55',
  mint: '#4caf82',
  aqua: '#6dd3a8',
  mist: '#d4f0e4',
  teal: '#0f7b78',
  tealLight: '#e0f5f4',
  ink: '#111b18',
  slate: '#4b6358',
  fog: '#8fa89d',
  cloud: '#e8eeeb',
  snow: '#f5f8f6',
  white: '#ffffff',
} as const;

const FONTS = {
  display: "'Sora', sans-serif",
  body: "'DM Sans', sans-serif",
} as const;

const COMPLIANCE_BADGES = ['HIPAA', 'SOC 2 Type II', 'FDA 21 CFR', 'ISO 27001'];

const FEATURES = [
  { icon: '🛡', text: 'Blockchain batch traceability' },
  { icon: '🤖', text: 'Agentic AI recall management' },
  { icon: '🔒', text: 'Smart contract sale blocking' },
  { icon: '💊', text: 'Self-destructing drug identity' },
];

const FLOATING_PILL_LAYOUT = [
  { top: '14%', left: '6%', scale: 0.5, delay: '0s', opacity: 0.18 },
  { top: '68%', left: '4%', scale: 0.38, delay: '0.4s', opacity: 0.14 },
  { top: '78%', right: '6%', scale: 0.45, delay: '0.2s', opacity: 0.16 },
  { top: '10%', right: '5%', scale: 0.42, delay: '0.7s', opacity: 0.13 },
  { top: '44%', left: '2%', scale: 0.32, delay: '0.9s', opacity: 0.1 },
];

/** Path used by both the login shield icon and its clip mask. */
const SHIELD_PATH =
  'M80 8 L140 30 L140 88 C140 118 114 138 80 150 C46 138 20 118 20 88 L20 30 Z';

/** Overlay timing, in ms, for each stage of the post-login animation. */
const OVERLAY_TIMING = {
  verifying: 0,
  granted: 1500,
  workspaceReady: 3000,
  navigate: 3000, // kept in sync with Login's own setTimeout below
};

/* ════════════════════════════════════════════════════════════════════════
   2. GLOBAL STYLES (keyframes + shared element classes)
   ════════════════════════════════════════════════════════════════════════ */

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700;800&display=swap');

  /* ---- entrance / ambient ---- */
  @keyframes pg-fadeUp   { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pg-fadeIn   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pg-float    { 0%, 100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-10px) rotate(-12deg); } }
  @keyframes pg-glow     { 0%, 100% { filter: drop-shadow(0 0 8px #6dd3a855); } 50% { filter: drop-shadow(0 0 22px #6dd3a899); } }

  /* ---- form ---- */
  @keyframes pg-spin     { to { transform: rotate(360deg); } }

  /* ---- access-granted overlay ---- */
  @keyframes pg-ringOut     { 0% { transform: scale(.5); opacity: .8; } 100% { transform: scale(2.4); opacity: 0; } }
  @keyframes pg-shieldDraw  { from { stroke-dashoffset: 560; } to { stroke-dashoffset: 0; } }
  @keyframes pg-checkDraw   { from { stroke-dashoffset: 120; } to { stroke-dashoffset: 0; } }
  @keyframes pg-fillIn      { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pg-scanLine    { 0% { transform: translateY(-100%); opacity: .7; } 100% { transform: translateY(500%); opacity: 0; } }
  @keyframes pg-scaleIn     { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
  @keyframes pg-particleUp  { 0% { transform: translateY(0) translateX(0); opacity: .9; } 100% { transform: translateY(var(--py, -80px)) translateX(var(--px, 0px)); opacity: 0; } }
  @keyframes pg-slideRight  { from { width: 0; } to { width: 100%; } }

  /* ---- form controls ---- */
  .pg-field {
    width: 100%;
    padding: 12px 14px 12px 44px;
    border: 1.5px solid ${COLORS.cloud};
    border-radius: 10px;
    font-size: .9rem;
    font-family: ${FONTS.body};
    color: ${COLORS.ink};
    background: ${COLORS.white};
    outline: none;
    box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s;
  }
  .pg-field:focus { border-color: ${COLORS.mint}; box-shadow: 0 0 0 3px ${COLORS.mint}22; }
  .pg-field::placeholder { color: ${COLORS.fog}; }

  .pg-btn-primary {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, ${COLORS.pine} 0%, ${COLORS.mint} 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: .95rem;
    font-weight: 600;
    font-family: ${FONTS.display};
    letter-spacing: .03em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 16px ${COLORS.mint}44;
    transition: transform .15s, box-shadow .15s;
  }
  .pg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px ${COLORS.mint}55; }
  .pg-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .pg-btn-primary:disabled { opacity: .7; cursor: not-allowed; }

  .pg-btn-sso {
    width: 100%;
    padding: 12px;
    background: ${COLORS.white};
    border: 1.5px solid ${COLORS.cloud};
    border-radius: 10px;
    font-size: .88rem;
    font-weight: 500;
    font-family: ${FONTS.body};
    color: ${COLORS.slate};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: border-color .2s, background .2s;
  }
  .pg-btn-sso:hover { border-color: ${COLORS.mint}; background: ${COLORS.mist}; }

  /* ---- overlay shell ---- */
  .pg-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(ellipse at center, #1a3d2b 0%, #0e2318 60%, #060f0a 100%);
    animation: pg-fadeIn .4s ease-out;
  }
`;

/* ════════════════════════════════════════════════════════════════════════
   3. SHARED ICONS
   ════════════════════════════════════════════════════════════════════════ */

function HexGridBackdrop({ id, opacity }: { id: string; opacity: number }) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}
    >
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,2 56,16 56,36 30,50 4,36 4,16" fill="none" stroke={COLORS.aqua} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Pill({ size = 160, float = false }: { size?: number; float?: boolean }) {
  const height = size * 0.45;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 160 72"
      style={float ? { animation: 'pg-float 3s ease-in-out infinite' } : undefined}
    >
      <defs>
        <linearGradient id="pg-pillL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3dba80" />
          <stop offset="100%" stopColor="#1f5c3c" />
        </linearGradient>
        <linearGradient id="pg-pillR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0faf5" />
          <stop offset="100%" stopColor="#c5e8d8" />
        </linearGradient>
        <radialGradient id="pg-sheen" cx="30%" cy="30%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity=".45" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M36 6 L80 6 L80 66 L36 66 Q6 66 6 36 Q6 6 36 6 Z" fill="url(#pg-pillL)" />
      <path d="M80 6 L124 6 Q154 6 154 36 Q154 66 124 66 L80 66 Z" fill="url(#pg-pillR)" />
      <line x1="80" y1="6" x2="80" y2="66" stroke="white" strokeWidth="2.5" strokeOpacity=".7" />
      <path d="M36 6 L80 6 L80 66 L36 66 Q6 66 6 36 Q6 6 36 6 Z" fill="url(#pg-sheen)" />
      <path d="M80 6 L124 6 Q154 6 154 36 Q154 66 124 66 L80 66 Z" fill="url(#pg-sheen)" />
      <path
        d="M36 6 L124 6 Q154 6 154 36 Q154 66 124 66 L36 66 Q6 66 6 36 Q6 6 36 6 Z"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity=".3"
      />
      <line x1="117" y1="30" x2="117" y2="42" stroke={COLORS.teal} strokeWidth="3" strokeLinecap="round" />
      <line x1="111" y1="36" x2="123" y2="36" stroke={COLORS.teal} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4. ACCESS-GRANTED OVERLAY (post-login animation)
   ════════════════════════════════════════════════════════════════════════ */

type OverlayPhase = 'verifying' | 'granted' | 'workspaceReady';

/** Drives the three-stage overlay animation on a fixed schedule. */
function useOverlayPhase(): OverlayPhase {
  const [phase, setPhase] = useState<OverlayPhase>('verifying');

  useEffect(() => {
    const toGranted = setTimeout(() => setPhase('granted'), OVERLAY_TIMING.granted);
    const toReady = setTimeout(() => setPhase('workspaceReady'), OVERLAY_TIMING.workspaceReady);
    return () => {
      clearTimeout(toGranted);
      clearTimeout(toReady);
    };
  }, []);

  return phase;
}

/** 20 particles bursting outward from the shield once access is granted. */
function useBurstParticles(count = 20) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count;
        return {
          key: i,
          px: Math.cos(angle) * (40 + (i % 3) * 18),
          py: -55 - (i % 4) * 28,
          delay: i * 0.045,
          color: i % 2 ? COLORS.aqua : COLORS.mint,
        };
      }),
    [count],
  );
}

function ShieldStage({ phase }: { phase: OverlayPhase }) {
  const verifying = phase === 'verifying';
  const granted = phase === 'granted';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {granted &&
          [0, 0.28, 0.56].map((delay, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 210,
                height: 210,
                borderRadius: '50%',
                border: `1.5px solid ${COLORS.mint}`,
                animation: `pg-ringOut 1.6s ease-out ${delay}s forwards`,
              }}
            />
          ))}

        <svg width="190" height="190" viewBox="0 0 160 165" style={{ animation: 'pg-glow 2.5s ease-in-out infinite' }}>
          <defs>
            <linearGradient id="pg-sfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.mint} stopOpacity=".3" />
              <stop offset="100%" stopColor={COLORS.pine} stopOpacity=".55" />
            </linearGradient>
            <linearGradient id="pg-sstroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={COLORS.aqua} />
              <stop offset="100%" stopColor={COLORS.pine} />
            </linearGradient>
            <linearGradient id="pg-sscan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.aqua} stopOpacity="0" />
              <stop offset="50%" stopColor={COLORS.aqua} stopOpacity=".7" />
              <stop offset="100%" stopColor={COLORS.aqua} stopOpacity="0" />
            </linearGradient>
            <clipPath id="pg-sc">
              <path d={SHIELD_PATH} />
            </clipPath>
          </defs>

          {granted && <path d={SHIELD_PATH} fill="url(#pg-sfill)" style={{ animation: 'pg-fillIn .4s ease-out both' }} />}

          {granted && (
            <g clipPath="url(#pg-sc)">
              <rect x="20" y="0" width="120" height="20" fill="url(#pg-sscan)" style={{ animation: 'pg-scanLine 1.6s ease-in-out infinite' }} />
            </g>
          )}

          {/* self-drawing outline, present for every stage */}
          <path
            d={SHIELD_PATH}
            fill="none"
            stroke="url(#pg-sstroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 560, animation: 'pg-shieldDraw 1.4s cubic-bezier(.65,.05,.36,1) .1s both' }}
          />

          {granted && (
            <path
              d="M48 85 L70 108 L112 60"
              fill="none"
              stroke={COLORS.aqua}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 120,
                animation: 'pg-checkDraw .6s cubic-bezier(.65,.05,.36,1) .2s both',
                filter: `drop-shadow(0 0 6px ${COLORS.aqua})`,
              }}
            />
          )}

          {granted && (
            <g transform="translate(32,106) scale(0.6)" style={{ animation: 'pg-scaleIn .5s cubic-bezier(.16,1,.3,1) .5s both' }}>
              <Pill size={160} />
            </g>
          )}
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        {verifying && (
          <p style={{ fontFamily: FONTS.display, fontSize: '1rem', color: COLORS.aqua, letterSpacing: '.22em', animation: 'pg-fadeIn .5s ease-out' }}>
            VERIFYING IDENTITY
          </p>
        )}
        {granted && (
          <>
            <p style={{ fontFamily: FONTS.display, fontSize: '1.5rem', fontWeight: 700, color: COLORS.white, letterSpacing: '.07em', animation: 'pg-fadeUp .5s ease-out' }}>
              ACCESS GRANTED
            </p>
            <p style={{ marginTop: 6, color: COLORS.aqua, fontSize: '.78rem', letterSpacing: '.2em', animation: 'pg-fadeIn .5s ease-out .2s both' }}>
              SECURE CHANNEL ESTABLISHED
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function WorkspaceReadyStage() {
  const particles = useBurstParticles();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, animation: 'pg-scaleIn .6s cubic-bezier(.16,1,.3,1) both' }}>
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            ['--px' as string]: `${p.px}px`,
            ['--py' as string]: `${p.py}px`,
            animation: `pg-particleUp 1.2s ease-out ${p.delay}s both`,
          }}
        />
      ))}

      <div style={{ filter: `drop-shadow(0 8px 28px ${COLORS.mint}66)`, animation: 'pg-float 2.5s ease-in-out infinite' }}>
        <Pill size={240} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: FONTS.display, fontSize: '1.7rem', fontWeight: 700, color: COLORS.white, letterSpacing: '.04em' }}>
          Pharma<span style={{ color: COLORS.aqua }}>Guard</span> AI
        </p>
        <p style={{ marginTop: 6, color: COLORS.mint, fontSize: '.76rem', letterSpacing: '.22em' }}>
          LOADING YOUR WORKSPACE
        </p>
        <div style={{ marginTop: 18, width: 220, height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden', margin: '18px auto 0' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg,${COLORS.mint},${COLORS.aqua})`, borderRadius: 99, animation: 'pg-slideRight .9s cubic-bezier(.16,1,.3,1) .1s both' }} />
        </div>
      </div>
    </div>
  );
}

/** Full-screen animation shown between a successful login and navigation. */
function AccessOverlay() {
  const phase = useOverlayPhase();

  return (
    <div className="pg-overlay">
      <HexGridBackdrop id="pg-hex" opacity={0.05} />

      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 480,
          height: 380,
          borderRadius: '50%',
          background: `radial-gradient(ellipse,${COLORS.mint}22 0%,transparent 70%)`,
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {phase !== 'workspaceReady' ? <ShieldStage phase={phase} /> : <WorkspaceReadyStage />}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5. BRAND PANEL (left side)
   ════════════════════════════════════════════════════════════════════════ */

function FloatingPills() {
  return (
    <>
      {FLOATING_PILL_LAYOUT.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: p.top,
            left: (p as any).left,
            right: (p as any).right,
            opacity: p.opacity,
            transform: `scale(${p.scale}) rotate(-12deg)`,
            animation: `pg-float ${3.2 + i * 0.5}s ease-in-out ${p.delay} infinite`,
          }}
        >
          <Pill size={140} />
        </div>
      ))}
    </>
  );
}

function BrandBackdrop() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <HexGridBackdrop id="pg-hexL" opacity={0.06} />
      <FloatingPills />
    </div>
  );
}

function BrandWordmark({ size = 180 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ filter: `drop-shadow(0 8px 24px ${COLORS.mint}55)` }}>
        <Pill size={size} float />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: '2.1rem', fontWeight: 800, color: COLORS.white, letterSpacing: '.04em' }}>
          Pharma<span style={{ color: COLORS.aqua }}>Guard</span> AI
        </div>
        <div style={{ marginTop: 4, fontSize: '.66rem', color: COLORS.mint, letterSpacing: '.3em', opacity: 0.8 }}>
          SECURE PHARMA INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

function FeatureList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 310 }}>
      {FEATURES.map((f, i) => (
        <div
          key={f.text}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 16px',
            borderRadius: 10,
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.1)',
            animation: `pg-fadeUp .6s cubic-bezier(.16,1,.3,1) ${0.25 + i * 0.1}s both`,
          }}
        >
          <span style={{ fontSize: '1.05rem' }}>{f.icon}</span>
          <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '.84rem', fontWeight: 500 }}>{f.text}</span>
        </div>
      ))}
    </div>
  );
}

function ComplianceBadges() {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
      {COMPLIANCE_BADGES.map((label) => (
        <span
          key={label}
          style={{
            padding: '4px 10px',
            borderRadius: 99,
            background: 'rgba(109,211,168,.14)',
            border: `1px solid ${COLORS.mint}44`,
            color: COLORS.aqua,
            fontSize: '.67rem',
            fontWeight: 600,
            letterSpacing: '.06em',
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function BrandPanel() {
  return (
    <div
      style={{
        flex: '0 0 46%',
        background: COLORS.forest,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BrandBackdrop />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <BrandWordmark />
        <FeatureList />
        <ComplianceBadges />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6. LOGIN FORM (right side)
   ════════════════════════════════════════════════════════════════════════ */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        marginBottom: 18,
        padding: '11px 14px',
        borderRadius: 10,
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        fontSize: '.83rem',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      ⚠ {message}
    </div>
  );
}

type FieldProps = {
  label: string;
  icon: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  action?: React.ReactNode;
};

/** A labeled text input with a leading icon, shared by the email + password fields. */
function FormField({ label, icon, type, placeholder, value, onChange, onEnter, action }: FieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <label style={{ fontSize: '.8rem', fontWeight: 600, color: COLORS.slate, letterSpacing: '.03em' }}>{label}</label>
        {action}
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: COLORS.fog, fontSize: 16, pointerEvents: 'none' }}>
          {icon}
        </span>
        <input
          type={type}
          className="pg-field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button type="button" disabled={loading} className="pg-btn-primary" aria-live="polite">
      {loading ? (
        <>
          <span
            style={{
              width: 18,
              height: 18,
              border: '2.5px solid rgba(255,255,255,.35)',
              borderTopColor: 'white',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'pg-spin .75s linear infinite',
            }}
          />
          Signing in…
        </>
      ) : (
        'Sign in securely →'
      )}
    </button>
  );
}

function DividerWithLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: COLORS.cloud }} />
      <span style={{ color: COLORS.fog, fontSize: '.78rem' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: COLORS.cloud }} />
    </div>
  );
}

function FormHeader() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            flexShrink: 0,
            background: `linear-gradient(135deg,${COLORS.pine},${COLORS.mint})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 14px ${COLORS.mint}44`,
          }}
        >
          <Pill size={32} />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: '1.05rem', color: COLORS.forest }}>
            Pharma<span style={{ color: COLORS.teal }}>Guard</span> AI
          </div>
          <div style={{ fontSize: '.63rem', color: COLORS.fog, letterSpacing: '.1em' }}>LOGISTICS &amp; SAFETY PLATFORM</div>
        </div>
      </div>

      <h1 style={{ fontFamily: FONTS.display, fontSize: '1.65rem', fontWeight: 700, color: COLORS.ink, marginBottom: 6 }}>
        Welcome back
      </h1>
      <p style={{ color: COLORS.slate, fontSize: '.88rem', marginBottom: 28 }}>Sign in to your secure workspace</p>
    </>
  );
}

type LoginFormProps = {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  showPassword: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onRegisterClick: () => void;
};

function LoginForm({
  email,
  password,
  error,
  loading,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onRegisterClick,
}: LoginFormProps) {
  return (
    <div style={{ flex: 1, background: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
      <div style={{ width: '100%', maxWidth: 400, animation: 'pg-fadeUp .7s cubic-bezier(.16,1,.3,1) .2s both' }}>
        <FormHeader />

        {error && <ErrorBanner message={error} />}

        <FormField
          label="Email address"
          icon="✉"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={onEmailChange}
          onEnter={onSubmit}
        />

        <FormField
          label="Password"
          icon="🔒"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={onPasswordChange}
          onEnter={onSubmit}
          action={
            <button
              type="button"
              onClick={onTogglePassword}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.teal, fontSize: '.78rem', fontWeight: 500, padding: 0 }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
          <Link to="/forgot-password" style={{ fontSize: '.82rem', color: COLORS.teal, textDecoration: 'none', fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>

        <div onClick={onSubmit}>
          <SubmitButton loading={loading} />
        </div>

        <DividerWithLabel label="or" />

        <button type="button" className="pg-btn-sso" onClick={() => alert('SSO Coming Soon')}>
          🏢 Sign in with SSO
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.78rem', color: COLORS.fog }}>
          Don't have an organization account?{' '}
          <span onClick={onRegisterClick} style={{ color: COLORS.teal, cursor: 'pointer', fontWeight: 600 }}>
            Register Your Organization
          </span>
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7. LOGIN LOGIC (auth call, validation, navigation)
   ════════════════════════════════════════════════════════════════════════ */

function useLoginController() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required.';
    if (!password.trim()) return 'Password is required.';
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('role', response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      login(response.accessToken);

      // Play the access-granted animation, then hand off to the app.
      setShowOverlay(true);
      setTimeout(() => {
        setLoading(false);
        navigate('/');
      }, OVERLAY_TIMING.navigate);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showOverlay,
    showPassword,
    togglePassword: () => setShowPassword((v) => !v),
    submit,
    goToRegister: () => navigate('/register'),
  };
}

/* ════════════════════════════════════════════════════════════════════════
   8. PAGE
   ════════════════════════════════════════════════════════════════════════ */

export default function Login() {
  const controller = useLoginController();

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {controller.showOverlay && <AccessOverlay />}

      <Link to="/" style={{ position: 'fixed', top: 16, left: 16, zIndex: 50, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.92)', color: '#0F4C81', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
        ← Home
      </Link>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONTS.body }}>
        <BrandPanel />
        <LoginForm
          email={controller.email}
          password={controller.password}
          error={controller.error}
          loading={controller.loading}
          showPassword={controller.showPassword}
          onEmailChange={controller.setEmail}
          onPasswordChange={controller.setPassword}
          onTogglePassword={controller.togglePassword}
          onSubmit={controller.submit}
          onRegisterClick={controller.goToRegister}
        />
      </div>
    </>
  );
}