const routes = {
    "#home": `
    <section class="py-5">
        <div class="row justify-content-center align-items-center min-vh-75">
            <div class="col-12 col-lg-8 text-center">
                <div class="card border-0 shadow-sm rounded-4 p-5">

                    <div class="mb-4">
                        <i class="bi bi-buildings-fill text-primary"
                           style="font-size: 4rem;"></i>
                    </div>

                    <h1 class="fw-bold text-primary mb-3">
                        Selamat Datang di Smart City Portal
                    </h1>

                    <p class="text-muted fs-5 mb-4">
                        Sampaikan laporan fasilitas umum, pantau perkembangan laporan,
                        dan ikut berkontribusi dalam membangun lingkungan kota yang lebih tertata.
                    </p>

                    <div class="mt-4">
                        <a href="#login"
                           class="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-4">
                            <i class="bi bi-box-arrow-in-right me-2"></i>
                            LOGIN
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </section>
`,

    "#login": `
        <div class="row justify-content-center mt-5">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-sm border-0 p-4 rounded-4">
                    <h4 class="text-center fw-bold mb-2 text-primary">
                        <i class="bi bi-box-arrow-in-right me-2"></i>
                        Masuk Portal Warga
                    </h4>

                    <p class="text-center text-muted small mb-4">
                        Silakan masuk menggunakan akun citizen Anda.
                    </p>

                    <form id="loginForm">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" id="loginUsername"
                            class="form-control mb-3"
                            placeholder="Masukkan username" required>

                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" id="loginPassword"
                            class="form-control mb-4"
                            placeholder="Masukkan password" required>

                        <button type="submit"
                            class="btn btn-primary w-100 fw-bold">
                            Masuk
                        </button>

                        <div class="text-center mt-3">
                            <small class="text-muted">
                                Belum punya akun?
                                <a href="#register" class="text-primary fw-semibold text-decoration-none">
                                    Daftar di sini
                                </a>
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,

    "#register": `
        <div class="row justify-content-center mt-5">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card shadow-sm border-0 p-4 rounded-4">
                    <h4 class="text-center fw-bold mb-2 text-primary">
                        <i class="bi bi-person-plus-fill me-2"></i>
                        Daftar Akun Citizen
                    </h4>

                    <p class="text-center text-muted small mb-4">
                        Buat akun untuk mulai mengirim dan memantau laporan.
                    </p>

                    <form id="registerForm">
                        <label class="form-label fw-semibold">Username</label>
                        <input type="text" id="registerUsername"
                            class="form-control mb-3"
                            placeholder="Masukkan username" required>

                        <label class="form-label fw-semibold">Email</label>
                        <input type="email" id="registerEmail"
                            class="form-control mb-3"
                            placeholder="Masukkan email" required>

                        <label class="form-label fw-semibold">Password</label>
                        <input type="password" id="registerPassword"
                            class="form-control mb-4"
                            placeholder="Masukkan password" required>

                        <button type="submit"
                            class="btn btn-primary w-100 fw-bold">
                            Daftar
                        </button>

                        <div class="text-center mt-3">
                            <small class="text-muted">
                                Sudah punya akun?
                                <a href="#login" class="text-primary fw-semibold text-decoration-none">
                                    Masuk di sini
                                </a>
                            </small>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,

    "#dashboard": `
        <div class="row g-4">
            <aside class="col-12 col-lg-3">
                <div class="card border-0 shadow-sm p-4 rounded-4">
                    <button type="button"
                        class="btn btn-primary w-100 fw-bold rounded-4 py-4 fs-3"
                        data-bs-toggle="modal"
                        data-bs-target="#reportModal">
                        <i class="bi bi-plus-circle fs-1 d-block mb-2"></i>
                        Buat<br>
                        Laporan<br>
                        Baru
                    </button>

                    <h5 class="fw-bold text-secondary mt-4 mb-3">
                        <i class="bi bi-activity me-1"></i>
                        STATUS LAPORAN ANDA
                    </h5>

                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div class="fs-5">
                            <i class="bi bi-pencil-square text-secondary me-2"></i>
                            Draf
                        </div>
                        <span class="badge rounded-pill bg-secondary px-3 py-2" id="totalDraft">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div class="fs-5">
                            <i class="bi bi-send-fill text-warning me-2"></i>
                            Diajukan
                        </div>
                        <span class="badge rounded-pill bg-warning text-dark px-3 py-2" id="totalDiajukan">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div class="fs-5">
                            <i class="bi bi-send-check-fill text-primary me-2"></i>
                            Diverifikasi
                        </div>
                        <span class="badge rounded-pill bg-primary px-3 py-2" id="totalDiverifikasi">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                        <div class="fs-5">
                            <i class="bi bi-gear-fill text-info me-2"></i>
                            Diproses
                        </div>
                        <span class="badge rounded-pill bg-info text-dark px-3 py-2" id="totalDiproses">0</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center py-3">
                        <div class="fs-5">
                            <i class="bi bi-check-circle-fill text-success me-2"></i>
                            Selesai
                        </div>
                        <span class="badge rounded-pill bg-success px-3 py-2" id="totalSelesai">0</span>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm mb-3 rounded-4">
                    <div class="card-body">
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
                </div>

                <div class="row" id="listContainer"></div>
                <div id="paginationContainer"></div>
            </section>

            <aside class="col-12 col-lg-3">
                <div class="card border-0 p-3 shadow-sm rounded-4">
                    <h6 class="fw-bold">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                        Informasi Portal
                    </h6>
                    <p class="small text-muted mb-0">
                        Gunakan fitur laporan untuk membantu petugas memantau
                        dan menindaklanjuti permasalahan fasilitas umum.
                    </p>
                </div>
            </aside>
        </div>
    `
};

