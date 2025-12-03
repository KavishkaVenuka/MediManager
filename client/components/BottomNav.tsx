import { Plus, Package, Home, ShoppingCart } from 'lucide-react';

export default function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center pb-6 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button className="bg-primary-teal text-white p-3 rounded-xl shadow-lg -mt-8 border-4 border-white">
                <Home size={28} />
            </button>
            <button className="text-primary-teal p-2">
                <Plus size={32} />
            </button>
            <button className="text-primary-teal p-2">
                <Package size={28} />
            </button>
            <button className="text-primary-teal p-2">
                <ShoppingCart size={28} />
            </button>
        </div>
    );
}
