import { Home, DollarSign, TrendingUp, Key, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import HeroSearch from '@/components/HeroSearch';
import HomeSaleMap from '@/components/HomeSaleMap';
import FadeIn from '@/components/motion/FadeIn';
import { StaggerGrid, StaggerItem } from '@/components/motion/StaggerGrid';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <FadeIn y={16}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Find Your Dream Property in the USA
            </h1>
          </FadeIn>
          <FadeIn y={16} delay={0.12}>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 drop-shadow-md">
              Buy, Rent, Sell, or Invest in premium real estate with Property On Set.
            </p>
          </FadeIn>
          <FadeIn y={16} delay={0.24}>
            <HeroSearch />
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <StaggerItem>
              <Link href="/buy" className="group block p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors">
                  <Home className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Buy a Home</h3>
                <p className="text-gray-500 mb-6">Explore thousands of homes for sale across New York, Los Angeles, and Miami.</p>
                <span className="text-primary font-bold group-hover:underline">Browse Listings &rarr;</span>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/rent" className="group block p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                  <Key className="h-10 w-10 text-green-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Rent a Home</h3>
                <p className="text-gray-500 mb-6">Find the perfect rental apartment or house in your favorite city.</p>
                <span className="text-green-600 font-bold group-hover:underline">Search Rentals &rarr;</span>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/sell" className="group block p-8 rounded-3xl border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="bg-purple-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600 transition-colors">
                  <DollarSign className="h-10 w-10 text-purple-600 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Sell Your Home</h3>
                <p className="text-gray-500 mb-6">List your property and reach millions of potential buyers today.</p>
                <span className="text-purple-600 font-bold group-hover:underline">Get Started &rarr;</span>
              </Link>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-secondary">Featured Properties</h2>
              <p className="text-gray-500 mt-2">Handpicked premium listings just for you.</p>
            </div>
            <Link href="/buy" className="text-primary font-bold hover:underline">View All &rarr;</Link>
          </div>
          
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <StaggerItem key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=2074`} 
                    alt="Property" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    For Sale
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white transition-colors">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-secondary truncate">Modern Luxury Villa</h3>
                    <p className="text-2xl font-extrabold text-primary">$1,250,000</p>
                  </div>
                  <div className="flex items-center text-gray-500 mb-6">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    <span>Beverly Hills, Los Angeles</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-6">
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <p className="font-bold text-secondary">4</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Beds</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-secondary">3.5</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Baths</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-secondary">3,200</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Sqft</p>
                      </div>
                    </div>
                    <Link href="/property/1" className="bg-accent text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition-colors">
                      Details
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* For Sale Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-secondary">Homes For Sale Near You</h2>
              <p className="text-gray-500 mt-2">Every pin is a home currently listed for sale.</p>
            </div>
            <Link href="/buy" className="text-primary font-bold hover:underline">Browse All &rarr;</Link>
          </div>
          <HomeSaleMap />
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-24 bg-secondary text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
          <TrendingUp className="w-full h-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
                Unlock High-Yield Real Estate Investments
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Data-driven investment opportunities across booming U.S. markets. High ROI, rental stability, and long-term growth.
              </p>
              <div className="space-y-6 mb-12">
                <div className="flex items-start">
                  <div className="bg-primary/20 p-3 rounded-xl mr-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">12% Average ROI</h4>
                    <p className="text-gray-400">Our properties consistently outperform the market average.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/20 p-3 rounded-xl mr-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Curated Selection</h4>
                    <p className="text-gray-400">Only the most promising properties make it to our platform.</p>
                  </div>
                </div>
              </div>
              <Link href="/invest" className="inline-block bg-primary text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105">
                Explore Investment Portfolio
              </Link>
            </FadeIn>
            <FadeIn delay={0.15} className="relative">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1460472178825-e5240623abe5?auto=format&fit=crop&q=80&w=2070"
                  alt="Investment Chart"
                  className="rounded-3xl shadow-2xl mb-8"
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-white/5">
                    <p className="text-primary font-bold text-2xl">8.4%</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Rental Yield</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5">
                    <p className="text-green-500 font-bold text-2xl">+15%</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Growth</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5">
                    <p className="text-purple-500 font-bold text-2xl">12k+</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Investors</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="bg-primary rounded-[50px] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">
              Ready to find your next home?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto relative z-10">
              Join thousands of happy homeowners and investors on Property On Set. Sign up now to get personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link href="/signup" className="bg-white text-primary px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105">
                Join Property On Set
              </Link>
              <Link href="/agents" className="bg-blue-700/30 text-white border border-white/30 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700/50 transition-all">
                Contact an Agent
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
