document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = "./login/login.html";
        return;
    }

    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
        logoutBtn.onclick = () => {
            localStorage.removeItem("currentUser");
            window.location.href = "./home/home.html";
        };
    }

    const ordersContainer = document.getElementById("orders-container");
    const noOrdersMessage = document.getElementById("no-orders-message");

    try {
        let response = await fetch(
            `http://localhost:8080/api/orders/user/${encodeURIComponent(currentUser.username)}`
        );

        let orders;
        if (response.ok) {
            orders = await response.json();
        } else {
            response = await fetch("http://localhost:8080/api/orders");
            if (!response.ok) {
                throw new Error("Cannot load orders");
            }
            const allOrders = await response.json();
            orders = allOrders.filter(o => o.username === currentUser.username);
        }

        if (!orders.length) {
            noOrdersMessage.style.display = "block";
            return;
        }

        noOrdersMessage.style.display = "none";
        ordersContainer.innerHTML = "";

        orders.forEach(order => {
            ordersContainer.insertAdjacentHTML(
                "beforeend",
                `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title mb-1">Order #${order.id}</h5>
                                <p class="mb-1"><strong>Address:</strong> ${order.address || "-"}</p>
                                <p class="mb-0 text-muted">User: ${order.username}</p>
                            </div>
                            <div class="text-end">
                                <div class="fs-5 fw-bold text-danger">
                                    $${Number(order.totalPrice || 0).toFixed(2)}
                                </div>
                                <span class="badge bg-success">Placed</span>
                            </div>
                        </div>
                    </div>
                </div>
                `
            );
        });
    } catch (e) {
        console.error(e);
        alert("Cannot load orders.");
    }
});
