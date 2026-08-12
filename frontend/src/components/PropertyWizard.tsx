'use client';

/**
 * LEGACY — not part of the live listing flow.
 *
 * The shipping wizard is `components/listing/ListingWizard.tsx`, served at
 * /agent/listings/new (plural) and linked from the agent dashboard and /sell.
 * This component is only reachable at /agent/listing/new (singular) by typing
 * the URL directly, and it posts to the legacy POST /properties endpoint.
 * Kept for reference on the react-hook-form + zod validation approach.
 */

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Home, Key, MapPin, DollarSign, Bed, Bath, 
  Maximize, Layout, CheckCircle2, Image as ImageIcon, Video, 
  Map, Phone, Mail, Send, Save, AlertCircle, Trash2, Plus, 
  Wifi, Shield, Waves, Dumbbell, Coffee, Car, Trees, PawPrint,
  ArrowRight, ArrowLeft, Loader2, Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { toast } from 'react-toastify';

const propertySchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['SALE', 'RENT', 'SHORTLET']),
  price: z.number().min(100, 'Price must be at least 100'),
  currency: z.string().min(1),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string(),
  
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  toilets: z.number().min(0),
  squareFootage: z.number().optional(),
  landSize: z.number().optional(),
  furnishingStatus: z.string().optional(),
  parkingSpaces: z.number().min(0),
  floorNumber: z.number().optional(),
  totalFloors: z.number().optional(),
  yearBuilt: z.number().optional(),
  
  amenities: z.array(z.string()),
  
  videoTour: z.string().url('Invalid URL').optional().or(z.literal('')),
  virtualTour360: z.string().url('Invalid URL').optional().or(z.literal('')),
  
  lat: z.number().optional(),
  lng: z.number().optional(),
  landmark: z.string().optional(),
  neighborhood: z.string().optional(),
  estateName: z.string().optional(),
  
  serviceCharge: z.number().optional(),
  agencyFee: z.number().optional(),
  cautionFee: z.number().optional(),
  inspectionFee: z.number().optional(),
  phone: z.string().min(10, 'Valid phone is required'),
  whatsapp: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const STEPS = [
  'Basic Info',
  'Property Details',
  'Amenities',
  'Media',
  'Location',
  'Fees & Contact',
  'Review'
];

const AMENITIES_OPTIONS = [
  { id: 'kitchen', label: 'Kitchen', icon: Coffee },
  { id: 'balcony', label: 'Balcony', icon: Layout },
  { id: 'pop', label: 'POP Ceiling', icon: Home },
  { id: 'pool', label: 'Swimming Pool', icon: Waves },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'cctv', label: 'CCTV', icon: Shield },
  { id: 'power', label: 'Power Supply', icon: Home },
  { id: 'water', label: 'Water Supply', icon: Waves },
  { id: 'elevator', label: 'Elevator', icon: Building2 },
  { id: 'garden', label: 'Garden', icon: Trees },
  { id: 'pets', label: 'Pet Friendly', icon: PawPrint },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
];

