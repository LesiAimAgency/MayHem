<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed MayHem Admin System users.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'MayHem Super Admin',
                'email' => 'admin@mayhem.vn',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'permissions' => json_encode([
                    'view_data',
                    'filter_data',
                    'edit_data',
                    'export_excel',
                    'manage_users',
                    'add_year',
                    'view_audit_logs',
                    'backup_restore',
                ]),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kiểm Toán Viên Trưởng (Editor)',
                'email' => 'editor@mayhem.vn',
                'password' => Hash::make('editor123'),
                'role' => 'editor',
                'permissions' => json_encode([
                    'view_data',
                    'filter_data',
                    'edit_data',
                    'export_excel',
                    'view_audit_logs',
                ]),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Chuyên Viên Phân Tích (Staff)',
                'email' => 'staff@mayhem.vn',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'permissions' => json_encode([
                    'view_data',
                    'filter_data',
                    'edit_data',
                ]),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
