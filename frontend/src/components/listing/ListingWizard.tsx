'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import {
  AMENITIES,
  CURRENCIES,
  FURNISHING_OPTIONS,
  ListingFormData,
  PROPERTY_TYPES,
  emptyListingForm,
  propertyToForm,
} from '@/lib/listing';
import { apiFetch } from '@/lib/api';
import StepProgress from './StepProgress';
import AmenityCard from './AmenityCard';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Upload,
} from 'lucide-react';

const inputClass =
  'w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 font-medium';
const labelClass = 'text-sm font-bold text-gray-500 uppercase tracking-widest';

export default function ListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  const [step, setStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(draftIdParam);
  const [form, setForm] = useState<ListingFormData>(emptyListingForm());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<
    { id: string; title: string; address: string; reasons: string[] }[]
  >([]);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (field: keyof ListingFormData, value: string | string[] | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildFormData = useCallback(() => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'amenities') fd.append(key, JSON.stringify(value));
      else fd.append(key, String(value));
    });
    fd.append('draftStep', String(step));
    if (coverFile) fd.append('images', coverFile);
    imageFiles.forEach((f) => fd.append('images', f));
    if (existingImages.length) fd.append('images', JSON.stringify(existingImages));
    return fd;
  }, [form, step, coverFile, imageFiles, existingImages]);

  const saveDraft = useCallback(
    async (silent = false) => {
      const { getSupabase, isSupabaseConfigured } = await import('@/lib/supabase');
      const signedIn =
        isSupabaseConfigured() &&
        Boolean((await getSupabase().auth.getSession()).data.session);
      if (!signedIn) {
        if (!silent) setMessage('Please sign in to save your listing.');
        return;
      }
      setSaving(true);
      if (!silent) setMessage(null);
      try {
        const fd = buildFormData();
        let result: Record<string, unknown>;
        if (draftId) {
          result = await apiFetch(`/listings/drafts/${draftId}`, { method: 'PATCH', body: fd });
        } else {
          result = await apiFetch('/listings/drafts', { method: 'POST', body: fd });
          setDraftId(String(result.id));
          router.replace(`/agent/listings/new?draftId=${result.id}`);
        }
        const imgs = Array.isArray(result.images) ? (result.images as string[]) : existingImages;
        setExistingImages(imgs);
        setLastSavedAt(new Date().toLocaleString());
        if (!silent) setMessage('Draft saved');
      } catch (e: unknown) {
        if (!silent) setMessage(e instanceof Error ? e.message : 'Failed to save draft');
      } finally {
        setSaving(false);
      }
    },
    [buildFormData, draftId, existingImages, router]
  );

  useEffect(() => {
    if (!draftIdParam) return;
    (async () => {
      try {
        const data = await apiFetch(`/listings/drafts/${draftIdParam}`);
        setForm(propertyToForm(data));
        setStep(typeof data.draftStep === 'number' ? data.draftStep : 1);
        setExistingImages(Array.isArray(data.images) ? data.images : []);
        setDraftId(draftIdParam);
        if (data.lastSavedAt) setLastSavedAt(new Date(data.lastSavedAt).toLocaleString());
      } catch {
        setMessage('Could not load draft');
      }
    })();
  }, [draftIdParam]);

  useEffect(() => {
    if (!draftId) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => saveDraft(true), 2000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [form, step, draftId, saveDraft]);

  useEffect(() => {
    if (step !== 5) return;
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    if (!token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: 'wizard-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: 14,
    });
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([lng, lat])
      .addTo(map);
    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      update('lng', String(pos.lng));
      update('lat', String(pos.lat));
    });
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat);
      update('lng', String(e.lngLat.lng));
      update('lat', String(e.lngLat.lat));
    });
    return () => map.remove();
  }, [step, form.lat, form.lng]);

  const checkDuplicates = async () => {
    if (!draftId) return;
    try {
      const res = await apiFetch(`/listings/drafts/${draftId}/duplicates`);
      setDuplicates(res.duplicates || []);
    } catch {
      setDuplicates([]);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await saveDraft(true);
      if (!draftId) throw new Error('Save draft first');
      const res = await apiFetch(`/listings/drafts/${draftId}/submit`, { method: 'POST' });
      setDuplicates(res.duplicates || []);
      setMessage(
        res.hasDuplicates
          ? 'Submitted for review (duplicate warnings detected).'
          : 'Submitted for admin review. It will go live after approval.'
      );
      setTimeout(() => router.push('/agent/dashboard'), 2000);
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const next = async () => {
    await saveDraft(true);
    setStep((s) => Math.min(7, s + 1));
    if (step === 6) await checkDuplicates();
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const totalImages = existingImages.length + imageFiles.length + (coverFile ? 1 : 0);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-secondary">Create Listing</h1>
            <p className="text-gray-500 mt-2">Draft autosaves · Submit when ready for admin review</p>
          </div>
          {lastSavedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-2xl border border-gray-100">
              <Clock className="h-4 w-4 text-primary" />
              Last saved: {lastSavedAt}
              {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
          )}
        </div>

        <StepProgress step={step} />

        <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-gray-100">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
                <Home className="h-6 w-6 text-primary" /> Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Property title</label>
                  <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Property type</label>
                  <select className={inputClass} value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Listing type</label>
                  <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value)}>
                    <option value="SALE">Sale</option>
                    <option value="RENT">Rent</option>
                    <option value="SHORTLET">Shortlet</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Price</label>
                  <input type="number" className={inputClass} value={form.price} onChange={(e) => update('price', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Currency</label>
                  <select className={inputClass} value={form.currency} onChange={(e) => update('currency', e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Description</label>
                  <textarea rows={4} className={inputClass} value={form.description} onChange={(e) => update('description', e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Full address</label>
                  <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>State</label>
                  <input className={inputClass} value={form.state} onChange={(e) => update('state', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Country</label>
                  <input className={inputClass} value={form.country} onChange={(e) => update('country', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  ['bedrooms', 'Bedrooms'],
                  ['bathrooms', 'Bathrooms'],
                  ['toilets', 'Toilets'],
                  ['squareMeters', 'Sq meters'],
                  ['squareFootage', 'Sq ft'],
                  ['landSize', 'Land size'],
                  ['parkingSpaces', 'Parking'],
                  ['floorNumber', 'Floor'],
                  ['totalFloors', 'Total floors'],
                  ['yearBuilt', 'Year built'],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <label className={labelClass}>{label}</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={form[key as keyof ListingFormData] as string}
                      onChange={(e) => update(key as keyof ListingFormData, e.target.value)}
                    />
                  </div>
                ))}
                <div className="col-span-2 space-y-2">
                  <label className={labelClass}>Furnishing</label>
                  <select className={inputClass} value={form.furnishing} onChange={(e) => update('furnishing', e.target.value)}>
                    {FURNISHING_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map((a) => (
                  <AmenityCard
                    key={a}
                    label={a}
                    selected={form.amenities.includes(a)}
                    onToggle={() => {
                      const next = form.amenities.includes(a)
                        ? form.amenities.filter((x) => x !== a)
                        : [...form.amenities, a];
                      update('amenities', next);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" /> Media
              </h2>
              <p className="text-sm text-gray-500">Minimum 3 photos required before submit</p>
              <div className="space-y-2">
                <label className={labelClass}>Cover image</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Property photos</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Video tour URL</label>
                <input className={inputClass} value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>360 virtual tour URL (optional)</label>
                <input className={inputClass} value={form.tour360Url} onChange={(e) => update('tour360Url', e.target.value)} />
              </div>
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((url) => (
                    <img key={url} src={url} alt="" className="h-20 w-20 object-cover rounded-xl" />
                  ))}
                </div>
              )}
              <p className="text-sm font-bold text-primary">{totalImages} image(s) total</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" /> Location
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Latitude</label>
                  <input className={inputClass} value={form.lat} onChange={(e) => update('lat', e.target.value)} placeholder="6.5244" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Longitude</label>
                  <input className={inputClass} value={form.lng} onChange={(e) => update('lng', e.target.value)} placeholder="3.3792" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Landmark nearby</label>
                  <input className={inputClass} value={form.landmark} onChange={(e) => update('landmark', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Neighborhood</label>
                  <input className={inputClass} value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Estate name</label>
                  <input className={inputClass} value={form.estateName} onChange={(e) => update('estateName', e.target.value)} />
                </div>
              </div>
              <div id="wizard-map" className="h-64 rounded-3xl overflow-hidden border border-gray-100" />
              <p className="text-xs text-gray-400">Click or drag the pin on the map</p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary">Fees & Contact</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  ['serviceCharge', 'Service charge'],
                  ['agencyFee', 'Agency fee'],
                  ['cautionFee', 'Caution fee'],
                  ['inspectionFee', 'Inspection fee'],
                ].map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <label className={labelClass}>{label}</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={form[key as keyof ListingFormData] as string}
                      onChange={(e) => update(key as keyof ListingFormData, e.target.value)}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>WhatsApp</label>
                  <input className={inputClass} value={form.contactWhatsapp} onChange={(e) => update('contactWhatsapp', e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-secondary">Review & Submit</h2>
              <div className="bg-gray-50 rounded-3xl p-6 space-y-3 text-sm">
                <p><strong>{form.title || 'Untitled'}</strong> · {form.propertyType} · {form.type}</p>
                <p>{form.address}, {form.city}, {form.state}, {form.country}</p>
                <p>{form.currency} {form.price} · {form.bedrooms} bed · {form.bathrooms} bath</p>
                <p>{form.amenities.length} amenities · {totalImages} images</p>
              </div>
              {duplicates.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                    <AlertTriangle className="h-5 w-5" /> Possible duplicates
                  </div>
                  <ul className="text-sm space-y-2">
                    {duplicates.map((d) => (
                      <li key={d.id}>
                        {d.title} — {d.address} ({d.reasons.join(', ')})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-gray-500 text-sm">
                Listings are reviewed by admin before going live. Only approved listings are published.
              </p>
            </div>
          )}

          {message && (
            <p className={`mt-6 text-sm font-semibold ${message.includes('error') || message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="px-8 py-3 rounded-2xl font-bold border border-gray-200 disabled:opacity-40"
            >
              Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => saveDraft(false)}
                disabled={saving}
                className="px-6 py-3 rounded-2xl font-bold bg-gray-100 text-secondary flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Save draft
              </button>
              {step < 7 ? (
                <button type="button" onClick={next} className="px-8 py-3 rounded-2xl font-bold bg-primary text-white">
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || totalImages < 3}
                  className="px-8 py-3 rounded-2xl font-bold bg-primary text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit for review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
