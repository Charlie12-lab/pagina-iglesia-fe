import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { blogsApi } from '../../api/blogs';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import { Bold, Italic, List } from 'lucide-react';
import type { BlogPostSummary } from '../../types';

const s = {
  pageHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 } as React.CSSProperties,
  h1: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#1A1A1A', letterSpacing: -0.2, marginBottom: 3 } as React.CSSProperties,
  sub: { fontSize: 13, color: '#777777' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0098A6', color: 'white', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,152,166,0.22)' } as React.CSSProperties,
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: '#444444', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2E2E2', cursor: 'pointer' } as React.CSSProperties,
  tableWrap: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden' } as React.CSSProperties,
  toolbar: { padding: '14px 18px', borderBottom: '1px solid #F3F3F3', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
  searchWrap: { position: 'relative', flex: 1, maxWidth: 280 } as React.CSSProperties,
  searchInput: { width: '100%', background: '#F3F3F3', border: '1.5px solid transparent', borderRadius: 8, padding: '7px 12px 7px 34px', fontFamily: 'inherit', fontSize: 13, color: '#1A1A1A', outline: 'none' } as React.CSSProperties,
  filterSel: { background: 'white', border: '1.5px solid #E2E2E2', borderRadius: 8, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12.5, color: '#444444', outline: 'none', cursor: 'pointer' } as React.CSSProperties,
  th: { background: '#F9F9F9', borderBottom: '1px solid #E2E2E2', padding: '10px 18px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#777777', letterSpacing: 0.5, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const } as React.CSSProperties,
  td: { padding: '12px 18px', fontSize: 13, color: '#444444', borderBottom: '1px solid #F3F3F3' } as React.CSSProperties,
  actBtn: { width: 28, height: 28, borderRadius: 7, border: '1.5px solid #E2E2E2', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777777' } as React.CSSProperties,
  formLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' } as React.CSSProperties,
  formCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden' } as React.CSSProperties,
  fcHeader: { padding: '16px 20px', borderBottom: '1px solid #F3F3F3', display: 'flex', alignItems: 'center', gap: 9 } as React.CSSProperties,
  fcTitle: { fontSize: 14, fontWeight: 700, color: '#1A1A1A' } as React.CSSProperties,
  fcBody: { padding: '18px 20px', display: 'flex', flexDirection: 'column' as const, gap: 16 } as React.CSSProperties,
  formRow2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as React.CSSProperties,
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 5 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 600, color: '#444444' } as React.CSSProperties,
  fi: { background: '#F3F3F3', border: '1.5px solid transparent', borderRadius: 8, padding: '9px 12px', fontFamily: 'inherit', fontSize: 13.5, color: '#1A1A1A', outline: 'none', width: '100%', boxSizing: 'border-box' as const } as React.CSSProperties,
  sfCard: { background: 'white', border: '1px solid #E2E2E2', borderRadius: 13, overflow: 'hidden', marginBottom: 14 } as React.CSSProperties,
  sfHeader: { padding: '12px 16px', borderBottom: '1px solid #F3F3F3', fontSize: 13, fontWeight: 700, color: '#1A1A1A' } as React.CSSProperties,
  sfBody: { padding: '14px 16px' } as React.CSSProperties,
};

const CATEGORIES = ['Fe y vida', 'Eventos', 'Comunidad', 'Enseñanza', 'Testimonio', 'Misiones'];

