import React, { useState } from 'react';
import axios from 'axios';

export default function FlashSale({ product }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');
    const [buttonText, setButtonText] = useState('⚡ Buy Now ⚡');

    const handlePurchase = async () => {
        setIsProcessing(true);
        setButtonText('Securing item...');
        setStatusMessage('');

        try {
            const response = await axios.post('/flash-sale/purchase', {
                product_id: product.id
            });

            if (response.status === 202) {
                setStatusType('success');
                setStatusMessage(response.data.message);
                setButtonText('Order Reserved!');
            }
        } catch (error) {
            setStatusType('error');
            if (error.response && error.response.status === 422) {
                setStatusMessage(error.response.data.message);
                setButtonText('Sold Out');
                setIsSoldOut(true);
            } else {
                setStatusMessage('Network overload. Please try again!');
                setButtonText('⚡ Try Again ⚡');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
                <div className="text-center">
                    <span className="bg-red-500 text-xs text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                        Live Flash Sale
                    </span>
                    <h1 className="text-3xl font-extrabold mt-3 tracking-tight">{product?.name || 'Product empty'}</h1>
                    <p className="text-gray-400 mt-1">Exclusive Limited Release</p>
                </div>

                <div className="mt-6 bg-gray-900 p-4 rounded-xl border border-gray-700 text-center">
                    <span className="text-4xl font-black text-amber-400">
                        ${(product.price_cents / 100).toFixed(2)}
                    </span>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing || isSoldOut}
                        className={`w-full font-bold py-4 px-6 rounded-xl transition duration-150 shadow-lg text-lg uppercase tracking-wide text-gray-900 ${isSoldOut
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transform active:scale-95'
                            }`}
                    >
                        {buttonText}
                    </button>

                    {statusMessage && (
                        <div
                            className={`mt-4 p-4 rounded-xl border text-center font-medium text-sm transition-all ${statusType === 'success'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border-rose-800'
                                }`}
                        >
                            {statusMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}