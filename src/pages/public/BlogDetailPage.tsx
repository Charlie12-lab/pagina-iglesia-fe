import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { blogsApi } from '../../api/blogs';
import { ArrowLeft, User, Calendar, Tag } from 'lucide-react';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Publicación no encontrada.</p>
        <Link to="/blog" className="text-indigo-600 hover:underline mt-4 inline-block">
          Volver al blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/blog" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 mb-6 text-sm">
        <ArrowLeft size={16} />
        Volver al blog
      </Link>

      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post.title}
          className="w-full h-64 object-cover rounded-2xl mb-6" />
      )}

      <p className="text-indigo-600 font-semibold mb-1">{post.churchName}</p>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span>{post.author}</span>
        </div>
        {post.publishedAt && (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{format(new Date(post.publishedAt), "dd 'de' MMMM, yyyy", { locale: es })}</span>
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag size={14} />
            {post.tags.map(tag => (
              <span key={tag} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="prose prose-indigo max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
