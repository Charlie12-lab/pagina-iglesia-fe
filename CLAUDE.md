# IglesiaNet — Frontend Agent

## Proyecto
Plataforma web multi-iglesia. Frontend React que consume la API del backend IglesiaNet.

## Stack
- React 19 + TypeScript + Vite 6
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin tailwind.config.js)
- TanStack Query v5 (server state)
- Zustand v5 (auth state, persiste en localStorage)
- Axios (HTTP client con interceptor JWT)
- react-big-calendar + date-fns (calendario de eventos en home)
- TipTap StarterKit (editor rich text para blogs en admin)
- lucide-react (iconos)
- react-router-dom v7

## Estructura
```
src/
├── api/           ← client.ts (axios + interceptor), churches.ts, events.ts, blogs.ts, auth.ts
├── components/
│   ├── layout/    ← Navbar, PublicLayout, AdminLayout (sidebar con roles)
│   └── ui/        ← EventModal (detalle + inscripción)
├── pages/
│   ├── public/    ← HomePage, ChurchesPage, BlogPage, BlogDetailPage
│   └── admin/     ← LoginPage, DashboardPage, AdminEventsPage, AdminBlogsPage, AdminChurchesPage
├── store/
│   └── authStore.ts  ← Zustand: token, user, role, churchId
├── types/
│   └── index.ts   ← interfaces TypeScript de todas las entidades
└── App.tsx        ← BrowserRouter, rutas públicas y admin
```

## Roles y rutas protegidas
- Rutas `/admin/*` requieren token JWT válido
- `SuperAdmin` ve toda la gestión (iglesias, eventos, blogs de todas)
- `ChurchAdmin` ve solo eventos y blogs de su iglesia (churchId del JWT)
- Login en `/admin/login`

## API
- Base URL: `/api` (proxy Vite a `https://localhost:7000` en dev)
- Auth: Bearer token en header `Authorization`
- El token se guarda en Zustand + localStorage

## Comandos
```bash
npm run dev      # dev server en http://localhost:5173
npm run build    # build de producción
npm run lint     # ESLint
```

## Configuración importante
- Proxy Vite configurado en `vite.config.ts` → `https://localhost:7000`
- Si el puerto del backend cambia, actualizar `vite.config.ts`
- Tailwind v4: los estilos van en `src/index.css` con `@import "tailwindcss"`

## GitHub
Repo: https://github.com/Charlie12-lab/pagina-iglesia-fe

## Pendiente
- Revisar tipos en `types/index.ts` si la API cambia shape de BlogPost (Publication anidado)
- Manejo de errores más robusto en formularios admin
- Loading skeletons
