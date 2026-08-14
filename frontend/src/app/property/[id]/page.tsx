'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, Star, Heart, Share2, Bed, Bath, Square, 
  CheckCircle2, ChevronLeft, ChevronRight,
  Phone, ShieldCheck, TrendingUp, Calculator as CalcIcon,
  MessageCircle,
} from 'lucide-react';
import { apiFetch, publicFetch, getAuthHeaders } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/config';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MortgageCalculator from '@/components/MortgageCalculator';
import DealPanel from '@/components/DealPanel';
import mapboxgl from 'mapbox-gl';

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id;
  const [activeImage, setActiveImage] = useState(0);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const recordLead = async (leadType: string) => {
    if (!id) return;
    try {
      await publicFetch(`/properties/${id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadType }),
      });
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const headers = await getAuthHeaders();
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/properties/${id}`, { headers });
        if (!res.ok) {
          throw new Error('Failed to load property');
        }
        const data = await res.json();
        setProperty(data);
        setActionMessage(null);
        publicFetch(`/properties/${id}/view`, { method: 'POST' }).catch(() => {});
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      const res = await apiFetch(`/properties/${id}/favorite`, { method: 'POST' });
      setSaved(res.saved);
      setActionMessage(res.saved ? 'Listing saved' : 'Removed from saved');
    } catch (e: unknown) {
      setActionMessage(e instanceof Error ? e.message : 'Could not save');
    }
  };

  const shareListing = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setActionMessage('Link copied to clipboard');
    }
    await recordLead('SHARE');
  };

  useEffect(() => {
    if (!property || typeof property.lng !== 'number' || typeof property.lat !== 'number') return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    const map = new mapboxgl.Map({
      container: 'property-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [property.lng, property.lat],
      zoom: 13,
    });

    new mapboxgl.Marker().setLngLat([property.lng, property.lat]).addTo(map);

    map.on('load', () => setMapReady(true));

    return () => {
      map.remove();
      setMapReady(false);
    };
  }, [property]);

  const fallbackImage =
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=2070';

  const images: string[] = property
    ? (Array.isArray(property.images)
        ? property.images
        : (() => {
            try {
              const parsed = JSON.parse(property.images || '[]');
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })())
    : [];

  const imagesSafe = images.length ? images : [fallbackImage];

  const openExternalListing = () => {
    if (property?.externalUrl) {
      window.open(property.externalUrl, '_blank', 'noopener noreferrer');
      return;
    }
    setActionMessage('No external listing link was provided for this property yet.');
  };

  const amenities: string[] = property
    ? (Array.isArray(property.amenities)
        ? property.amenities
        : (() => {
            try {
              const parsed = JSON.parse(property.amenities || '[]');
              return Array.isArray(parsed) ? parsed : String(property.amenities || '')
                .split(',')
                .map((a: string) => a.trim())
                .filter(Boolean);
            } catch {
              return String(property.amenities || '')
                .split(',')
                .map((a: string) => a.trim())
                .filter(Boolean);
            }
          })())
    : [];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading property...</div>;
  }

  if (error || !property) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || 'Property not found'}</div>;
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Image Gallery */}
      <section className="relative h-[500px] md:h-[700px] bg-gray-900 overflow-hidden group">
        <img 
          src={imagesSafe[activeImage]} 
          alt="Property" 
          className="w-full h-full object-cover opacity-90 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute inset-y-0 left-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setActiveImage((prev) => (prev === 0 ? imagesSafe.length - 1 : prev - 1))}
            className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setActiveImage((prev) => (prev === imagesSafe.length - 1 ? 0 : prev + 1))}
            className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex space-x-3">
              <span className="bg-primary text-white px-6 py-2 rounded-2xl font-bold shadow-lg">
                {property.type === 'RENT'
                  ? 'For Rent'
                  : property.type === 'SHORTLET'
                    ? 'Shortlet'
                    : property.type === 'INVESTMENT'
                      ? 'Investment'
                      : 'For Sale'}
              </span>
              {property.isFeatured && (
                <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-2xl font-bold border border-white/20">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-2xl">
              {property.title}
            </h1>
            <div className="flex items-center text-white/80 font-bold">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <span>
                {property.address}
                {property.city ? `, ${property.city}` : ''}
                {property.country ? `, ${property.country}` : ''}
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={toggleSave}
              className="bg-white/10 backdrop-blur-md p-4 rounded-3xl text-white hover:bg-white/20 transition-all border border-white/20 shadow-2xl"
            >
              <Heart className={`h-6 w-6 ${saved ? 'fill-red-400 text-red-400' : ''}`} />
            </button>
            <button
              onClick={shareListing}
              className="bg-white/10 backdrop-blur-md p-4 rounded-3xl text-white hover:bg-white/20 transition-all border border-white/20 shadow-2xl"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {imagesSafe.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === i ? 'w-12 bg-primary' : 'w-6 bg-white/40'}`}
            ></div>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            <div className="flex flex-wrap gap-8 py-10 border-b border-gray-100">
              <div className="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex-1 min-w-[150px]">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Bed className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-secondary">{property.bedrooms}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex-1 min-w-[150px]">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Bath className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-secondary">{property.bathrooms}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 flex-1 min-w-[150px]">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Square className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-secondary">
                    {(property.squareFootage ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Square Feet</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-extrabold text-secondary">Property Description</h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                {property.description || 'No description provided for this listing.'}
              </p>
              <p className="text-xl text-gray-500 leading-relaxed">
                Reach out to the listing contact to learn more, schedule a viewing, or discuss next steps.
              </p>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-extrabold text-secondary">Key Amenities</h2>
              {amenities.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {amenities.map((item, i) => (
                    <div
                      key={`${item}-${i}`}
                      className="flex items-center space-x-4 bg-gray-50 p-6 rounded-3xl border border-gray-100 group hover:border-primary/20 transition-all"
                    >
                      <div className="bg-white p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-bold text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 font-medium">No amenities provided for this listing.</p>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-extrabold text-secondary">Location on Map</h2>
              <div className="bg-gray-100 h-[400px] rounded-[40px] overflow-hidden relative border-4 border-white shadow-2xl">
                <div id="property-map" className="w-full h-full" />
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-blue-50/30">
                    <div className="space-y-4">
                      <MapPin className="h-16 w-16 text-primary/20 mx-auto" />
                      <p className="text-gray-400 font-bold max-w-xs">
                        Map is loading or location is not available for this property.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Contact */}
          <div className="space-y-10">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 sticky top-32">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-4xl font-extrabold text-primary">
                    {property.currency || 'USD'} {(property.price ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-accent px-4 py-2 rounded-2xl flex items-center text-primary font-bold">
                  <Star className="h-4 w-4 fill-current mr-2" />
                  <span>{property.agent?.rating ? property.agent.rating.toFixed(1) : '4.8'}</span>
                </div>
              </div>

            <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-3xl mb-10 border border-gray-100">
              <img 
                src={
                  property.agent?.user?.profileImage ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2076'
                }
                alt="Agent" 
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
              <div>
                <p className="text-lg font-extrabold text-secondary">
                  {property.agent?.user?.name || 'Listing Contact'}
                </p>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">
                  {property.agent?.specialty || 'Real Estate Expert'}
                </p>
                <div className="flex space-x-3">
                  {(property.contactPhone || property.agent?.phone) && (
                    <a
                      href={`tel:${property.contactPhone || property.agent?.phone}`}
                      onClick={() => recordLead('CALL')}
                      className="bg-white p-2 rounded-xl text-gray-400 hover:text-primary transition-colors shadow-sm"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                  {(property.contactWhatsapp || property.contactPhone) && (
                    <a
                      href={`https://wa.me/${String(property.contactWhatsapp || property.contactPhone).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordLead('WHATSAPP')}
                      className="bg-white p-2 rounded-xl text-gray-400 hover:text-green-600 transition-colors shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

              <div className="space-y-4">
                {(property.contactWhatsapp || property.contactPhone) && (
                  <a
                    href={`https://wa.me/${String(property.contactWhatsapp || property.contactPhone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordLead('WHATSAPP')}
                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all"
                  >
                    <MessageCircle className="h-6 w-6" /> WhatsApp
                  </a>
                )}
                {(property.contactPhone || property.agent?.phone) && (
                  <a
                    href={`tel:${property.contactPhone || property.agent?.phone}`}
                    onClick={() => recordLead('CALL')}
                    className="flex items-center justify-center gap-2 w-full bg-secondary text-white py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all"
                  >
                    <Phone className="h-6 w-6" /> Call now
                  </a>
                )}
                <button
                  onClick={() => {
                    recordLead('INSPECTION');
                    if (property.contactEmail) {
                      window.location.href = `mailto:${property.contactEmail}?subject=Inspection request: ${property.title}`;
                    } else {
                      setActionMessage('Contact email not set for this listing');
                    }
                  }}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-primary/30"
                >
                  Book inspection
                </button>
                <button
                  onClick={toggleSave}
                  className="w-full bg-white border-2 border-gray-100 text-secondary py-5 rounded-2xl font-bold text-lg hover:border-primary/20 flex items-center justify-center gap-2"
                >
                  <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'text-primary'}`} />
                  {saved ? 'Saved' : 'Save listing'}
                </button>
                <button
                  onClick={shareListing}
                  className="w-full bg-accent text-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                >
                  <Share2 className="h-5 w-5" /> Share listing
                </button>
                <button className="w-full bg-white border-2 border-gray-100 text-secondary py-4 rounded-2xl font-bold flex items-center justify-center">
                  <CalcIcon className="h-5 w-5 mr-2 text-primary" />
                  Mortgage calculator below
                </button>
              </div>
              {actionMessage && (
                <p className="text-sm font-semibold text-red-600 text-center">{actionMessage}</p>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center space-x-3 text-gray-400">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-xs font-bold uppercase tracking-widest">Verified by Property On Set</p>
              </div>
            </div>

            <DealPanel
              propertyId={String(id)}
              agentUserId={property.agent?.user?.id}
              defaultAmount={property.price ?? 0}
              defaultCurrency={property.currency || 'USD'}
            />

            <MortgageCalculator />

            <div className="bg-gradient-to-br from-secondary to-gray-800 rounded-[40px] p-10 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <TrendingUp className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-2xl font-extrabold mb-4">Investment Insight</h3>
                {property.investmentData ? (
                  <>
                    <p className="text-gray-300 font-medium mb-4">
                      Projected ROI: <span className="font-extrabold">{property.investmentData.roi ?? 'N/A'}%</span>
                      {property.investmentData.rentalYield ? (
                        <> · Rental Yield: <span className="font-extrabold">{property.investmentData.rentalYield}%</span></>
                      ) : null}
                    </p>
                    {property.investmentData.marketTrend ? (
                      <p className="text-gray-200 font-medium mb-8">
                        Market Trend: <span className="font-extrabold">{property.investmentData.marketTrend}</span>
                      </p>
                    ) : (
                      <p className="text-gray-200 font-medium mb-8">
                        Investment data available for this listing.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-300 font-medium mb-8">Investment data not available for this listing yet.</p>
                )}
                <Link href="/invest" className="inline-block text-primary font-extrabold hover:underline">
                  View Full Market Report &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
