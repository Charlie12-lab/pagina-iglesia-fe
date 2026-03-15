import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { blogsApi } from '../../api/blogs';
import { BookOpen, User, Calendar, Tag } from 'lucide-react';

export default function BlogPage() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogsApi.getAll(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-800">Blog</h1>
        <p className="text-gray-600 mt-2">Mensajes, reflexiones y noticias de nuestras comunidades.</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow animate-pulse h-64" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col"
          >
            {post.coverImageUrl ? (
              <img src={post.coverImageUrl} alt={post.title}
                className="w-full h-44 object-cover" />
            ) : (
              <div className="w-full h-44 bg-indigo-50 flex items-center justify-center">
                <BookOpen size={40} className="text-indigo-200" />
              </div>
            )}

            <div className="p-5 flex flex-col flex-1">
              <p className="text-indigo-600 text-xs font-semibold mb-1">{post.churchName}</p>
              <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>

              {post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3 flex-1 mb-3">{post.excerpt}</p>
              )}

              <div className="mt-auto space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <User size={12} />
                  <span>{post.author}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{format(new Date(post.publishedAt), "dd 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                )}
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag size={12} />
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No hay publicaciones aún.</p>
        </div>
      )}
    </div>
  );
}