function isUserLoggedIn() {
    return !!localStorage.getItem("access_token");
}

function getStoredUsername() {
    return localStorage.getItem("username") || "Warga";
}

function renderNavbar() {
    const navMenus = document.getElementById("nav-menus");
    const brand = document.querySelector(".navbar-brand");

    if (brand) {
        brand.innerHTML = `
            <i class="bi bi-buildings-fill me-2"></i>
            SmartCity Portal
        `;
        brand.className = "navbar-brand fw-bold fs-3 text-white";
        brand.setAttribute("href", "#home");
    }

    if (!navMenus) {
        return;
    }

    if (isUserLoggedIn()) {
        const username = getStoredUsername();

        navMenus.innerHTML = `
            <div class="d-flex align-items-center gap-4">
                <span class="text-white fs-5 d-flex align-items-center">
                    <i class="bi bi-person-circle me-2"></i>
                    Halo, ${username}!
                </span>

                <button type="button"
                    id="logoutButton"
                    class="btn btn-outline-light fw-bold px-4 py-2">
                    <i class="bi bi-box-arrow-right me-1"></i>
                    Keluar
                </button>
            </div>
        `;

        const logoutButton = document.getElementById("logoutButton");

        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("username");

                window.location.hash = "#home";
            });
        }
    } else {
        navMenus.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <a href="#login" class="btn btn-outline-light fw-bold px-4">
                    Masuk
                </a>

                <a href="#register" class="btn btn-light text-primary fw-bold px-4">
                    Daftar
                </a>
            </div>
        `;
    }
}

function handleRouting() {
    const hash = window.location.hash || "#home";
    const content = document.getElementById("app-content");

    if (!content) {
        return;
    }

    if (isUserLoggedIn() && (hash === "#home" || hash === "#login" || hash === "#register")) {
        window.location.hash = "#dashboard";
        return;
    }

    if (!isUserLoggedIn() && hash === "#dashboard") {
        window.location.hash = "#login";
        return;
    }

    content.innerHTML = routes[hash] || routes["#home"];

    renderNavbar();

    if (hash === "#login" && typeof setupLoginForm === "function") {
        setupLoginForm();
    }

    if (hash === "#register" && typeof setupRegisterForm === "function") {
        setupRegisterForm();
    }

    if (hash === "#dashboard" && typeof loadDashboardData === "function") {
        loadDashboardData("my_reports", 1);
    }
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);