const emptyForm = {
  title: '', excerpt: '', author: '', churchId: '',
  coverImageUrl: '', tags: '', isPublished: false, category: '',
};

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div style={{ border: '1.5px solid #E2E2E2', borderRadius: 9, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: 8, background: '#F9F9F9', borderBottom: '1px solid #E2E2E2', flexWrap: 'wrap' }}>
        {[
          { action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: <Bold size={13} /> },
          { action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: <Italic size={13} /> },
          { action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), icon: <List size={13} /> },
        ].map((btn, i) => (
          <button key={i} type="button" onClick={btn.action} style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #E2E2E2', background: btn.active ? '#E6F7F8' : 'white', cursor: 'pointer', color: btn.active ? '#0098A6' : '#444444', display: 'flex', alignItems: 'center' }}>
            {btn.icon}
          </button>
        ))}
        <div style={{ width: 1, background: '#E2E2E2', margin: '0 2px' }} />
        {(['H1', 'H2'] as const).map((level, i) => (
          <button key={level} type="button" onClick={() => editor.chain().focus().toggleHeading({ level: (i + 1) as 1 | 2 }).run()} style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #E2E2E2', background: editor.isActive('heading', { level: i + 1 }) ? '#E6F7F8' : 'white', cursor: 'pointer', color: '#444444', fontSize: 12, fontWeight: 700 }}>
            {level}
          </button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        style={{ minHeight: 180, padding: '12px', fontSize: 13.5, color: '#444444', lineHeight: 1.7 }}
        className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[140px]"
      />
    </div>
  );
}

export default function AdminBlogsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPostSummary | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: posts = [] } = useQuery({
    queryKey: ['blogs-admin'],
    queryFn: () => blogsApi.getAll(user?.role === 'ChurchAdmin' ? user.churchId : undefined),
  });

  const { data: churches = [] } = useQuery({ queryKey: ['churches'], queryFn: churchesApi.getAll });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        content,
        churchId: Number(form.churchId) || user?.churchId!,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      return editing ? blogsApi.update(editing.id, payload) : blogsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs-admin'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      setShowForm(false); setEditing(null); setForm(emptyForm); setContent('');
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => blogsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs-admin'] }),
  });

  const openEdit = async (post: BlogPostSummary) => {
    const full = await blogsApi.getById(post.id);
    setEditing(post);
    setForm({ title: full.title, excerpt: full.excerpt ?? '', author: full.author, churchId: full.churchId.toString(), coverImageUrl: full.coverImageUrl ?? '', tags: full.tags.join(', '), isPublished: full.isPublished, category: full.category ?? '' });
    setContent(full.content);
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setContent(''); setShowForm(true); };
  const setField = (key: keyof typeof form, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    return (!search || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q))
      && (!filterStatus || (filterStatus === 'published') === p.isPublished);
  });

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (showForm) {
    return (
      <div>
        <div style={s.pageHead}>
          <div>
            <h1 style={s.h1}>{editing ? 'Editar Post' : 'Nuevo Post'}</h1>
            <p style={s.sub}>Redacta y publica una nueva entrada en el blog.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={s.btnSecondary} onClick={() => setShowForm(false)}>← Volver</button>
            <button style={s.btnPrimary} onClick={() => save()} disabled={isPending}>{isPending ? 'Guardando...' : 'Publicar'}</button>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); save(); }}>
          <div style={s.formLayout}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Contenido */}
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="#1B5E20" strokeWidth="1.2"/><path d="M4.5 5H9.5M4.5 7.5H9.5M4.5 10H7" stroke="#1B5E20" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <span style={s.fcTitle}>Contenido del post</span>
                </div>
                <div style={s.fcBody}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Título <span style={{ color: '#0098A6' }}>*</span></label>
                    <input required style={{ ...s.fi, fontSize: 15, fontWeight: 600 }} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Escribe un título atractivo..." />
                  </div>
                  <div style={s.formRow2}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Categoría</label>
                      <select style={{ ...s.fi, cursor: 'pointer' }} value={form.category} onChange={e => setField('category', e.target.value)}>
                        <option value="">Sin categoría</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Autor <span style={{ color: '#0098A6' }}>*</span></label>
                      <input required style={s.fi} value={form.author} onChange={e => setField('author', e.target.value)} placeholder="Nombre del autor" />
                    </div>
                  </div>
                  {user?.role === 'SuperAdmin' && (
                    <div style={s.formGroup}>
                      <label style={s.label}>Iglesia <span style={{ color: '#0098A6' }}>*</span></label>
                      <select required style={{ ...s.fi, cursor: 'pointer' }} value={form.churchId} onChange={e => setField('churchId', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={s.formGroup}>
                    <label style={s.label}>Resumen / Extracto</label>
                    <textarea style={{ ...s.fi, resize: 'vertical', minHeight: 60 }} value={form.excerpt} onChange={e => setField('excerpt', e.target.value)} rows={2} placeholder="Breve descripción que aparece en la lista del blog..." />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Contenido <span style={{ color: '#0098A6' }}>*</span></label>
                    <RichEditor value={content} onChange={setContent} />
                  </div>
                </div>
              </div>

              {/* Imagen portada */}
              <div style={s.formCard}>
                <div style={s.fcHeader}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: '#EDE8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="#5B21B6" strokeWidth="1.2"/><path d="M1.5 9L4.5 6L7 8.5L9 7L12.5 10" stroke="#5B21B6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="5.5" r="1.3" stroke="#5B21B6" strokeWidth="1.2"/></svg>
                  </div>
                  <span style={s.fcTitle}>Imagen de portada</span>
                </div>
                <div style={s.fcBody}>
                  <div style={s.formGroup}>
                    <label style={s.label}>URL imagen portada</label>
                    <input style={s.fi} value={form.coverImageUrl} onChange={e => setField('coverImageUrl', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Estado */}
              <div style={s.sfCard}>
                <div style={s.sfHeader}>Estado</div>
                <div style={s.sfBody}>
                  {[
                    { value: true,  dot: '#1B5E20', label: 'Publicado' },
                    { value: false, dot: '#E8A020', label: 'Borrador' },
                  ].map(opt => (
                    <div key={String(opt.value)} onClick={() => setField('isPublished', opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1.5px solid ${form.isPublished === opt.value ? '#0098A6' : '#E2E2E2'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: form.isPublished === opt.value ? 700 : 500, color: form.isPublished === opt.value ? '#00818C' : '#444444', background: form.isPublished === opt.value ? '#F0FAFB' : 'white', marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO y tags */}
              <div style={s.sfCard}>
                <div style={s.sfHeader}>SEO y etiquetas</div>
                <div style={{ ...s.sfBody, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Etiquetas (separadas por coma)</label>
                    <input style={{ ...s.fi, fontSize: 12.5 }} value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="fe, oración, vida cristiana" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="submit" style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center' }} disabled={isPending}>{isPending ? 'Guardando...' : 'Publicar post'}</button>
                <button type="button" style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={() => { setField('isPublished', false); save(); }}>Guardar borrador</button>
                <button type="button" style={{ ...s.btnSecondary, width: '100%', justifyContent: 'center' }} onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.h1}>Blog</h1>
          <p style={s.sub}>Gestiona las publicaciones del blog de la plataforma.</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><line x1="6.5" y1="2" x2="6.5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="6.5" x2="11" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Nuevo post
        </button>
      </div>

      <div style={s.tableWrap}>
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#ABABAB', pointerEvents: 'none' }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input style={s.searchInput} placeholder="Buscar post..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select style={s.filterSel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Título', 'Autor', 'Categoría', 'Iglesia', 'Estado', 'Acciones'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(post => (
              <tr key={post.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(post)}>
                <td style={{ ...s.td, fontWeight: 700, color: '#1A1A1A', maxWidth: 320 }}>{post.title}</td>
                <td style={s.td}>{post.author}</td>
                <td style={s.td}>{post.category || '—'}</td>
                <td style={s.td}>{post.churchName}</td>
                <td style={s.td}>
                  <span style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: post.isPublished ? '#E8F5E9' : '#F3F3F3', color: post.isPublished ? '#1B5E20' : '#5C5C5C' }}>
                    {post.isPublished ? '✓ Publicado' : 'Borrador'}
                  </span>
                </td>
                <td style={s.td} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={s.actBtn} onClick={() => openEdit(post)} title="Editar"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg></button>
                    <button style={s.actBtn} onClick={() => { if (confirm('¿Eliminar publicación?')) remove(post.id); }} title="Eliminar"><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5H11M4.5 3.5V2.5H8.5V3.5M5 6V10M8 6V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#ABABAB' }}>
                <div style={{ width: 56, height: 56, background: '#E8F5E9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="3" stroke="#1B5E20" strokeWidth="1.5"/><path d="M7 8H17M7 12H17M7 16H12" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Sin publicaciones</div>
                <div style={{ fontSize: 13, marginBottom: 18 }}>No hay posts. Crea el primero.</div>
                <button style={s.btnPrimary} onClick={openNew}>Nuevo post</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
