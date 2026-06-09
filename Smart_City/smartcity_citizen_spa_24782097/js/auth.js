function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const payload = {
            username: username,
            password: password
        };

        try {
            const result = await requestAPI("/api/token/", "POST", payload);

            if (result.status === 200) {
                localStorage.setItem("access_token", result.data.access);
                localStorage.setItem("refresh_token", result.data.refresh);
                localStorage.setItem("username", username);

                alert("Login berhasil!");

                window.location.hash = "#dashboard";
            } else {
                alert("Login gagal. Periksa username dan password.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        }
    });
}


function setupRegisterForm() {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        const payload = {
            username: username,
            email: email,
            password: password
        };

        try {
            const result = await requestAPI("/api/register/", "POST", payload);

            if (result.status === 201 || result.status === 200) {
                alert("Registrasi berhasil! Silakan login.");

                window.location.hash = "#login";
            } else {
                alert("Registrasi gagal. Periksa kembali data Anda.");
            }
        } catch (error) {
            console.error("Register error:", error);
            alert("Terjadi kesalahan koneksi ke server.");
        }
    });
}


function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    window.location.hash = "#home";
}