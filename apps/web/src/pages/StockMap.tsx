import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map as MapIcon, MapPinOff } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import RiskBadge from '../components/ui/RiskBadge';
import { ErrorState, EmptyState } from '../components/ui/States';
import { analyticsService, errorMessage, type MapPoint } from '../services/extraServices';
import { api } from '../services/api';
import { ROLE_LABEL } from '../auth/roles';

const ROLE_COLOR: Record<string, string> = {
  MANUFACTURER: '#0F4C81',
  DISTRIBUTOR: '#7C3AED',
  PHARMACY: '#2E8B57',
  HOSPITAL: '#0891B2',
};

export default function StockMap() {
  const [points, setPoints] = useState<MapPoint[] | null>(null);
  const [withoutLocation, setWithoutLocation] = useState(0);
  const [recalls, setRecalls] = useState<{ id: string; recallNumber: string; status: string; batch: { batchNumber: string } }[]>([]);
  const [recallId, setRecallId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/recalls')
      .then((r) => setRecalls(r.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setError('');
    analyticsService
      .stockMap(recallId || undefined)
      .then((d) => {
        setPoints(d.points);
        setWithoutLocation(d.withoutLocation);
      })
      .catch((e) => setError(errorMessage(e, 'Could not load the stock map')));
  }, [recallId]);

  const maxUnits = Math.max(1, ...(points ?? []).map((p) => p.totalUnits));
  const center: [number, number] = points?.length
    ? [points.reduce((s, p) => s + p.latitude, 0) / points.length, points.reduce((s, p) => s + p.longitude, 0) / points.length]
    : [20.5937, 78.9629];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Stock Map"
          subtitle={recallId ? 'Organisations holding the recalled batch (recall impact map).' : 'Where pharmaceutical stock is held across the network.'}
          icon={<MapIcon size={22} />}
          actions={
            <select
              value={recallId}
              onChange={(e) => setRecallId(e.target.value)}
              aria-label="Filter by recall"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
            >
              <option value="">All stock</option>
              {recalls.map((r) => (
                <option key={r.id} value={r.id}>
                  Recall {r.recallNumber} · {r.batch.batchNumber} ({r.status.toLowerCase()})
                </option>
              ))}
            </select>
          }
        />

        {error && <ErrorState message={error} />}

        <div className="card p-3">
          <div className="h-[60vh] min-h-[380px]">
            <MapContainer key={center.join(',')} center={center} zoom={points?.length ? 6 : 5} scrollWheelZoom className="h-full w-full">
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {(points ?? []).map((p) => (
                <CircleMarker
                  key={p.userId}
                  center={[p.latitude, p.longitude]}
                  radius={8 + Math.sqrt(p.totalUnits / maxUnits) * 22}
                  pathOptions={{
                    color: p.atRiskUnits > 0 ? '#DC2626' : ROLE_COLOR[p.role] ?? '#0F4C81',
                    fillColor: ROLE_COLOR[p.role] ?? '#0F4C81',
                    fillOpacity: 0.45,
                    weight: p.atRiskUnits > 0 ? 3 : 1.5,
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px] text-sm">
                      <p className="font-semibold">{p.organization}</p>
                      <p className="text-xs opacity-70">
                        {ROLE_LABEL[p.role] ?? p.role} · {p.city ?? 'Unknown city'}
                      </p>
                      <p className="mt-2">
                        <b>{p.totalUnits}</b> units{p.atRiskUnits > 0 && <span className="text-red-600"> · {p.atRiskUnits} at risk</span>}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs">
                        {p.batches.slice(0, 6).map((b) => (
                          <li key={b.batchNumber}>
                            {b.batchNumber} {b.drugName}: {b.quantity} ({b.status.toLowerCase()})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {Object.entries(ROLE_COLOR).map(([role, color]) => (
            <span key={role} className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: color }} /> {ROLE_LABEL[role]}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-red-600" /> Holds recalled, revoked or expiring stock
          </span>
          <RiskBadge value="PENDING" label="Bubble size = units held" />
        </div>

        {points && points.length === 0 && (
          <EmptyState
            icon={<MapPinOff size={26} />}
            title="No located stock"
            message={withoutLocation ? `${withoutLocation} organisation(s) hold stock but have no location yet. Add a city and coordinates in Settings → Profile.` : 'No stock matches this filter.'}
          />
        )}
        {points && points.length > 0 && withoutLocation > 0 && (
          <p className="text-sm text-slate-500">{withoutLocation} organisation(s) are not shown because they have no location set.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
