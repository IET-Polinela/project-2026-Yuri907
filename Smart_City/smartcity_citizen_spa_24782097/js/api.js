const API_BASE_URL = "http://103.151.63.88:8013";

// Mencegah beberapa request refresh berjalan bersamaan (race condition)
let refreshingPromise = null;

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        return null;
    }

    // Jika sudah ada proses refresh berjalan, tunggu hasil yang sama
    if (refreshingPromise) {
        return refreshingPromise;
    }

    refreshingPromise = fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken })
    })
        .then(async (res) => {
            if (!res.ok) {
                return null;
            }
            const data = await res.json();
            if (data.access) {
                localStorage.setItem("access_token", data.access);
                return data.access;
            }
            return null;
        })
        .catch(() => null)
        .finally(() => {
            refreshingPromise = null;
        });

    return refreshingPromise;
}

async function requestAPI(endpoint, method = "GET", bodyData = null, _isRetry = false) {
    const accessToken = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (bodyData !== null) {
        options.body = JSON.stringify(bodyData);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Silent refresh: access token kadaluarsa tapi belum pernah di-retry
    if (response.status === 401 && !_isRetry) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
            // Ulangi request asli sekali dengan token baru
            return requestAPI(endpoint, method, bodyData, true);
        }
    }

    const data = await response.json();

    return {
        status: response.status,
        ok: response.ok,
        data: data
    };
}