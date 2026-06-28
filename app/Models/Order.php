<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $connection = 'tenant';
    protected $fillable = [
        'user_id',
        'product_id',
        'status',
    ];
}
