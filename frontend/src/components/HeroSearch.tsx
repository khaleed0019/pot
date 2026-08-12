'use client';

import React, { useState } from 'react';
import { Search, Home, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [type, setType] = useState('SALE');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (city) query.append('city', city);
    if (type) query.append('type', type);
    if (maxPrice) query.append('maxPrice', maxPrice);
    
    const path = type === 'SALE' ? '/buy' : type === 'RENT' ? '/rent' : '/shortlet';
    router.push(`${path}?${query.toString()}`);
  };

  return (
    <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-5xl mx-auto">
      <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Austin, Miami, New York, Los Angeles..."
          className="w-full focus:outline-none text-gray-800 font-medium"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex items-center px-4 py-2 md:w-48 border-b md:border-b-0 md:border-r border-gray-100">
        <Home className="h-5 w-5 text-gray-400 mr-2" />
        <select 
          className="w-full focus:outline-none text-gray-800 font-medium bg-transparent cursor-pointer"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="SALE">Sale</option>
          <option value="RENT">Rent</option>
          <option value="SHORTLET">Shortlet</option>
        </select>
      </div>
      <div className="flex items-center px-4 py-2 md:w-48 border-b md:border-b-0 md:border-r border-gray-100">
        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
        <input 
          type="number" 
          placeholder="Max Price ($)"
          className="w-full focus:outline-none text-gray-800 font-medium"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <button 
        onClick={handleSearch}
        className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105"
      >
        Search
      </button>
    </div>
  );
}
