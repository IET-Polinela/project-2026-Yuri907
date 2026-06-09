let currentTab = "my_reports";
let currentPage = 1;
let allReports = [];
let totalPages = 1;
let editingReportId = null;

async function loadDashboardData(tab = currentTab, page = currentPage) {
    currentTab = tab;
    currentPage = page;

    const response = await requestAPI(
        `/api/report/?tab=${tab}&page=${page}`,
        "GET"
    );

    const listContainer = document.getElementById("listContainer");
    const paginationContainer = document.getElementById("paginationContainer");

    if (response && response.status === 200) {
        allReports = response.data.results || [];

        const totalData = response.data.count || 0;
        totalPages = Math.ceil(totalData / 10);

        renderList();
        renderPagination();
        loadSummaryStats();
    } else {
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="col-12 text-center text-muted p-5">
                    <i class="bi bi-exclamation-triangle fs-1"></i>
                    <p>Gagal memuat data laporan.</p>
                </div>
            `;
        }

        if (paginationContainer) {
            paginationContainer.innerHTML = "";
        }
    }
}

async function loadSummaryStats() {
    const response = await requestAPI(
        "/api/report/?tab=my_reports&page_size=1000",
        "GET"
    );

    if (response && response.status === 200) {
        const reports = response.data.results || [];

        const totalDraft = reports.filter(
            report => report.status === "DRAFT"
        ).length;

        const totalDiajukan = reports.filter(
            report => report.status === "REPORTED"
        ).length;

        const totalDiverifikasi = reports.filter(
            report => report.status === "VERIFIED"
        ).length;

        const totalDiproses = reports.filter(
            report => report.status === "IN_PROGRESS"
        ).length;

        const totalSelesai = reports.filter(
            report => report.status === "COMPLETED"
        ).length;

        const draftElement = document.getElementById("totalDraft");
        const diajukanElement = document.getElementById("totalDiajukan");
        const diverifikasiElement = document.getElementById("totalDiverifikasi");
        const diprosesElement = document.getElementById("totalDiproses");
        const selesaiElement = document.getElementById("totalSelesai");

        if (draftElement) draftElement.textContent = totalDraft;
        if (diajukanElement) diajukanElement.textContent = totalDiajukan;
        if (diverifikasiElement) diverifikasiElement.textContent = totalDiverifikasi;
        if (diprosesElement) diprosesElement.textContent = totalDiproses;
        if (selesaiElement) selesaiElement.textContent = totalSelesai;
    }
}

function renderList() {
    const listContainer = document.getElementById("listContainer");

    if (!listContainer) return;

    if (allReports.length === 0) {
        listContainer.innerHTML = `
            <div class="col-12 text-center text-muted p-5">
                <i class="bi bi-inbox fs-1"></i>
                <p>Belum ada data laporan.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = allReports.map(report => {
        const progress = getProgressValue(report.status);
        let editButton = "";

        if (report.status === "DRAFT" && report.is_owner) {
            editButton = `
                <button type="button"
                    class="btn btn-sm btn-outline-primary mt-3"
                    onclick="editDraft(${report.id})">
                    <i class="bi bi-pencil-square me-1"></i>
                    Edit Draft
                </button>
            `;
        }

        return `
            <div class="col-12 mb-3">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="fw-bold mb-0">${report.title}</h5>
                            <span class="badge bg-primary">${report.status}</span>
                        </div>

                        <p class="text-muted mb-1">
                            <i class="bi bi-tag me-1"></i>
                            ${report.category}
                        </p>

                        <p class="text-muted mb-1">
                            <i class="bi bi-geo-alt me-1"></i>
                            ${report.location}
                        </p>

                        <p class="small mb-2">${report.description}</p>

                        <p class="small text-muted mb-2">
                            Pelapor: ${report.reporter}
                        </p>

                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar"
                                 role="progressbar"
                                 style="width: ${progress}%;">
                            </div>
                        </div>

                        <small class="text-muted">
                            Update: ${formatDate(report.updated_at)}
                        </small>

                        <br>
                        ${editButton}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function renderPagination() {
    const paginationContainer = document.getElementById("paginationContainer");

    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    let buttons = "";

    buttons += `
        <button type="button"
            class="btn btn-sm btn-outline-primary mx-1 mb-2"
            ${currentPage === 1 ? "disabled" : ""}
            onclick="loadDashboardData('${currentTab}', ${currentPage - 1})">
            Sebelumnya
        </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        buttons += `
            <button type="button"
                class="btn btn-sm btn-outline-primary mx-1 mb-2"
                onclick="loadDashboardData('${currentTab}', 1)">
                1
            </button>
        `;

        if (startPage > 2) {
            buttons += `<span class="mx-1 text-muted">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        buttons += `
            <button type="button"
                class="btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"} mx-1 mb-2"
                onclick="loadDashboardData('${currentTab}', ${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            buttons += `<span class="mx-1 text-muted">...</span>`;
        }

        buttons += `
            <button type="button"
                class="btn btn-sm btn-outline-primary mx-1 mb-2"
                onclick="loadDashboardData('${currentTab}', ${totalPages})">
                ${totalPages}
            </button>
        `;
    }

    buttons += `
        <button type="button"
            class="btn btn-sm btn-outline-primary mx-1 mb-2"
            ${currentPage === totalPages ? "disabled" : ""}
            onclick="loadDashboardData('${currentTab}', ${currentPage + 1})">
            Berikutnya
        </button>
    `;

    paginationContainer.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 mt-3">
            <div class="card-body text-center">
                <small class="text-muted d-block mb-2">
                    Halaman ${currentPage} dari ${totalPages}
                </small>
                ${buttons}
            </div>
        </div>
    `;
}

async function editDraft(id) {
    const response = await requestAPI(`/api/report/${id}/`, "GET");

    if (response && response.status === 200) {
        const report = response.data;

        editingReportId = id;

        document.getElementById("reportTitle").value = report.title;
        document.getElementById("reportCategory").value = report.category;
        document.getElementById("reportLocation").value = report.location;
        document.getElementById("reportDescription").value = report.description;

        const modalTitle = document.getElementById("reportModalLabel");
        modalTitle.innerHTML = `
            <i class="bi bi-pencil-square me-2"></i>
            Edit Draft Laporan
        `;

        const reportModal = new bootstrap.Modal(
            document.getElementById("reportModal")
        );

        reportModal.show();
    } else {
        alert("Gagal mengambil data draft.");
    }
}

async function submitReport(statusValue) {
    const title = document.getElementById("reportTitle").value;
    const category = document.getElementById("reportCategory").value;
    const location = document.getElementById("reportLocation").value;
    const description = document.getElementById("reportDescription").value;

    const payload = {
        title: title,
        category: category,
        location: location,
        description: description,
        status: statusValue
    };

    let endpoint = "/api/report/";
    let method = "POST";

    if (editingReportId !== null) {
        endpoint = `/api/report/${editingReportId}/`;
        method = "PUT";
    }

    const response = await requestAPI(endpoint, method, payload);

    if (response && (response.status === 201 || response.status === 200)) {
        const reportForm = document.getElementById("reportForm");
        const reportModalElement = document.getElementById("reportModal");
        const modalInstance = bootstrap.Modal.getInstance(reportModalElement);

        if (modalInstance) {
            modalInstance.hide();
        }

        reportForm.reset();
        editingReportId = null;

        loadDashboardData(currentTab, currentPage);
    } else {
        alert("Gagal menyimpan laporan.");
    }
}

function setupReportFormActions() {
    const btnDraft = document.getElementById("btnDraft");
    const btnSubmit = document.getElementById("btnSubmit");
    const reportModalElement = document.getElementById("reportModal");

    if (btnDraft) {
        btnDraft.addEventListener("click", function () {
            submitReport("DRAFT");
        });
    }

    if (btnSubmit) {
        btnSubmit.addEventListener("click", function () {
            submitReport("REPORTED");
        });
    }

    if (reportModalElement) {
        reportModalElement.addEventListener("hidden.bs.modal", function () {
            const reportForm = document.getElementById("reportForm");
            const modalTitle = document.getElementById("reportModalLabel");

            if (reportForm) {
                reportForm.reset();
            }

            editingReportId = null;

            if (modalTitle) {
                modalTitle.innerHTML = `
                    <i class="bi bi-pencil-square me-2"></i>
                    Buat Laporan Baru
                `;
            }
        });
    }
}

function getProgressValue(status) {
    if (status === "DRAFT") return 25;
    if (status === "REPORTED") return 50;
    if (status === "VERIFIED") return 75;
    if (status === "IN_PROGRESS") return 85;
    if (status === "COMPLETED") return 100;

    return 10;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setupReportFormActions();
});