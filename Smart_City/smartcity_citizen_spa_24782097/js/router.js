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


function handleRouting() {
    const hash = window.location.hash || "#login";
    const content = document.getElementById("app-content");

    // Proteksi: cek token sebelum masuk #dashboard
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (hash === "#dashboard" && (!accessToken || !refreshToken)) {
        window.location.hash = "#login";
        return;
    }

    content.innerHTML = routes[hash] || routes["#login"];

    if (hash === "#login" && typeof setupLoginForm === "function") {
        setupLoginForm();
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