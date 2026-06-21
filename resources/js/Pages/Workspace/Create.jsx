import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        subdomain: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/create-workspace');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Create Workspace" />

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Launch Your SaaS Workspace
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Set up your isolated database instance in seconds.
                    </p>
                </div>

                <form onSubmit={submit} className="mt-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            value={data.company_name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            required
                            onChange={(e) => setData('company_name', e.target.value)}
                        />
                        {errors.company_name && (
                            <p className="mt-2 text-sm text-red-600">{errors.company_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Desired Subdomain</label>
                        <div className="flex items-center mt-1 rounded-md shadow-sm">
                            <input
                                type="text"
                                value={data.subdomain}
                                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border rounded-r-none border-r-0 text-right pr-2"
                                placeholder="my-company"
                                required
                                onChange={(e) => setData('subdomain', e.target.value)}
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-[38px]">
                                .saas.test
                            </span>
                        </div>
                        {errors.subdomain && (
                            <p className="mt-2 text-sm text-red-600">{errors.subdomain}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {processing ? 'Provisioning Architecture...' : 'Deploy Workspace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
