# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: citizen_portal.spec.js >> Modul 5: Interaktivitas UI (UI-01 through UI-06) >> UI-05: Simpan draft menutup modal dan menaikkan counter draft
- Location: tests\citizen_portal.spec.js:295:5

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - link " Smart City Portal" [ref=e4] [cursor=pointer]:
      - /url: "#login"
      - generic [ref=e5]: 
      - text: Smart City Portal
  - main [ref=e6]:
    - generic [ref=e7]:
      - complementary [ref=e8]:
        - button " Laporan Baru" [ref=e10] [cursor=pointer]:
          - generic [ref=e11]: 
          - text: Laporan Baru
        - generic [ref=e12]:
          - heading "Statistik Saya" [level=6] [ref=e13]
          - generic [ref=e14]:
            - generic [ref=e15]: Draft
            - generic [ref=e16]: "0"
          - generic [ref=e17]:
            - generic [ref=e18]: Diajukan
            - generic [ref=e19]: "0"
          - generic [ref=e20]:
            - generic [ref=e21]: Diverifikasi
            - generic [ref=e22]: "0"
          - generic [ref=e23]:
            - generic [ref=e24]: Diproses
            - generic [ref=e25]: "0"
          - generic [ref=e26]:
            - generic [ref=e27]: Selesai
            - generic [ref=e28]: "0"
      - generic [ref=e33]:
        - generic [ref=e34]:
          - heading "Banjir" [level=5] [ref=e35]
          - generic [ref=e36]: RESOLVED
        - paragraph [ref=e37]:
          - generic [ref=e38]: 
          - text: Banjirrr
        - paragraph [ref=e39]:
          - generic [ref=e40]: 
          - text: gg senen
        - paragraph [ref=e41]: Banjir mengganggu aktivitas mahasiswa saat pergi ke kampus
        - paragraph [ref=e42]: "Pelapor: Warga Anonim"
        - progressbar [ref=e44]
        - text: "Update: 17 Jun 2026, 13.11"
      - complementary [ref=e45]:
        - generic [ref=e46]:
          - heading " Pengumuman" [level=6] [ref=e47]:
            - generic [ref=e48]: 
            - text: Pengumuman
          - paragraph [ref=e49]: Gunakan portal ini untuk mengirim laporan warga.
  - text:  
