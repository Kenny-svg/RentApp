import { Link } from 'react-router-dom';
import Button from '../components/Button';

function NotFoundPage() {
  return (
    <section className="container-app py-16 text-center">
      <h1 className="text-5xl font-extrabold text-slate-900">404</h1>
      <p className="mt-3 text-sm text-slate-600">Page not found.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to Home</Button>
      </Link>
    </section>
  );
}

export default NotFoundPage;
