<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TenantService;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    // Render the React Form
    public function create()
    {
        return Inertia::render('Workspace/Create');
    }

    // Handle the Form Submission
    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'subdomain' => 'required|string|alpha_dash|unique:tenants,domain|max:50',
        ]);

        // Provision database and register tenant
        $tenant = $this->tenantService->createTenant(
            $request->company_name,
            $request->subdomain
        );

        // Redirect the user to their brand new dynamic subdomain dashboard!
        return Inertia::location('http://' . $tenant->domain . '/dashboard');
    }
}
