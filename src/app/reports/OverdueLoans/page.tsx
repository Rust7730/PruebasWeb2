import Pagination from '@/app/components/Pagination';
import { getOverdueLoans } from '@/lib/data';
import Link from 'next/link';
import Header from '@/app/components/Headder';
export const dynamic = 'force-dynamic';

// Definir tipo para Next.js 15
type SearchParams = Promise<{ days?: string; page?: string }>;

export default async function OverdueLoansPage(props: {
  searchParams: SearchParams
}) {  const searchParams = await props.searchParams;
  
  const minDays = Number(searchParams.days) || 0;
  const currentPage = Number(searchParams.page) || 1;

  const { data: loans, totalPages, error } = await getOverdueLoans(minDays, currentPage);

  return (
    <main className="min-h-screen bg-gray-50 ">
        <Header 
        title="Préstamos Vencidos" 
        backUrl="/" 
        backText="Volver al Dashboard"
      />
      <div className="max-w-6xl mx-auto p-8">
      
      
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">

          <div className="bg-white p-3 rounded border shadow-sm border  flex items-center gap-2">
            <form className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 ">Mínimo días de atraso:</label>
                <input 
                    name="days" 
                    type="number" 
                    defaultValue={minDays}
                    className="border rounded px-2 py-1 w-20 text-sm"
                />
                <button type="submit" className="bg-red-600 hover:bg-red-700 rounded border text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                  Filtrar
                </button>
            </form>
          </div>
        </div>

        {error ? (
           <div className="p-4 bg-red-100 text-red-700 rounded border border-red-200">{error}</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Socio</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Libro Prestado</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-green-700 uppercase tracking-wider">Fecha Límite</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider">Días Atraso</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-green-700 uppercase tracking-wider">Multa Sugerida</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.loan_id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{loan.member_name}</div>
                      <div className="text-xs text-gray-500">{loan.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 italic">
                      {loan.book_title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(loan.due_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                        {loan.days_overdue} días
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-900">
                      ${Number(loan.suggested_fine_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {loans.length === 0 && (
               <div className="p-12 text-center text-gray-400">¡Genial! No hay préstamos vencidos con ese criterio.</div>
            )}
          </div>
        )}
        
        {totalPages > 1 && <Pagination totalPages={totalPages} />}
      </div>
    </main>
  );
}