import { getInventoryHealth } from '@/lib/data';
import Link from 'next/link';
import Header from '@/app/components/Headder';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { data: inventory, error } = await getInventoryHealth();

  return (
    <main className="min-h-screen bg-gray-50 ">
      <Header 
        title="Estado de Inventario" 
        backUrl="/" 
        backText="Volver al Dashboard"
      />

      <div className="max-w-4xl mx-auto p-8">
        
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total Copias</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-green-600 uppercase tracking-wider">Disponibles</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Prestados</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-red-600 uppercase tracking-wider">No Disp.</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">% Disponibilidad</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {inventory.map((cat) => (
                        <tr key={cat.category} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cat.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{cat.total_copies}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-bold">
                                    {cat.in_shelf}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-blue-600 font-medium">{cat.loaned_out}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-red-600 font-medium">{cat.unavailable}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className="bg-gray-600 h-1.5 rounded-full" 
                                            style={{ width: `${cat.availability_percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{cat.availability_percentage}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </main>
  );
}