import { Search, MapPin, Phone, Mail, Star, Users, Briefcase, Award } from 'lucide-react';
import Link from 'next/link';

const AGENTS_DATA = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    specialty: 'Luxury Residential',
    experience: '12 Years',
    listings: 45,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=2076',
    location: 'Beverly Hills, CA'
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialty: 'Investment Properties',
    experience: '8 Years',
    listings: 32,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=2070',
    location: 'Austin, TX'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    specialty: 'Commercial Real Estate',
    experience: '15 Years',
    listings: 58,
    rating: 5.0,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=2070',
    location: 'Miami, FL'
  }
];

export default function AgentsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8">Find a Trusted Expert</h1>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Our network of professional agents is ready to help you buy, sell, or invest in real estate across North America.
          </p>
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Search by name, city, or specialty..." 
                className="w-full focus:outline-none text-gray-800 font-medium bg-transparent"
              />
            </div>
            <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20">
              Find Agent
            </button>
          </div>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-extrabold text-secondary">Top Rated Agents</h2>
            <p className="text-gray-500 mt-2">Expert advice from the best in the business.</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-secondary hover:bg-gray-100 transition-all">
              Filter by Specialty
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {AGENTS_DATA.map((agent) => (
            <div key={agent.id} className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 group hover:shadow-2xl transition-all">
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={agent.image} 
                  alt={agent.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="flex space-x-4 w-full">
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                      View Profile
                    </button>
                    <button className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white hover:bg-white/30 transition-all">
                      <Phone className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-secondary mb-1">{agent.name}</h3>
                    <p className="text-primary font-bold uppercase tracking-widest text-xs">{agent.specialty}</p>
                  </div>
                  <div className="flex items-center text-yellow-500 bg-yellow-50 px-3 py-1 rounded-xl">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="text-sm font-bold">{agent.rating}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 mb-8">
                  <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
                  <span className="text-sm font-bold">{agent.location}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-50 mb-8">
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-secondary">{agent.experience}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Experience</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-secondary">{agent.listings}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-extrabold text-secondary">{agent.reviews}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Reviews</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button className="flex-1 bg-gray-50 text-secondary border border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Message
                  </button>
                  <button className="flex-1 bg-accent text-primary py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become an Agent CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary rounded-[60px] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
          
          <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-8">
            <Award className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">Are you a Real Estate Professional?</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto relative z-10">
            Join Property On Set to reach millions of buyers, renters, and investors. Grow your business with our cutting-edge marketing tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
            <button className="bg-primary text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl shadow-primary/20">
              Apply to Join
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
              View Agent Benefits
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
