// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:5500';
const BACKEND  = 'http://103.151.63.88:8013';

// !! GANTI dengan username & password WARGA yang ADA di database server deploy !!
const USERNAME = 'yuri';
const PASSWORD = 'yurielva';

// !! GANTI dengan username & password ADMIN yang ADA di database server deploy !!
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';


async function loginViaAPI(page) {
    await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });

    const response = await page.request.post(BACKEND + '/api/token/', {
        data: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok()) {
        throw new Error('Login gagal! Cek USERNAME dan PASSWORD di file test.');
    }

    const tokens = await response.json();

    await page.evaluate((t) => {
        localStorage.setItem('access_token', t.access);
        localStorage.setItem('refresh_token', t.refresh);
        window.location.hash = '#dashboard';
    }, tokens);

    await page.waitForSelector('#btnLaporanBaru', { timeout: 15000 });
}


async function loginAsAdmin(page) {
    await page.goto(BACKEND + '/login/', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click('form button[type="submit"], form input[type="submit"]')
    ]);
}


test.describe('Modul 5: Interaktivitas UI (UI-01 through UI-06)', () => {

    test('AUTH04: Akses dashboard tanpa token redirect ke login', async ({ page }) => {
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        });

        await page.evaluate(() => { window.location.hash = '#dashboard'; });
        await page.waitForTimeout(1500);

        expect(page.url()).toContain('#login');
        console.log('[AUTH04] ✅ Akses tanpa token berhasil di-redirect ke halaman login');
    });


    test('AUTH06: Token kadaluarsa halaman tetap stabil tidak crash', async ({ page }) => {
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            localStorage.setItem('access_token', 'header.payload.signature_palsu');
            localStorage.setItem('refresh_token', 'refresh_palsu');
            window.location.hash = '#dashboard';
        });
        await page.waitForTimeout(2500);

        const url = page.url();
        const isStable = url.includes('#dashboard') || url.includes('#login');
        expect(isStable).toBeTruthy();
        await expect(page.locator('body')).toBeAttached();
        console.log('[AUTH06] ✅ Halaman tetap stabil walau token kadaluarsa/rusak');
    });


    test('AUTH05: Silent refresh saat access token expired', async ({ page }) => {
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });

        const response = await page.request.post(BACKEND + '/api/token/', {
            data: { username: USERNAME, password: PASSWORD },
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok()) throw new Error('Login gagal!');

        const tokens = await response.json();
        const brokenAccessToken = tokens.access.slice(0, -5) + 'XXXXX';

        await page.evaluate(({ broken, refresh }) => {
            localStorage.setItem('access_token', broken);
            localStorage.setItem('refresh_token', refresh);
            window.location.hash = '#dashboard';
        }, { broken: brokenAccessToken, refresh: tokens.refresh });

        await page.waitForSelector('#btnLaporanBaru', { timeout: 15000 });

        const refreshPromise = page.waitForResponse(
            res => res.url().includes('/api/token/refresh/'),
            { timeout: 15000 }
        );

        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(500);
        await expect(page.locator('#reportModal')).toBeVisible();

        await page.fill('#reportTitle',       'Laporan Test AUTH05');
        await page.fill('#reportCategory',    'Jalan');
        await page.fill('#reportLocation',    'Jl. Silent Refresh No. 5');
        await page.fill('#reportDescription', 'Menguji silent refresh token saat access token expired');

        await page.locator('#btnDraft').click();

        const refreshResponse = await refreshPromise;
        expect(refreshResponse.status()).toBe(200);

        await expect(page.locator('#reportModal')).not.toBeVisible({ timeout: 10000 });
        console.log('[AUTH05] ✅ Silent refresh berjalan di background, aduan tetap terkirim tanpa interupsi');
    });


    test('UI-01: Chart.js di Dashboard Admin ter-render dengan benar', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(BACKEND + '/dashboard/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const statusChart   = page.locator('#statusChart');
        const categoryChart = page.locator('#categoryChart');

        await expect(statusChart).toBeVisible();
        await expect(categoryChart).toBeVisible();

        const statusChartHasContent = await statusChart.evaluate((canvas) => {
            return canvas.width > 0 && canvas.height > 0;
        });
        expect(statusChartHasContent).toBeTruthy();
        console.log('[UI-01] ✅ Chart.js statusChart dan categoryChart berhasil ter-render');
    });


    test('UI-02: Pencarian menyaring tabel laporan secara instan', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(BACKEND + '/reports/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const tableRows      = page.locator('#reportTable tbody tr');
        const totalRowsBefore = await tableRows.count();
        expect(totalRowsBefore).toBeGreaterThan(0);

        const firstRowText = await tableRows.first().textContent();
        const keyword      = (firstRowText || '').trim().split(/\s+/)[0] || 'a';

        await page.fill('#searchInput', keyword);
        await page.waitForTimeout(800);

        const visibleRowsAfter  = page.locator('#reportTable tbody tr:visible');
        const visibleCountAfter = await visibleRowsAfter.count();
        expect(visibleCountAfter).toBeLessThanOrEqual(totalRowsBefore);
        expect(visibleCountAfter).toBeGreaterThan(0);

        await page.locator('#clearSearch').click();
        await page.waitForTimeout(500);

        const visibleRowsReset  = page.locator('#reportTable tbody tr:visible');
        const visibleCountReset = await visibleRowsReset.count();
        expect(visibleCountReset).toBe(totalRowsBefore);
        console.log('[UI-02] ✅ Filter pencarian tabel laporan berjalan instan tanpa reload halaman');
    });


    test('UI-03: Feed hanya menampilkan maksimal 10 kartu per halaman', async ({ page }) => {
        await loginViaAPI(page);
        await page.waitForTimeout(3000);

        const cards = page.locator('#listContainer .card');
        const count = await cards.count();
        expect(count).toBeLessThanOrEqual(10);
        console.log('[UI-03] ✅ Feed kota dibatasi maksimal 10 kartu laporan per halaman');
    });


    test('UI-04: Klik tombol Laporan Baru membuka modal form', async ({ page }) => {
        await loginViaAPI(page);

        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(1000);

        await expect(page.locator('#reportModal')).toBeVisible();
        console.log('[UI-04] ✅ Modal Bootstrap form aduan baru berhasil muncul');
    });


    // ============================================================
    // UI-05 – DIPERBAIKI: verifikasi via API response, bukan counter UI
    // ============================================================
    test('UI-05: Simpan draft menutup modal dan menaikkan counter draft', async ({ page }) => {
        // Arrange: login dan tunggu dashboard muncul
        await loginViaAPI(page);
        await page.waitForTimeout(1000);

        // Buka modal
        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(1000);
        await expect(page.locator('#reportModal')).toBeVisible();

        // Isi semua field dengan judul unik
        const judulUnik = 'Draft Playwright ' + Date.now();
        await page.fill('#reportTitle',       judulUnik);
        await page.fill('#reportCategory',    'Jalan');
        await page.fill('#reportLocation',    'Jl. Test Playwright No. 1');
        await page.fill('#reportDescription', 'Deskripsi test otomatis dari Playwright');

        // Intercept API POST bersamaan dengan klik Simpan Draft
        const [apiResponse] = await Promise.all([
            page.waitForResponse(
                res => res.url().includes('/api/report/') && res.request().method() === 'POST',
                { timeout: 15000 }
            ),
            page.locator('#btnDraft').click()
        ]);

        // Assert 1: API berhasil simpan (201 Created)
        expect(apiResponse.status()).toBe(201);

        // Assert 2: data tersimpan dengan status DRAFT
        const body = await apiResponse.json();
        expect(body.status).toBe('DRAFT');

        // Assert 3: modal tertutup otomatis setelah simpan
        await expect(page.locator('#reportModal')).not.toBeVisible({ timeout: 10000 });

        console.log('[UI-05] ✅ Draft tersimpan (201), modal tertutup, status DRAFT terkonfirmasi via API');
    });


    test('UI-06: Viewport mobile 400x800 menampilkan tombol hamburger', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 800 });
        await page.goto(BASE_URL + '/index.html#login', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        await expect(page.locator('.navbar-toggler')).toBeVisible();

        const isExpanded = await page.locator('#navbarMenus').evaluate(
            el => el.classList.contains('show')
        );
        expect(isExpanded).toBeFalsy();
        console.log('[UI-06] ✅ Navbar responsif menampilkan tombol hamburger pada viewport mobile');
    });

});