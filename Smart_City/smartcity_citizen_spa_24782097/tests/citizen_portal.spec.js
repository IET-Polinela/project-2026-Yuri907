// @ts-check
const { test, expect } = require('@playwright/test');

// Citizen Portal SPA: frontend lokal (JWT via localStorage)
const BASE_URL = 'http://127.0.0.1:5500';

// Backend Django (dipakai bersama oleh Citizen Portal & Admin Portal)
const BACKEND  = 'http://103.151.63.88:8013';

// !! GANTI dengan username & password WARGA yang ADA di database server deploy !!
const USERNAME = 'yuri';
const PASSWORD = 'yurielva';

// !! GANTI dengan username & password ADMIN yang ADA di database server deploy !!
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';


// ============================================================
// HELPER: Login Citizen → simpan token → pindah dashboard TANPA reload
// ============================================================
async function loginViaAPI(page) {
    // Step 1: Buka halaman index dulu (tanpa hash apapun)
    await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });

    // Step 2: Minta token dari backend
    const response = await page.request.post(BACKEND + '/api/token/', {
        data: { username: USERNAME, password: PASSWORD },
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok()) {
        throw new Error('Login gagal! Cek USERNAME dan PASSWORD di file test.');
    }

    const tokens = await response.json();

    // Step 3: Simpan token ke localStorage DAN langsung ubah hash
    // tanpa page.goto agar localStorage tidak hilang
    await page.evaluate((t) => {
        localStorage.setItem('access_token', t.access);
        localStorage.setItem('refresh_token', t.refresh);
        // Pindah ke dashboard via hash change (tidak reload halaman)
        window.location.hash = '#dashboard';
    }, tokens);

    // Step 4: Tunggu tombol dashboard muncul
    await page.waitForSelector('#btnLaporanBaru', { timeout: 15000 });
}


// ============================================================
// HELPER: Login Admin via form HTML (session-based, bukan API)
// Portal Admin adalah Django monolith (session + CSRF), BUKAN JWT
// seperti Citizen Portal SPA. Maka login harus lewat submit form HTML asli.
// ============================================================
async function loginAsAdmin(page) {
    await page.goto(BACKEND + '/login/', { waitUntil: 'domcontentloaded' });

    // Form login Django default: field name="username" & name="password"
    await page.fill('input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.click('form button[type="submit"], form input[type="submit"]')
    ]);
}


