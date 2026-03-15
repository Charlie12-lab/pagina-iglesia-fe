import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-indigo-800 text-indigo-200 text-center py-6 text-sm mt-auto">
        © {new Date().getFullYear()} IglesiaNet — Plataforma de Iglesias
      </footer>
    </div>
  );
}
