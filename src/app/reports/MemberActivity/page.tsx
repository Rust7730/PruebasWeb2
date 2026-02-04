import { getMemberActivity } from '@/lib/data';
import Link from 'next/link';
import Header from '@/app/components/Headder';
export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const { data: members, error } = await getMemberActivity();

  return (
    <main className="min-h-screen bg-gray-50 ">
        <Header 
        title="Actividad de Socios" 
        backUrl="/" 
        backText="Volver al Dashboard"
      />
      <div className="max-w-6xl mx-auto p-8">

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => {
                const isRisk = m.member_standing === 'RISK';
                const isSuper = m.member_standing === 'SUPER_USER';
                
                const borderColor = isRisk ? 'border-l-red-500' : isSuper ? 'border-l-purple-500' : 'border-l-emerald-500';
                const badgeColor = isRisk ? 'bg-red-100 text-red-700' : isSuper ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700';

                return (
                  <div key={m.member_id} className={`p-6 rounded-lg border-l-4  shadow-sm bg-white hover:shadow-md transition-shadow ${borderColor}`}>
                      
                      <div className="flex justify-between items-start mb-4">
                          <div className="overflow-hidden">
                              <h3 className="font-bold text-lg text-gray-900 truncate">{m.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{m.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-wide rounded font-bold flex-shrink-0 ml-2 ${badgeColor}`}>
                              {m.member_standing.replace('_', ' ')}
                          </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="bg-gray-50 p-3 rounded text-center">
                              <p className="text-gray-400 text-xs uppercase font-semibold">Historial</p>
                              <p className="font-bold text-xl text-gray-800">{m.total_loans_history}</p>
                              <p className="text-[10px] text-gray-400">préstamos</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded text-center">
                              <p className="text-gray-400 text-xs uppercase font-semibold">Activos</p>
                              <p className="font-bold text-xl text-gray-800">{m.current_active_loans}</p>
                              <p className="text-[10px] text-gray-400">en casa</p>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                          <span className="text-gray-500">Devoluciones Tardías:</span>
                          <span className={`font-bold ${Number(m.late_return_rate) > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                            {m.late_return_rate}%
                          </span>
                      </div>
                  </div>
                );
            })}
        </div>
      </div>
    </main>
  );
}