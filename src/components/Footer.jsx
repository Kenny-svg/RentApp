import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10">
      <div className="container-app grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold text-brand-700">RentRate</p>
          <p className="mt-3 text-sm text-slate-600">
            Better rentals through trust, maintenance standards, and transparent landlord ratings.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Platform</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Link to="/properties" className="block hover:text-slate-900">
              Browse Properties
            </Link>
            <Link to="/signup" className="block hover:text-slate-900">
              Create Account
            </Link>
            <Link to="/dashboard/landlord" className="block hover:text-slate-900">
              Landlord Tools
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Support</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>help@rentrate.com</p>
            <p>+1 (555) 111-8989</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Address</p>
          <p className="mt-3 text-sm text-slate-600">210 Housing Square, Suite 18, Denver, CO</p>
        </div>
      </div>
      <div className="container-app mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
        {new Date().getFullYear()} RentRate. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
