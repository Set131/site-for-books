<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBooksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\User::class, 'user_id');
            $table->string('title', 255);
            $table->string('slug', 1000);
            $table->text('description')->nullable();
            $table->string('photo', 255);
            $table->float('rating', 3, 1)->default(0);
            $table->integer('age_limit')->nullable()->default(0);
            $table->string('tags', 500)->nullable();
            $table->unsignedBigInteger('views')->default(0); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('books');
    }
}