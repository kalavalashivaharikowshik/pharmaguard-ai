import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LocateFixed, Monitor, Moon, Sun } from 'lucide-react';

import { profileService, errorMessage } from '../../services/extraServices';
import { useTheme, type ThemeMode } from '../../theme/ThemeContext';

type Prefs = { push?: boolean; sms?: boolean; email?: boolean; language?: string; theme?: ThemeMode };

const inputCls = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 outline-none focus:border-teal-600';

/** Profile (incl. location for the stock map) and preferences (theme, notification channels, language). */
export default function PreferencesPanel() {
  const { mode, setMode } = useTheme();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileService
      .me()
      .then((me) => {
        setProfile({
          fullName: me.fullName ?? '',
          phone: me.phone ?? '',
          organizationName: me.organizationName ?? '',
          address: me.address ?? '',
          city: me.city ?? '',
          latitude: me.latitude ?? '',
          longitude: me.longitude ?? '',
        });
        setPrefs(me.preferences ?? {});
      })
      .catch(() => setProfile({}));
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(profile)) {
        if (v === '' || v === null) continue;
        payload[k] = k === 'latitude' || k === 'longitude' ? Number(v) : v;
      }
      await profileService.update(payload);
      toast.success('Profile saved');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const savePref = async (patch: Prefs) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      await profileService.preferences(patch);
      toast.success('Preferences updated');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not available in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((p) => ({ ...p, latitude: pos.coords.latitude.toFixed(5), longitude: pos.coords.longitude.toFixed(5) }));
        toast.success('Location filled in. Click Save profile.');
      },
      () => toast.error('Could not get your location'),
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Your location places your organisation on the stock and recall map.</p>
        {profile && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(
              [
                ['fullName', 'Full name'],
                ['phone', 'Phone (for SMS alerts)'],
                ['organizationName', 'Organisation'],
                ['city', 'City'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="block">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} className={inputCls} />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Address</span>
              <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Latitude</span>
              <input type="number" step="any" value={profile.latitude} onChange={(e) => setProfile({ ...profile, latitude: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Longitude</span>
              <input type="number" step="any" value={profile.longitude} onChange={(e) => setProfile({ ...profile, longitude: e.target.value })} className={inputCls} />
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button onClick={locate} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <LocateFixed size={16} /> Use my location
              </button>
              <button onClick={saveProfile} disabled={saving} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold text-slate-900">Preferences</h2>

        <p className="mt-5 text-sm font-medium text-slate-700">Theme</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ['light', 'Light', <Sun key="s" size={16} />],
              ['dark', 'Dark', <Moon key="m" size={16} />],
              ['system', 'System', <Monitor key="d" size={16} />],
            ] as const
          ).map(([value, label, icon]) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                savePref({ theme: value });
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${
                mode === value ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium text-slate-700">Notifications</p>
        <div className="divide-y divide-slate-200">
          <Toggle on={prefs.push !== false} onChange={(v) => savePref({ push: v })} label="Mobile push" hint="Alerts on the PharmaGuard mobile app" />
          <Toggle on={prefs.sms !== false} onChange={(v) => savePref({ sms: v })} label="SMS for urgent alerts" hint="High and critical alerts by text message" />
          <Toggle on={prefs.email !== false} onChange={(v) => savePref({ email: v })} label="Email" hint="Account and compliance emails" />
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Language</span>
          <select value={prefs.language ?? 'en'} onChange={(e) => savePref({ language: e.target.value })} className={inputCls}>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="te">తెలుగు (Telugu)</option>
          </select>
          <span className="mt-1 block text-xs text-slate-500">Used for notification and report language. The interface is in English.</span>
        </label>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange(v: boolean): void; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-sm text-slate-500">{hint}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-teal-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
