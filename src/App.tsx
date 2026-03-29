import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import ChurchesPage from './pages/public/ChurchesPage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminChurchesPage from './pages/admin/AdminChurchesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13.5 },
          success: { style: { background: '#E6F7F8', color: '#00818C', border: '1px solid #B2E8EC' } },
          error: { style: { background: '#FFEEF2', color: '#9D1539', border: '1px solid #F9B8C6' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/iglesias" element={<ChurchesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/eventos/:id" element={<EventDetailPage />} />
          </Route>

          {/* Admin login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin protected */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="eventos" element={<AdminEventsPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
            <Route path="iglesias" element={<AdminChurchesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
