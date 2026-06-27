import React, { useState } from 'react';
import axios from 'axios';

export default function FlashSales({ initialProducts }) {
    // Keep track of processing states, sold out states, and buttons for each card individually
    const [products, setProducts] = useState(initialProducts || []);
    const [processingId, setProcessingId] = useState(null);
    const [statuses, setStatuses] = useState({}); // e.g., { productId: { message: '', type: '' } }

    const handlePurchase = async (productId) => {
        setProcessingId(productId);
        setStatuses(prev => ({ ...prev, [productId]: null })); // clear old message

        try {
            const response = await axios.post('/flash-sale/purchase', {
                product_id: productId
            });

            if (response.status === 202) {
                setStatuses(prev => ({
                    ...prev,
                    [productId]: { type: 'success', message: response.data.message }
                }));
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setStatuses(prev => ({
                    ...prev,
                    [productId]: { type: 'error', message: error.response.data.message }
                }));
                // Set stock to 0 dynamically in local state to freeze the button
                setProducts(prev => prev.map(p => p.id === productId ? { ...p, flash_sale_stock: 0 } : p));
            } else {
                setStatuses(prev => ({
                    ...prev,
                    [productId]: { type: 'error', message: 'Network overload. Try again!' }
                }));
            }
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-gray-950 text-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div className="max-w-6xl mx-auto">

                {/* Header Matrix */}
                <header className="border-b border-gray-800 pb-6 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-red-500 text-[10px] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                Live Drop
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mt-1 uppercase">⚡ Flash Allocations</h1>
                    </div>
                    <p className="text-sm text-gray-400 max-w-xs sm:text-right">
                        High-demand queue active. Orders are processed instantly on a first-come basis.
                    </p>
                </header>

                {/* Products Grid Architecture */}
                {products.length === 0 ? (
                    <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-900/50">
                        <p className="text-sm text-gray-500">No active promotional data assets found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => {
                            const isSoldOut = product.flash_sale_stock <= 0;
                            const isThisProcessing = processingId === product.id;
                            const status = statuses[product.id];

                            // Determine active context button copy
                            let buttonText = '⚡ Buy Now ⚡';
                            if (isThisProcessing) buttonText = 'Securing item...';
                            else if (status?.type === 'success') buttonText = 'Order Reserved!';
                            else if (isSoldOut) buttonText = 'Sold Out';

                            return (
                                <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-200 hover:border-gray-700">

                                    <div>
                                        {/* Meta Header */}
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h3 className="text-xl font-bold text-white tracking-tight">
                                                {product.name}
                                            </h3>
                                            <span className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${isSoldOut
                                                ? 'text-gray-500 border-gray-800 bg-gray-950'
                                                : 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse'
                                                }`}>
                                                {isSoldOut ? 'Depleted' : `${product.flash_sale_stock} units left`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Exclusive Drop</p>

                                        {/* Price display container */}
                                        <div className="my-6 bg-gray-950 p-4 rounded-xl border border-gray-800 text-center">
                                            <span className="text-3xl font-black text-amber-400 tracking-tight">
                                                ${product.price}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submissions & Messages Block */}
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handlePurchase(product.id)}
                                            disabled={isThisProcessing || isSoldOut || status?.type === 'success'}
                                            className={`w-full font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md text-sm uppercase tracking-wide text-gray-900 ${isSoldOut || status?.type === 'success'
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 shadow-none'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transform active:scale-[0.98]'
                                                }`}
                                        >
                                            {buttonText}
                                        </button>

                                        {status && (
                                            <div className={`mt-3 p-3 rounded-xl border text-center font-medium text-xs transition-all ${status.type === 'success'
                                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900/60'
                                                : 'bg-rose-950/80 text-rose-400 border-rose-900/60'
                                                }`}>
                                                {status.message}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}