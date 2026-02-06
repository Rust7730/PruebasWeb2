import { getFinesSummary } from '@/lib/data';
import Link from 'next/link';
import Header from '@/app/components/Headder';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ start?: string; end?: string }>;

export default async function FinesPage(props: {
    searchParams: SearchParams
  }) {
  const searchParams = await props.searchParams;
  const start = searchParams.start || '';
  const end = searchParams.end || '';
  
  const { data: fines, error } = await getFinesSummary(start, end);

  return (
    <main className="min-h-screen bg-gray-50 ">
        <Header 
                title="Resumen de Multas" 
                backUrl="/" 
                backText="Volver al Dashboard"
              />
      <div className="max-w-5xl mx-auto">

        <div className="mb-8 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Filtrar por Periodo</h3>
            <form className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Desde (YYYY-MM)</label>
                    <input name="start" type="month" defaultValue={start} className="border rounded px-3 py-2 text-sm text-green-600 bg-green-50"/>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Hasta (YYYY-MM)</label>
                    <input name="end" type="month" defaultValue={end} className="border rounded px-3 py-2 text-sm text-green-600 bg-green-50"/>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors">
                  Aplicar Filtros
                </button>
                {(start || end) && (
                   <Link href="/reports/FinesSummary" className="text-sm text-gray-500 hover:text-gray-700 underline px-2 py-2">
                     Limpiar
                   </Link>
                )}
            </form>
        </div>

        {error && <p className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</p>}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fines.map((row) => (
                <div key={row.month_year} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{row.month_year}</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
                          {row.total_fines_issued} multas
                        </span>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Recaudado (Pagado)</span>
                            <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              +${Number(row.total_collected).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Pendiente de Cobro</span>
                            <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                              -${Number(row.total_pending).toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400 font-medium">EFICIENCIA DE COBRO</span>
                                <span className="font-bold text-gray-700">{row.collection_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full ${Number(row.collection_rate) > 80 ? 'bg-green-500' : Number(row.collection_rate) > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                  style={{ width: `${row.collection_rate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {fines.length === 0 && !error && (
           <p className="text-center text-gray-500 mt-10">No hay registros financieros para este periodo.</p>
        )}
      </div>
    </main>
  );
}