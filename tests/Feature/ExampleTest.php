<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Test 1: Root URL / automatically serves the login page when unauthenticated.
     */
    public function test_root_url_automatically_serves_login_when_unauthenticated(): void
    {
        $response = $this->get('/');

        $response->assertRedirect('/login');
    }

    /**
     * Test 2: Login page /login is accessible and returns 200 OK.
     */
    public function test_login_page_returns_successful_response(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertSee('Đăng Nhập Quản Trị MayHem');
    }
}
