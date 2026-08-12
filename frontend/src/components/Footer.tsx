import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-primary mb-4">Property On Set</h3>
          <p className="text-gray-400 mb-6">
            Leading real estate marketplace across North America. Find your dream home, invest in top-tier properties, or manage your real estate assets with ease.
          </p>
          <div className="flex space-x-4">
            <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/buy" className="text-gray-400 hover:text-white">Buy Properties</Link></li>
            <li><Link href="/rent" className="text-gray-400 hover:text-white">Rent Homes</Link></li>
            <li><Link href="/sell" className="text-gray-400 hover:text-white">Sell Your Home</Link></li>
            <li><Link href="/invest" className="text-gray-400 hover:text-white">Investment Opportunities</Link></li>
            <li><Link href="/agents" className="text-gray-400 hover:text-white">Find an Agent</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            <li><Link href="/cookies" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
            <li><Link href="/disclaimer" className="text-gray-400 hover:text-white">Disclaimer</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 text-primary mr-2 mt-1" />
              <span className="text-gray-400">123 Real Estate Ave, Suite 500, New York, NY 10001</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-2" />
              <span className="text-gray-400">+1 (212) 555-0123</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-5 w-5 text-primary mr-2" />
              <span className="text-gray-400">contact@propertyonset.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Property On Set. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
