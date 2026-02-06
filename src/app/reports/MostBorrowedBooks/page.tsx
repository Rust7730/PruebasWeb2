import Search from '@/app/components/Search';
import Pagination from '@/app/components/Pagination';
import { getMostBorrowedBooks } from '@/lib/data';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function TopBooksPage(props: {
  searchParams: SearchParams 
})
 {
  const searchParams = await props.searchParams;
  
  const query = searchParams.q || '';
  const currentPage = Number(searchParams.page) || 1;

  const { data: books, totalPages, error } = await getMostBorrowedBooks(query, currentPage);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8 flex-col md:flex-row gap-4 ">
          <div>
             <Link href="/" className="text-blue-600 text-sm hover:underline mb-2 block border border-blue-600 rounded px-2 py-1">&larr; Volver al Dashboard</Link>
             <h1 className="text-3xl font-bold text-gray-900">Top Libros Populares</h1>
             <p className="text-gray-500 mt-1">Ranking basado en frecuencia histórica de préstamos.</p>
          </div>
        </div>

        <div className="mb-6 w-full md:w-1/3">
          <Search placeholder="Buscar por título o autor..." />
        </div>

        {error ? (
           <div className="p-4 bg-red-100 text-red-700 rounded border border-red-200">
             {error}
           </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Libro</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-green-700 uppercase tracking-wider">Total Préstamos</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-green-700 uppercase tracking-wider">% Popularidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.book_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                        ${book.popularity_rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                          book.popularity_rank === 2 ? 'bg-gray-100 text-gray-800' : 
                          book.popularity_rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}
                      `}>
                        #{book.popularity_rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {book.total_loans}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {book.loan_percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {books.length === 0 && (
               <div className="p-12 text-center text-gray-400">
                 No se encontraron libros con ese criterio.
               </div>
            )}
          </div>
        )}

        {!error && totalPages > 1 && (
           <Pagination totalPages={totalPages} />
        )}
      </div>
    </main>
  );
}