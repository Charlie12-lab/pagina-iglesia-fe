import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { blogsApi } from '../../api/blogs';
import { churchesApi } from '../../api/churches';
import { useAuthStore } from '../../store/authStore';
import { Plus, Pencil, Trash2, BookOpen, Bold, Italic, List } from 'lucide-react';
import type { BlogPostSummary } from '../../types';

const emptyForm = {
  title: '', excerpt: '', author: '', churchId: '',
  coverImageUrl: '', tags: '', isPublished: false,
};

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}>
          <Bold size={14} />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}>
          <Italic size={14} />
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>
          <List size={14} />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-40 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-indigo-500 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-32"
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

  const { data: posts = [] } = useQuery({
    queryKey: ['blogs-admin'],
    queryFn: () => blogsApi.getAll(user?.role === 'ChurchAdmin' ? user.churchId : undefined),
  });

  const { data: churches = [] } = useQuery({
    queryKey: ['churches'],
    queryFn: churchesApi.getAll,
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        content,
        churchId: Number(form.churchId) || user?.churchId!,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      return editing
        ? blogsApi.update(editing.id, payload)
        : blogsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs-admin'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setContent('');
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => blogsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blogs-admin'] }),
  });

  const openEdit = async (post: BlogPostSummary) => {
    const full = await blogsApi.getById(post.id);
    setEditing(post);
    setForm({
      title: full.title,
      excerpt: full.excerpt ?? '',
      author: full.author,
      churchId: full.churchId.toString(),
      coverImageUrl: full.coverImageUrl ?? '',
      tags: full.tags.join(', '),
      isPublished: full.isPublished,
    });
    setContent(full.content);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Blog</h2>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setContent(''); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Nueva publicación
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editing ? 'Editar publicación' : 'Nueva publicación'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Título *</label>
                <input required value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Autor *</label>
                <input required value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              {user?.role === 'SuperAdmin' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Iglesia *</label>
                  <select required value={form.churchId}
                    onChange={e => setForm(f => ({ ...f, churchId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar...</option>
                    {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL imagen portada</label>
                <input value={form.coverImageUrl}
                  onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
                <input value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="fe, comunidad, sermón"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Resumen</label>
                <textarea value={form.excerpt} rows={2}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Contenido *</label>
                <RichEditor value={content} onChange={setContent} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isPublished} id="published"
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="rounded" />
                <label htmlFor="published" className="text-sm text-gray-700 cursor-pointer">
                  Publicar ahora
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
            {post.coverImageUrl && (
              <img src={post.coverImageUrl} alt={post.title}
                className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <p className="text-xs text-indigo-600 font-medium">{post.churchName}</p>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
            <p className="text-xs text-gray-500 mb-3">{post.author}</p>

            <div className="mt-auto flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {post.isPublished ? 'Publicado' : 'Borrador'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(post)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => confirm('¿Eliminar publicación?') && remove(post.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-2 text-gray-200" />
            No hay publicaciones. Crea la primera.
          </div>
        )}
      </div>
    </div>
  );
}
