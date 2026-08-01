document.addEventListener("DOMContentLoaded", async () => {

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        window.location.href = "../login/login.html";
        return;
    }

    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    usernameDisplay.textContent = currentUser.username;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    logoutBtn.onclick = () => {
        localStorage.removeItem("currentUser");
        window.location.href = "../home/home.html";
    };

    const cartList = document.querySelector(".list");
    const FALLBACK_IMAGE = "../images/img1.jpg";

    cartList.innerHTML = "";

    try {
        const cartResponse = await fetch(
            `http://localhost:8080/api/cart/user/${encodeURIComponent(currentUser.username)}`
        );

        if (!cartResponse.ok) {
            throw new Error("Cannot load cart.");
        }

        const cart = await cartResponse.json();
        let total = 0;

        if (cart.length === 0) {
            cartList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-muted py-4">Your cart is empty.</td>
                </tr>
            `;
        }

        cart.forEach(item => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const subtotal = price * quantity;
            const imageUrl = item.imageUrl || FALLBACK_IMAGE;
            const title = item.model || item.brand || "Product";

            total += subtotal;

            cartList.insertAdjacentHTML(
                "beforeend",
                `
        <tr>
            <td>
                <img width="70"
                     src="${imageUrl}"
                     alt="${title}"
                     onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
                <span class="ms-2">${title}</span>
            </td>
            <td>${price.toFixed(2)}$</td>
            <td>${quantity}</td>
            <td>${subtotal.toFixed(2)}$</td>
            <td>
                <button
                    class="btn btn-danger removeBtn"
                    data-id="${item.cartId}">
                    Remove
                </button>
            </td>
        </tr>
        `
            );
        });

        document.querySelector(".subtotalElement").textContent = `$${total.toFixed(2)}`;
        document.querySelector(".totalElement").textContent = `$${total.toFixed(2)}`;

        localStorage.setItem("checkoutSubtotal", `$${total.toFixed(2)}`);
        localStorage.setItem("checkoutTotal", `$${total.toFixed(2)}`);

        const checkoutBtn = document.querySelector(".checkoutBtn");
        if (checkoutBtn) {
            checkoutBtn.href = "../checkout/checkout.html";
            checkoutBtn.addEventListener("click", (e) => {
                if (cart.length === 0) {
                    e.preventDefault();
                    alert("Your cart is empty.");
                    return;
                }
                localStorage.setItem(
                    "checkoutSubtotal",
                    document.querySelector(".subtotalElement").textContent
                );
                localStorage.setItem(
                    "checkoutTotal",
                    document.querySelector(".totalElement").textContent
                );
            });
        }

    } catch (e) {
        console.error(e);
        alert("Cannot load cart.");
    }

    document.addEventListener("click", async (event) => {
        if (!event.target.classList.contains("removeBtn")) {
            return;
        }

        const cartId = event.target.dataset.id;

        try {
            const response = await fetch(
                `http://localhost:8080/api/cart/${cartId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Cannot delete product.");
            }

            location.reload();
        } catch (e) {
            console.error(e);
            alert("Cannot delete product.");
        }
    });
});
