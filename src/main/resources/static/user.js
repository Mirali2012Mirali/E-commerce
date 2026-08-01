document.addEventListener("DOMContentLoaded", async () => {

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const isProfilePage = Boolean(document.getElementById("name"));

    if (!currentUser) {
        if (isProfilePage) {
            window.location.href = "./login/login.html";
        }
        return;
    }

    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }

    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.href = "./home/home.html";
        });
    }

    if (!isProfilePage) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:8080/api/users/${encodeURIComponent(currentUser.username)}`
        );

        if (!response.ok) {
            throw new Error("User not found");
        }

        const user = await response.json();

        document.getElementById("name").textContent = user.name;
        document.getElementById("surname").textContent = user.surname;
        document.getElementById("email").textContent = user.email;
        document.getElementById("username").textContent = user.username;

    } catch (e) {
        console.error(e);
        alert("Failed to load profile.");
    }
});
