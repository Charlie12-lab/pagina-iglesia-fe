import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { authApi } from '../../api/auth';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [pwVisible, setPwVisible]   = useState(false);
  const [adminMode, setAdminMode]   = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState<number | null>(null);
  const [error, setError]           = useState('');

  // Cargar iglesias activas para el dropdown
  const { data: churches = [] } = useQuery({
    queryKey: ['churches-login'],
    queryFn: () => churchesApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      authApi.login({
        email,
        password,
        expectAdmin: adminMode,
        churchId: adminMode ? selectedChurchId : null,
      }),
    onSuccess: (data) => {
      login({
        token:      data.token,
        username:   data.username,
        role:       data.role as 'SuperAdmin' | 'ChurchAdmin',
        churchId:   data.churchId,
        churchName: data.churchName,
      });
      // Admin toggle activo o rol admin → panel admin; si no → inicio público
      navigate(adminMode || data.role === 'SuperAdmin' || data.role === 'ChurchAdmin' ? '/admin' : '/');
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const status  = err.response?.status;
        const message = err.response?.data?.message as string | undefined;
        if (status === 403) {
          setError(message ?? 'No tienes permisos para este acceso.');
          return;
        }
      }
      setError('Correo o contraseña incorrectos. Inténtalo de nuevo.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate();
  };

  const toggleAdmin = () => {
    setAdminMode(v => !v);
    setSelectedChurchId(null);
    setError('');
  };

  return (
    <div className="lp-root">
      {/* Background circles */}
      <div className="lp-bg-circle lp-bg1" />
      <div className="lp-bg-circle lp-bg2" />
      <div className="lp-bg-circle lp-bg3" />

      <div className="lp-wrap">
        <div className="lp-card">
          <div className="lp-card-inner">

            {/* Logo */}
            <Link to="/" className="lp-card-logo">
              <div className="lp-logo-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5V3.5M6.5 3.5H9.5M2 14.5H14V7.5L8 3L2 7.5V14.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.5 14.5V10.5H10.5V14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="lp-logo-text">Iglesia de <span>Cristo</span></span>
            </Link>

            {/* Header */}
            <div className="lp-card-header">
              <h1>Iniciar sesión</h1>
              <p>Ingresa tus credenciales para continuar.</p>
            </div>

            {/* Admin toggle */}
            <div className={`lp-admin-toggle${adminMode ? ' active' : ''}`} onClick={toggleAdmin}>
              <div className="lp-toggle-top">
                <div className="lp-toggle-left">
                  <div className="lp-admin-icon">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <circle cx="8.5" cy="6" r="3" stroke={adminMode ? '#0098A6' : '#E8A020'} strokeWidth="1.4"/>
                      <path d="M2.5 15C2.5 12.5 5.2 10.5 8.5 10.5C11.8 10.5 14.5 12.5 14.5 15" stroke={adminMode ? '#0098A6' : '#E8A020'} strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M11 7.5L12.5 9L15 6" stroke={adminMode ? '#0098A6' : '#E8A020'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="lp-admin-label">Ingresar como administrador</div>
                    <div className="lp-admin-desc">Activa para gestionar una iglesia específica</div>
                  </div>
                </div>
                <div
                  className={`lp-switch${adminMode ? ' on' : ''}`}
                  onClick={e => { e.stopPropagation(); toggleAdmin(); }}
                >
                  <div className="lp-switch-track" />
                  <div className="lp-switch-thumb" />
                </div>
              </div>

              {/* Dropdown de iglesias — solo cuando adminMode está activo */}
              <div className={`lp-dropdown${adminMode ? ' open' : ''}`}>
                <div className="lp-select-label">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1C3.79 1 2 2.79 2 5C2 7.5 6 11 6 11S10 7.5 10 5C10 2.79 8.21 1 6 1Z" stroke="#00818C" strokeWidth="1.2" fill="none"/>
                    <circle cx="6" cy="5" r="1.5" stroke="#00818C" strokeWidth="1.2"/>
                  </svg>
                  Selecciona tu iglesia
                </div>
                <div className="lp-select-wrap">
                  <span className="lp-select-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5V3.5M5.5 3.5H8.5M2 13H12V8L7 4.5L2 8V13Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      <path d="M5 13V10H9V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <select
                    className="lp-select"
                    value={selectedChurchId ?? ''}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSelectedChurchId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">— Elige una iglesia —</option>
                    {churches.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}{c.city ? ` · ${c.city}` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="lp-select-chevron">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="lp-divider" />

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="lp-form-group">
                <label className="lp-label">Correo electrónico</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="1.5" y="3" width="12" height="9" rx="2" stroke="#ABABAB" strokeWidth="1.3"/>
                      <path d="M1.5 5.5L7.5 9L13.5 5.5" stroke="#ABABAB" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    className="lp-input"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-form-group">
                <label className="lp-label">Contraseña</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="3" y="6.5" width="9" height="7" rx="1.5" stroke="#ABABAB" strokeWidth="1.3"/>
                      <path d="M5 6.5V4.5C5 3.4 5.9 2.5 7.5 2.5C9.1 2.5 10 3.4 10 4.5V6.5" stroke="#ABABAB" strokeWidth="1.3" strokeLinecap="round"/>
                      <circle cx="7.5" cy="10" r="1" fill="#ABABAB"/>
                    </svg>
                  </span>
                  <input
                    className="lp-input"
                    type={pwVisible ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setPwVisible(v => !v)}
                  >
                    {pwVisible ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M1 7.5C1 7.5 3.5 3 7.5 3C11.5 3 14 7.5 14 7.5C14 7.5 11.5 12 7.5 12C3.5 12 1 7.5 1 7.5Z" stroke="#0098A6" strokeWidth="1.3"/>
                        <circle cx="7.5" cy="7.5" r="2" stroke="#0098A6" strokeWidth="1.3"/>
                        <line x1="2" y1="2" x2="13" y2="13" stroke="#0098A6" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M1 7.5C1 7.5 3.5 3 7.5 3C11.5 3 14 7.5 14 7.5C14 7.5 11.5 12 7.5 12C3.5 12 1 7.5 1 7.5Z" stroke="#ABABAB" strokeWidth="1.3"/>
                        <circle cx="7.5" cy="7.5" r="2" stroke="#ABABAB" strokeWidth="1.3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + forgot */}
              <div className="lp-form-row">
                <label className="lp-checkbox-wrap">
                  <input type="checkbox" />
                  <span className="lp-checkbox-label">Recordarme</span>
                </label>
                <a href="#" className="lp-forgot">¿Olvidaste tu contraseña?</a>
              </div>

              {error && <div className="lp-error">{error}</div>}

              {/* Submit */}
              <button type="submit" className="lp-btn" disabled={isPending}>
                {isPending ? 'Ingresando...' : adminMode ? 'Ingresar al panel' : 'Ingresar'}
                {!isPending && (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M3 7.5H12M9 4.5L12 7.5L9 10.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>

          </div>

          {/* Card footer */}
          <div className="lp-card-footer">
            <div className="lp-footer-line">
              <span>¿Quieres registrar tu iglesia?</span>
              <a href="#">Empieza →</a>
            </div>
            <div className="lp-footer-divider" />
            <div className="lp-footer-line">
              <span>¿Quieres registrarte?</span>
              <a href="#">Solicítalo aquí →</a>
            </div>
          </div>
        </div>

        <div className="lp-back">
          ← <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