export default function PropertyWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isValid } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'RENT',
      currency: 'USD',
      country: 'USA',
      amenities: [],
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      parkingSpaces: 0,
    }
  });

  const formData = watch();

  // Autosave Draft
  useEffect(() => {
    const draft = localStorage.getItem('property_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach((key: any) => {
          setValue(key, parsed[key]);
        });
        toast.info('Draft restored');
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  }, [setValue]);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('property_draft', JSON.stringify(formData));
      setLastSaved(new Date());
    }, 5000); // Save every 5 seconds of inactivity
    return () => clearTimeout(saveTimeout);
  }, [formData]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData, status: 'DRAFT' | 'PENDING' = 'PENDING') => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            payload.append(key, JSON.stringify(value));
          } else {
            payload.append(key, value.toString());
          }
        }
      });
      
      payload.append('status', status);
      images.forEach(image => {
        payload.append('images', image);
      });

      const response = await apiFetch('/properties', {
        method: 'POST',
        body: payload,
      });

      toast.success(status === 'DRAFT' ? 'Draft saved successfully' : 'Property submitted for review');
      localStorage.removeItem('property_draft');
      router.push('/agent/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title</label>
                <input {...register('title')} placeholder="Luxury 4 Bedroom Duplex in Beverly Hills" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select {...register('type')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all">
                  <option value="RENT">Rent</option>
                  <option value="SALE">Sale</option>
                  <option value="SHORTLET">Shortlet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="number" {...register('price', { valueAsNumber: true })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="0.00" />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea {...register('description')} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Describe the property, its features, and neighborhood..."></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                <input {...register('address')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="123 Property Lane, Street Name" />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input {...register('city')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Los Angeles" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input {...register('state')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="California" />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Property Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Bedrooms', name: 'bedrooms', icon: Bed },
                { label: 'Bathrooms', name: 'bathrooms', icon: Bath },
                { label: 'Toilets', name: 'toilets', icon: Home },
                { label: 'Parking Spaces', name: 'parkingSpaces', icon: Car },
                { label: 'Square Footage (sqft)', name: 'squareFootage', icon: Maximize },
                { label: 'Land Size (sqm)', name: 'landSize', icon: Layout },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="number" {...register(field.name as any, { valueAsNumber: true })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Furnishing Status</label>
                <select {...register('furnishingStatus')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all">
                  <option value="">Select Status</option>
                  <option value="Furnished">Fully Furnished</option>
                  <option value="Semi-furnished">Semi-furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year Built</label>
                <input type="number" {...register('yearBuilt', { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {AMENITIES_OPTIONS.map((amenity) => {
                const isSelected = getValues('amenities').includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => {
                      const current = getValues('amenities');
                      if (current.includes(amenity.id)) {
                        setValue('amenities', current.filter(id => id !== amenity.id));
                      } else {
                        setValue('amenities', [...current, amenity.id]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 ${
                      isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <amenity.icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                    <span className="text-sm font-bold">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Media Upload</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-primary transition-colors cursor-pointer relative">
              <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-sm mt-1">PNG, JPG, WEBP (min 3 photos recommended)</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
              {images.map((file, idx) => (
                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                  <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {idx === 0 && <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] px-2 py-1 rounded-lg font-bold">Cover</span>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Video Tour URL (YouTube/Vimeo)</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('videoTour')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">360 Virtual Tour URL</label>
                <div className="relative">
                  <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('virtualTour360')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="https://..." />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Location Details</h2>
            <div className="bg-gray-100 rounded-3xl h-64 flex items-center justify-center border border-gray-200 mb-6">
              <div className="text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Map Picker Coming Soon</p>
                <p className="text-gray-400 text-xs">Lat: {formData.lat || '0'}, Lng: {formData.lng || '0'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nearby Landmark</label>
                <input {...register('landmark')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Near Eko Hotel" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Neighborhood</label>
                <input {...register('neighborhood')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Victoria Island" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estate Name (Optional)</label>
                <input {...register('estateName')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Amen Estate" />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Fees & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Service Charge', name: 'serviceCharge', icon: DollarSign },
                { label: 'Agency Fee', name: 'agencyFee', icon: DollarSign },
                { label: 'Caution Fee', name: 'cautionFee', icon: Shield },
                { label: 'Inspection Fee', name: 'inspectionFee', icon: Search },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="number" {...register(field.name as any, { valueAsNumber: true })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="0.00" />
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-secondary mb-4">Contact Information</h3>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('phone')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('whatsapp')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('email')} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="agent@example.com" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-secondary mb-6">Review & Submit</h2>
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4 mb-8">
              <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <p className="text-primary font-bold">Review your listing</p>
                <p className="text-primary/70 text-sm">Please ensure all details are correct. Once submitted, an admin will review your listing before it goes live.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-secondary mb-4 flex items-center gap-2">
                  <Home className="h-5 w-5" /> Basic Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Title:</span> {formData.title}</p>
                  <p><span className="text-gray-500">Price:</span> {formData.currency} {formData.price}</p>
                  <p><span className="text-gray-500">Location:</span> {formData.address}, {formData.city}, {formData.state}</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-secondary mb-4 flex items-center gap-2">
                  <Layout className="h-5 w-5" /> Property Specs
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Beds/Baths:</span> {formData.bedrooms} Beds, {formData.bathrooms} Baths</p>
                  <p><span className="text-gray-500">Area:</span> {formData.squareFootage} sqft</p>
                  <p><span className="text-gray-500">Amenities:</span> {formData.amenities.length} selected</p>
                </div>
              </div>
            </div>

            {images.length < 3 && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 text-sm font-medium">Minimum 3 photos recommended for faster approval.</p>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all z-10 ${
                idx <= currentStep ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx < currentStep ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
              </div>
              <span className={`text-[10px] md:text-xs mt-2 font-bold uppercase tracking-wider ${
                idx <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}>{step}</span>
              {idx < STEPS.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 ${
                  idx < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          {renderStep()}
        </div>
        
        <div className="bg-gray-50 p-8 flex justify-between items-center border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </button>
            <button 
              onClick={handleSubmit((data) => onSubmit(data, 'DRAFT'))}
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-primary hover:bg-primary/5 transition-all"
            >
              <Save className="h-5 w-5" /> Save Draft
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="hidden lg:block text-xs text-gray-400">
                Draft saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 bg-secondary text-white px-10 py-4 rounded-2xl font-bold hover:bg-secondary/90 transition-all shadow-xl shadow-secondary/10"
              >
                Next Step <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit((data) => onSubmit(data, 'PENDING'))}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Submit for Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
