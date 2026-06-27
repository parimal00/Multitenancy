<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenantProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            'name' => 'Premium Mechanical Keyboard',
            'stock' => 10,
            'price_cents' => 9900,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
