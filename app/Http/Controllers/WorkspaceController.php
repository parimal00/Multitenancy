<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateTenantRequest;
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

    public function create()
    {
        return Inertia::render('Workspace/Create');
    }

    public function store(CreateTenantRequest $request)
    {
        $data = $request->validated();

        $tenant = $this->tenantService->createTenant(
            $data['company_name'],
            $data['subdomain']
        );

        return Inertia::location('http://' . $tenant->domain . '/dashboard');
    }
}