```

# Test source

```ts
  229 |         const firstRowText = await tableRows.first().textContent();
  230 |         const keyword = (firstRowText || '').trim().split(/\s+/)[0] || 'a';
  231 | 
  232 |         // Act: ketik kata kunci di search box
  233 |         await page.fill('#searchInput', keyword);
  234 |         await page.waitForTimeout(800); // debounce search
  235 | 
  236 |         // Assert: jumlah baris yang TERLIHAT berkurang/sesuai filter,
  237 |         // tanpa reload halaman (event delegation, bukan page.goto baru)
  238 |         const visibleRowsAfter = page.locator('#reportTable tbody tr:visible');
  239 |         const visibleCountAfter = await visibleRowsAfter.count();
  240 | 
  241 |         expect(visibleCountAfter).toBeLessThanOrEqual(totalRowsBefore);
  242 |         expect(visibleCountAfter).toBeGreaterThan(0);
  243 | 
  244 |         // Act: kosongkan search lagi via tombol clear
  245 |         await page.locator('#clearSearch').click();
  246 |         await page.waitForTimeout(500);
  247 | 
  248 |         // Assert: semua baris kembali terlihat seperti semula
  249 |         const visibleRowsReset = page.locator('#reportTable tbody tr:visible');
  250 |         const visibleCountReset = await visibleRowsReset.count();
  251 | 
  252 |         expect(visibleCountReset).toBe(totalRowsBefore);
  253 | 
  254 |         console.log('[UI-02] ✅ Filter pencarian tabel laporan berjalan instan tanpa reload halaman');
  255 |     });
  256 | 
  257 | 
  258 |     // ============================================================
  259 |     // UI-03 – Feed laporan → hanya tampil maks 10 per halaman
  260 |     // ============================================================
  261 |     test('UI-03: Feed hanya menampilkan maksimal 10 kartu per halaman', async ({ page }) => {
  262 |         await loginViaAPI(page);
  263 |         await page.waitForTimeout(3000);
  264 | 
  265 |         const cards = page.locator('#listContainer .card');
  266 |         const count = await cards.count();
  267 | 
  268 |         expect(count).toBeLessThanOrEqual(10);
  269 | 
  270 |         console.log('[UI-03] ✅ Feed kota dibatasi maksimal 10 kartu laporan per halaman');
  271 |     });
  272 | 
  273 | 
  274 |     // ============================================================
  275 |     // UI-04 – Klik tombol Laporan Baru → Modal Bootstrap muncul
  276 |     // ============================================================
  277 |     test('UI-04: Klik tombol Laporan Baru membuka modal form', async ({ page }) => {
  278 |         // Arrange: login dan tunggu dashboard muncul
  279 |         await loginViaAPI(page);
  280 | 
  281 |         // Act: klik tombol Laporan Baru
  282 |         await page.locator('#btnLaporanBaru').click();
  283 |         await page.waitForTimeout(1000);
  284 | 
  285 |         // Assert: modal harus terlihat
  286 |         await expect(page.locator('#reportModal')).toBeVisible();
  287 | 
  288 |         console.log('[UI-04] ✅ Modal Bootstrap form aduan baru berhasil muncul');
  289 |     });
  290 | 
  291 | 
  292 |     // ============================================================
  293 |     // UI-05 – Isi form → Simpan Draft → modal tutup, counter naik
  294 |     // ============================================================
  295 |     test('UI-05: Simpan draft menutup modal dan menaikkan counter draft', async ({ page }) => {
  296 |         // Arrange: login dan tunggu dashboard muncul
  297 |         await loginViaAPI(page);
  298 |         await page.waitForTimeout(2000);
  299 | 
  300 |         // Tunggu loadSummaryStats selesai (counter muncul dulu sebelum dicatat)
  301 |         await page.waitForFunction(() => {
  302 |             const el = document.getElementById('totalDraft');
  303 |             return el !== null;
  304 |         }, { timeout: 10000 });
  305 |         await page.waitForTimeout(3000); // beri waktu fetch ke server deploy selesai
  306 | 
  307 |         // Catat counter draft sebelum
  308 |         const beforeText = await page.locator('#totalDraft').textContent().catch(() => '0');
  309 |         const countBefore = parseInt(beforeText?.trim() || '0');
  310 | 
  311 |         // Buka modal
  312 |         await page.locator('#btnLaporanBaru').click();
  313 |         await page.waitForTimeout(1000);
  314 |         await expect(page.locator('#reportModal')).toBeVisible();
  315 | 
  316 |         // Isi semua field
  317 |         await page.fill('#reportTitle',       'Laporan Test Playwright UI-05');
  318 |         await page.fill('#reportCategory',    'Jalan');
  319 |         await page.fill('#reportLocation',    'Jl. Test Playwright No. 1');
  320 |         await page.fill('#reportDescription', 'Deskripsi test otomatis dari Playwright');
  321 | 
  322 |         // Klik Simpan Draft
  323 |         await page.locator('#btnDraft').click();
  324 | 
  325 |         // Tunggu modal tertutup dulu
  326 |         await expect(page.locator('#reportModal')).not.toBeVisible({ timeout: 10000 });
  327 | 
  328 |         // Tunggu counter berubah (bukan sekadar timeout tetap)
> 329 |         await page.waitForFunction(
      |                    ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  330 |             (before) => {
  331 |                 const el = document.getElementById('totalDraft');
  332 |                 if (!el) return false;
  333 |                 return parseInt(el.textContent || '0') > before;
  334 |             },
  335 |             countBefore,
  336 |             { timeout: 15000 }
  337 |         );
  338 | 
  339 |         // Assert: counter draft bertambah
  340 |         const afterText = await page.locator('#totalDraft').textContent().catch(() => '0');
  341 |         const countAfter = parseInt(afterText?.trim() || '0');
  342 |         expect(countAfter).toBeGreaterThan(countBefore);
  343 | 
  344 |         console.log('[UI-05] ✅ Draft tersimpan, modal tertutup, dan counter Draft bertambah');
  345 |     });
  346 | 
  347 | 
  348 |     // ============================================================
  349 |     // UI-06 – Viewport 400x800 → tombol hamburger navbar muncul
  350 |     // ============================================================
  351 |     test('UI-06: Viewport mobile 400x800 menampilkan tombol hamburger', async ({ page }) => {
  352 |         // Arrange: set ukuran layar smartphone
  353 |         await page.setViewportSize({ width: 400, height: 800 });
  354 |         await page.goto(BASE_URL + '/index.html#login', { waitUntil: 'domcontentloaded' });
  355 |         await page.waitForTimeout(1500);
  356 | 
  357 |         // Assert: tombol hamburger harus tampil
  358 |         await expect(page.locator('.navbar-toggler')).toBeVisible();
  359 | 
  360 |         // Assert: menu belum terbuka
  361 |         const isExpanded = await page.locator('#navbarMenus').evaluate(
  362 |             el => el.classList.contains('show')
  363 |         );
  364 |         expect(isExpanded).toBeFalsy();
  365 | 
  366 |         console.log('[UI-06] ✅ Navbar responsif menampilkan tombol hamburger pada viewport mobile');
  367 |     });
  368 | 
  369 | });
```