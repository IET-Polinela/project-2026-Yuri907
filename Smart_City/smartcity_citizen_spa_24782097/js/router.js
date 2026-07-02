const routes = {
    "#login": `
        <div class="row justify-content-center mt-5">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-sm border-0 p-4">
                    <h4 class="text-center fw-bold mb-4">
                        <i class="bi bi-box-arrow-in-right me-2"></i>Citizen Login
                    </h4>

                    <form id="loginForm">
                        <input type="text" id="loginUsername"
                            class="form-control mb-3"
                            placeholder="Username" required>

                        <input type="password" id="loginPassword"
                            class="form-control mb-3"
                            placeholder="Password" required>

                        <button type="submit"
                            class="btn btn-primary w-100 fw-bold">
                            Masuk
                        </button>

                        <p class="text-center mt-3 mb-0 small">
                            Belum punya akun?
                            <a href="#register">Daftar di sini</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `,

    "#register": `
        <div class="row justify-content-center mt-5">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-sm border-0 p-4">
                    <h4 class="text-center fw-bold mb-4">
                        <i class="bi bi-person-plus-fill me-2"></i>Daftar Akun
                    </h4>

                    <form id="registerForm">
                        <input type="text" id="registerUsername"
                            class="form-control mb-3"
                            placeholder="Username" required>

                        <input type="email" id="registerEmail"
                            class="form-control mb-3"
                            placeholder="Email" required>

                        <input type="password" id="registerPassword"
                            class="form-control mb-3"
                            placeholder="Password" required>

                        <button type="submit"
                            class="btn btn-primary w-100 fw-bold">
                            Daftar
                        </button>

                        <p class="text-center mt-3 mb-0 small">
                            Sudah punya akun?
                            <a href="#login">Masuk di sini</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `,

    "#dashboard": `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 shadow-sm p-3">
                    <button id="btnLaporanBaru"
                            class="btn btn-primary btn-lg w-100 fw-bold"
                            onclick="openReportModal()">
                        <i class="bi bi-plus-circle-fill me-2"></i>
                        Laporan Baru
                    </button>
                </div>

                <!-- Badge statistik -->
                <div class="card border-0 shadow-sm p-3 mt-3">
                    <h6 class="fw-bold mb-3">Statistik Saya</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="small text-muted">Draft</span>
                        <span class="badge bg-secondary" id="totalDraft">0</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="small text-muted">Diajukan</span>
                        <span class="badge bg-info text-dark" id="totalDiajukan">0</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="small text-muted">Diverifikasi</span>
                        <span class="badge bg-warning text-dark" id="totalDiverifikasi">0</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="small text-muted">Diproses</span>
                        <span class="badge bg-primary" id="totalDiproses">0</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span class="small text-muted">Selesai</span>
                        <span class="badge bg-success" id="totalSelesai">0</span>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm p-3 mb-3">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h5 class="fw-bold mb-1">
                                <i class="bi bi-file-earmark-text-fill text-primary me-2"></i>
                                Ruang Laporan Warga
                            </h5>
                            <small class="text-muted">
                                Lihat laporan pribadi dan pantau kondisi lingkungan sekitar.
                            </small>
                        </div>

                        <div class="btn-group">
                            <button type="button"
                                class="btn btn-primary px-4"
                                onclick="loadDashboardData('my_reports', 1)">
                                <i class="bi bi-person-lines-fill me-2"></i>
                                Laporan Saya
                            </button>

                            <button type="button"
                                class="btn btn-outline-primary px-4"
                                onclick="loadDashboardData('feed', 1)">
                                <i class="bi bi-globe-asia-australia me-2"></i>
                                Feed Kota
                            </button>
                        </div>
                    </div>
                </div>

                <div id="listContainer" class="row">
                    <div class="col-12 text-center text-muted p-5">
                        <i class="bi bi-inbox fs-1"></i>
                        <p>Memuat data laporan...</p>
                    </div>
                </div>
                <div id="paginationContainer"></div>
            </section>

            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm">
                    <h6 class="fw-bold">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                        Pengumuman
                    </h6>
                    <p class="small text-muted mb-0">
                        Gunakan portal ini untuk mengirim laporan warga.
                    </p>
                </div>
            </aside>
        </div>
    `
};

// Menampilkan sapaan "Halo, {username}!" + tombol Keluar di navbar
// saat login, atau mengosongkan area itu saat berada di halaman login.
function renderNavbar() {
    const navMenus = document.getElementById("nav-menus");
    if (!navMenus) return;

    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        const username = localStorage.getItem("username") || "Warga";

        navMenus.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <span class="text-white d-flex align-items-center">
                    <i class="bi bi-person-circle me-2"></i>
                    Halo, ${username}!
                </span>

                <button type="button"
                    id="logoutButton"
                    class="btn btn-outline-light fw-bold px-4">
                    <i class="bi bi-box-arrow-right me-1"></i>
                    Keluar
                </button>
            </div>
        `;

        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton && typeof logoutUser === "function") {
            logoutButton.addEventListener("click", logoutUser);
        }
    } else {
        navMenus.innerHTML = "";
    }
}

function handleRouting() {
    // Ambil hash saat ini, default ke "#login" kalau kosong
    let hash = window.location.hash || "#login";

    // PATCH: normalisasi hash yang tidak dikenal (mis. "#home") supaya
    // konsisten dipakai baik untuk render HTML maupun untuk setup event listener.
    // Sebelumnya, hash yang tidak ada di `routes` hanya di-fallback saat
    // mengambil HTML-nya (routes[hash] || routes["#login"]), tapi variabel
    // `hash` itu sendiri tidak berubah. Akibatnya kondisi `hash === "#login"`
    // di bawah gagal, dan setupLoginForm() tidak pernah dipanggil meskipun
    // form login yang tampil di layar.
    if (!routes[hash]) {
        hash = "#login";
    }

    const content = document.getElementById("app-content");

    // Proteksi: cek token sebelum masuk #dashboard
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (hash === "#dashboard" && (!accessToken || !refreshToken)) {
        window.location.hash = "#login";
        return;
    }

    content.innerHTML = routes[hash];

    renderNavbar();

    if (hash === "#login" && typeof setupLoginForm === "function") {
        setupLoginForm();
    }

    if (hash === "#register" && typeof setupRegisterForm === "function") {
        setupRegisterForm();
    }

    if (hash === "#dashboard" && typeof loadDashboardData === "function") {
        loadDashboardData();
        // setupReportFormActions sudah dipanggil di DOMContentLoaded (app.js)
        // tidak perlu dipanggil lagi di sini agar tidak bentrok
    }
}

// openReportModal dipanggil dari onclick tombol "Laporan Baru"
function openReportModal() {
    const reportModalElement = document.getElementById("reportModal");
    if (!reportModalElement) return;

    const reportForm = document.getElementById("reportForm");
    const reportModalLabel = document.getElementById("reportModalLabel");

    if (reportForm) reportForm.reset();

    if (reportModalLabel) {
        reportModalLabel.innerHTML = `
            <i class="bi bi-pencil-square me-2"></i>
            Tambah Laporan Baru
        `;
    }

    const modal = new bootstrap.Modal(reportModalElement);
    modal.show();
}


window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);