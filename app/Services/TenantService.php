<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Spatie\Multitenancy\Models\Tenant;

class TenantService
{
    public function createTenant(string $name, string $subdomain): Tenant
    {
        $dbName = 'saas_tenant_' . strtolower($this->clean_string($subdomain));
        $domain = $subdomain . '.saas.test';

        DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}`");

        $tenant = Tenant::create([
            'name' => $name,
            'domain' => $domain,
            'database' => $dbName,
        ]);

        $tenant->makeCurrent();
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);
        $tenant->forgetCurrent();

        return $tenant;
    }

    private function clean_string($string)
    {
        return preg_replace('/[^A-Za-z0-9\-]/', '', $string);
    }
}
