import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="text-center py-24">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <p className="text-xl text-gray-500 mb-6">Page not found</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
}