// ============================================================
// Modul 5: Interaktivitas UI (UI-01 through UI-06)
// Mencakup Citizen Portal SPA (AUTH04-06, UI-03-06) dan
// Portal Admin (UI-01, UI-02)
// ============================================================
test.describe('Modul 5: Interaktivitas UI (UI-01 through UI-06)', () => {

    // ============================================================
    // AUTH04 – Akses #dashboard tanpa token → redirect ke #login
    // ============================================================
    test('AUTH04: Akses dashboard tanpa token redirect ke login', async ({ page }) => {
        // Arrange: buka halaman, hapus semua token
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        });

        // Act: pindah hash ke #dashboard tanpa reload
        await page.evaluate(() => { window.location.hash = '#dashboard'; });
        await page.waitForTimeout(1500);

        // Assert: router harus redirect balik ke #login
        expect(page.url()).toContain('#login');

        console.log('[AUTH04] ✅ Akses tanpa token berhasil di-redirect ke halaman login');
    });


    // ============================================================
    // AUTH06 – Token kadaluarsa → halaman tetap stabil tidak crash
    // ============================================================
    test('AUTH06: Token kadaluarsa halaman tetap stabil tidak crash', async ({ page }) => {
        // Arrange: set token palsu
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
            localStorage.setItem('access_token', 'header.payload.signature_palsu');
            localStorage.setItem('refresh_token', 'refresh_palsu');
            window.location.hash = '#dashboard';
        });
        await page.waitForTimeout(2500);

        // Assert: halaman tidak crash, URL masih valid
        const url = page.url();
        const isStable = url.includes('#dashboard') || url.includes('#login');
        expect(isStable).toBeTruthy();
        await expect(page.locator('body')).toBeAttached();

        console.log('[AUTH06] ✅ Halaman tetap stabil walau token kadaluarsa/rusak');
    });


    // ============================================================
    // AUTH05 – access_token expired, refresh_token aktif →
    //          silent refresh berjalan, aduan tetap terkirim
    // ============================================================
    test('AUTH05: Silent refresh saat access token expired', async ({ page }) => {
        // Arrange: login dulu via API untuk dapat refresh_token yang BENAR-BENAR valid
        await page.goto(BASE_URL + '/index.html', { waitUntil: 'domcontentloaded' });

        const response = await page.request.post(BACKEND + '/api/token/', {
            data: { username: USERNAME, password: PASSWORD },
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok()) {
            throw new Error('Login gagal! Cek USERNAME dan PASSWORD di file test.');
        }

        const tokens = await response.json();

        // Rusak access_token secara sengaja (signature diubah) agar backend
        // pasti menolaknya dengan 401, TAPI refresh_token tetap asli & valid
        const brokenAccessToken = tokens.access.slice(0, -5) + 'XXXXX';

        await page.evaluate(({ broken, refresh }) => {
            localStorage.setItem('access_token', broken);
            localStorage.setItem('refresh_token', refresh);
            window.location.hash = '#dashboard';
        }, { broken: brokenAccessToken, refresh: tokens.refresh });

        await page.waitForSelector('#btnLaporanBaru', { timeout: 15000 });

        // Pantau network: pastikan request token/refresh benar-benar terjadi
        const refreshPromise = page.waitForResponse(
            res => res.url().includes('/api/token/refresh/'),
            { timeout: 15000 }
        );

        // Act: buka modal, isi form, lalu submit (akan kena 401 dulu di balik layar)
        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(500);
        await expect(page.locator('#reportModal')).toBeVisible();

        await page.fill('#reportTitle',       'Laporan Test AUTH05');
        await page.fill('#reportCategory',    'Jalan');
        await page.fill('#reportLocation',    'Jl. Silent Refresh No. 5');
        await page.fill('#reportDescription', 'Menguji silent refresh token saat access token expired');

        await page.locator('#btnDraft').click();

        // Assert 1: request refresh token benar-benar terpanggil di background
        const refreshResponse = await refreshPromise;
        expect(refreshResponse.status()).toBe(200);

        // Assert 2: aduan tetap berhasil terkirim tanpa interupsi (modal tertutup)
        await expect(page.locator('#reportModal')).not.toBeVisible({ timeout: 10000 });

        console.log('[AUTH05] ✅ Silent refresh berjalan di background, aduan tetap terkirim tanpa interupsi');
    });


    // ============================================================
    // UI-01 – Dashboard admin → Chart.js render Doughnut & Bar
    // ============================================================
    test('UI-01: Chart.js di Dashboard Admin ter-render dengan benar', async ({ page }) => {
        // Arrange: login sebagai admin
        await loginAsAdmin(page);

        // Act: buka halaman dashboard
        await page.goto(BACKEND + '/dashboard/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000); // beri waktu Chart.js & fetch data selesai

        // Assert: kedua canvas chart harus ada dan terlihat
        const statusChart = page.locator('#statusChart');
        const categoryChart = page.locator('#categoryChart');

        await expect(statusChart).toBeVisible();
        await expect(categoryChart).toBeVisible();

        // Assert: Chart.js benar-benar menggambar sesuatu di canvas
        // (canvas yang masih kosong/blank akan punya dimensi 0 atau belum diinisialisasi)
        const statusChartHasContent = await statusChart.evaluate((canvas) => {
            return canvas.width > 0 && canvas.height > 0;
        });

        expect(statusChartHasContent).toBeTruthy();

        console.log('[UI-01] ✅ Chart.js statusChart dan categoryChart berhasil ter-render');
    });


    // ============================================================
    // UI-02 – Tabel laporan admin → search filter instan
    // ============================================================
    test('UI-02: Pencarian menyaring tabel laporan secara instan', async ({ page }) => {
        // Arrange: login sebagai admin, buka halaman daftar laporan
        await loginAsAdmin(page);
        await page.goto(BACKEND + '/reports/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        const tableRows = page.locator('#reportTable tbody tr');
        const totalRowsBefore = await tableRows.count();

        // Pastikan ada cukup data untuk diuji filternya
        expect(totalRowsBefore).toBeGreaterThan(0);

        // Ambil judul laporan pertama sebagai kata kunci pencarian valid
        const firstRowText = await tableRows.first().textContent();
        const keyword = (firstRowText || '').trim().split(/\s+/)[0] || 'a';

        // Act: ketik kata kunci di search box
        await page.fill('#searchInput', keyword);
        await page.waitForTimeout(800); // debounce search

        // Assert: jumlah baris yang TERLIHAT berkurang/sesuai filter,
        // tanpa reload halaman (event delegation, bukan page.goto baru)
        const visibleRowsAfter = page.locator('#reportTable tbody tr:visible');
        const visibleCountAfter = await visibleRowsAfter.count();

        expect(visibleCountAfter).toBeLessThanOrEqual(totalRowsBefore);
        expect(visibleCountAfter).toBeGreaterThan(0);

        // Act: kosongkan search lagi via tombol clear
        await page.locator('#clearSearch').click();
        await page.waitForTimeout(500);

        // Assert: semua baris kembali terlihat seperti semula
        const visibleRowsReset = page.locator('#reportTable tbody tr:visible');
        const visibleCountReset = await visibleRowsReset.count();

        expect(visibleCountReset).toBe(totalRowsBefore);

        console.log('[UI-02] ✅ Filter pencarian tabel laporan berjalan instan tanpa reload halaman');
    });


    // ============================================================
    // UI-03 – Feed laporan → hanya tampil maks 10 per halaman
    // ============================================================
    test('UI-03: Feed hanya menampilkan maksimal 10 kartu per halaman', async ({ page }) => {
        await loginViaAPI(page);
        await page.waitForTimeout(3000);

        const cards = page.locator('#listContainer .card');
        const count = await cards.count();

        expect(count).toBeLessThanOrEqual(10);

        console.log('[UI-03] ✅ Feed kota dibatasi maksimal 10 kartu laporan per halaman');
    });


    // ============================================================
    // UI-04 – Klik tombol Laporan Baru → Modal Bootstrap muncul
    // ============================================================
    test('UI-04: Klik tombol Laporan Baru membuka modal form', async ({ page }) => {
        // Arrange: login dan tunggu dashboard muncul
        await loginViaAPI(page);

        // Act: klik tombol Laporan Baru
        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(1000);

        // Assert: modal harus terlihat
        await expect(page.locator('#reportModal')).toBeVisible();

        console.log('[UI-04] ✅ Modal Bootstrap form aduan baru berhasil muncul');
    });


    // ============================================================
    // UI-05 – Isi form → Simpan Draft → modal tutup, counter naik
    // ============================================================
    test('UI-05: Simpan draft menutup modal dan menaikkan counter draft', async ({ page }) => {
        // Arrange: login dan tunggu dashboard muncul
        await loginViaAPI(page);
        await page.waitForTimeout(2000);

        // Tunggu loadSummaryStats selesai (counter muncul dulu sebelum dicatat)
        await page.waitForFunction(() => {
            const el = document.getElementById('totalDraft');
            return el !== null;
        }, { timeout: 10000 });
        await page.waitForTimeout(3000); // beri waktu fetch ke server deploy selesai

        // Catat counter draft sebelum
        const beforeText = await page.locator('#totalDraft').textContent().catch(() => '0');
        const countBefore = parseInt(beforeText?.trim() || '0');

        // Buka modal
        await page.locator('#btnLaporanBaru').click();
        await page.waitForTimeout(1000);
        await expect(page.locator('#reportModal')).toBeVisible();

        // Isi semua field
        await page.fill('#reportTitle',       'Laporan Test Playwright UI-05');
        await page.fill('#reportCategory',    'Jalan');
        await page.fill('#reportLocation',    'Jl. Test Playwright No. 1');
        await page.fill('#reportDescription', 'Deskripsi test otomatis dari Playwright');

        // Klik Simpan Draft
        await page.locator('#btnDraft').click();

        // Tunggu modal tertutup dulu
        await expect(page.locator('#reportModal')).not.toBeVisible({ timeout: 10000 });

        // Tunggu counter berubah (bukan sekadar timeout tetap)
        await page.waitForFunction(
            (before) => {
                const el = document.getElementById('totalDraft');
                if (!el) return false;
                return parseInt(el.textContent || '0') > before;
            },
            countBefore,
            { timeout: 15000 }
        );

        // Assert: counter draft bertambah
        const afterText = await page.locator('#totalDraft').textContent().catch(() => '0');
        const countAfter = parseInt(afterText?.trim() || '0');
        expect(countAfter).toBeGreaterThan(countBefore);

        console.log('[UI-05] ✅ Draft tersimpan, modal tertutup, dan counter Draft bertambah');
    });


    // ============================================================
    // UI-06 – Viewport 400x800 → tombol hamburger navbar muncul
    // ============================================================
    test('UI-06: Viewport mobile 400x800 menampilkan tombol hamburger', async ({ page }) => {
        // Arrange: set ukuran layar smartphone
        await page.setViewportSize({ width: 400, height: 800 });
        await page.goto(BASE_URL + '/index.html#login', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Assert: tombol hamburger harus tampil
        await expect(page.locator('.navbar-toggler')).toBeVisible();

        // Assert: menu belum terbuka
        const isExpanded = await page.locator('#navbarMenus').evaluate(
            el => el.classList.contains('show')
        );
        expect(isExpanded).toBeFalsy();

        console.log('[UI-06] ✅ Navbar responsif menampilkan tombol hamburger pada viewport mobile');
    });

});