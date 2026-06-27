import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function Index({ products }) {
    const { flash } = usePage().props;

    // Manage state mapping with Inertia Form helper utilities
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        stock: 0,
        is_flash_sale: false,
        flash_sale_stock: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name: data.name,
            stock: data.stock,
            is_flash_sale: data.is_flash_sale,
            flash_sale_stock: data.flash_sale_stock,
            price_cents: Math.round(parseFloat(data.price) * 100) // Formatted instantly
        };

        setData('price_cents', Math.round(parseFloat(data.price) * 100));

        // Pass the payload directly to the Inertia request execution block
        post('/admin/products', {
            onSuccess: () => reset()
        });
    };

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight mb-8">📦 Tenant Inventory Management Dashboard</h1>

                {flash?.success && (
                    <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded mb-6">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Side: Create Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Inventory Stream</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Product Designation Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Base MySQL Stock</label>
                                    <input
                                        type="number"
                                        value={data.stock}
                                        onChange={e => setData('stock', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                        required
                                    />
                                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                                </div>
                            </div>

                            <hr className="border-gray-100 my-4" />

                            <div className="flex items-center space-x-3 bg-indigo-50 p-3 rounded">
                                <input
                                    type="checkbox"
                                    id="is_flash_sale"
                                    checked={data.is_flash_sale}
                                    onChange={e => setData('is_flash_sale', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600"
                                />
                                <label htmlFor="is_flash_sale" className="text-sm font-semibold text-indigo-900 select-none cursor-pointer">Designate as High-Speed Flash Sale</label>
                            </div>

                            {data.is_flash_sale && (
                                <div className="transition-all duration-200">
                                    <label className="block text-sm font-medium text-amber-700 mb-1 font-semibold">Isolated Redis Flash Sale Stock Buffer</label>
                                    <input
                                        type="number"
                                        value={data.flash_sale_stock}
                                        onChange={e => setData('flash_sale_stock', e.target.value)}
                                        className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded focus:outline-none focus:border-amber-500"
                                        required
                                    />
                                    <p className="text-xs text-amber-600 mt-1">This metrics allocating value will warm-boot directly inside memory.</p>
                                    {errors.flash_sale_stock && <p className="text-red-500 text-xs mt-1">{errors.flash_sale_stock}</p>}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2 rounded transition shadow-sm"
                            >
                                Save & Synchronize Infrastructure
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Inventory Matrix Table */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Live Infrastructure Matrix</h2>

                        {products.length === 0 ? (
                            <p className="text-gray-500 italic py-8 text-center">No products found inside this tenant context namespace.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3 px-4">Item Details</th>
                                            <th className="py-3 px-4 text-center">Standard Stock (DB)</th>
                                            <th className="py-3 px-4 text-center">Flash Mode</th>
                                            <th className="py-3 px-4 text-center">Redis Cache Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-gray-900">{product.name}</div>
                                                    <div className="text-gray-500 text-xs">${product.price.toFixed(2)}</div>
                                                </td>
                                                <td className="py-4 px-4 text-center font-mono text-gray-600">{product.stock} units</td>
                                                <td className="py-4 px-4 text-center">
                                                    {product.is_flash_sale ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">ACTIVE</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">OFF</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-center font-mono">
                                                    {product.is_flash_sale ? (
                                                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                                            {product.redis_stock} units
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Bypassed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}