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

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "../home/home.html";
    });


    document.getElementById("name").value = currentUser.name || "";
    document.getElementById("surname").value = currentUser.surname || "";
    document.getElementById("email").value = currentUser.email || "";

    const subtotalElement = document.querySelector(".subtotal");
    const totalElement = document.querySelector(".total");
    const form = document.querySelector(".form");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    let cartItems = [];
    let totalPrice = 0;


    try {
        const response = await fetch(
            `http://localhost:8080/api/cart/user/${encodeURIComponent(currentUser.username)}`
        );

        if (!response.ok) {
            throw new Error("Cannot load cart");
        }

        cartItems = await response.json();

        if (!cartItems.length) {
            subtotalElement.textContent = "$0.00";
            totalElement.textContent = "$0.00";
            placeOrderBtn.disabled = true;
            alert("Your cart is empty.");
            window.location.href = "../cart/cart.html";
            return;
        }

        totalPrice = cartItems.reduce((sum, item) => {
            return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
        }, 0);

        const formatted = `$${totalPrice.toFixed(2)}`;
        subtotalElement.textContent = formatted;
        totalElement.textContent = formatted;

        localStorage.setItem("checkoutSubtotal", formatted);
        localStorage.setItem("checkoutTotal", formatted);
    } catch (e) {
        console.error(e);

        subtotalElement.textContent = localStorage.getItem("checkoutSubtotal") || "$0.00";
        totalElement.textContent = localStorage.getItem("checkoutTotal") || "$0.00";
        const parsed = parseFloat(String(totalElement.textContent).replace("$", ""));
        totalPrice = isNaN(parsed) ? 0 : parsed;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        if (!cartItems.length || totalPrice <= 0) {
            alert("Your cart is empty.");
            return;
        }

        const address = [
            document.getElementById("address").value.trim(),
            document.getElementById("city").value.trim(),
            document.getElementById("state").value,
            document.getElementById("zip").value.trim(),
            document.getElementById("tel").value.trim()
        ].filter(Boolean).join(", ");

        placeOrderBtn.disabled = true;

        try {
            const response = await fetch("http://localhost:8080/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: currentUser.username,
                    address: address,
                    totalPrice: totalPrice
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Cannot place order");
            }


            for (const item of cartItems) {
                if (item.cartId) {
                    await fetch(`http://localhost:8080/api/cart/${item.cartId}`, {
                        method: "DELETE"
                    }).catch(() => {});
                }
            }

            localStorage.removeItem("checkoutSubtotal");
            localStorage.removeItem("checkoutTotal");

            alert("Your order has been placed!");
            window.location.href = "../orders.html";
        } catch (e) {
            console.error(e);
            alert(e.message || "Cannot place order");
            placeOrderBtn.disabled = false;
        }
    });
});
