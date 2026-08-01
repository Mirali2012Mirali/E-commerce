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

    const tbody = document.querySelector(".tbody");
    const FALLBACK_IMAGE = "./images/img1.jpg";

    async function loadProducts() {
        let response = await fetch(
            `http://localhost:8080/api/products/user/${encodeURIComponent(currentUser.username)}`
        );

        let products;
        if (response.ok) {
            products = await response.json();
        } else {
            response = await fetch("http://localhost:8080/api/products");
            if (!response.ok) {
                throw new Error("Cannot load products");
            }
            const allProducts = await response.json();
            products = allProducts.filter(
                p => p.ownerUsername === currentUser.username
            );
        }
        tbody.innerHTML = "";

        if (!products.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-muted">You have no products yet.</td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const imageUrl = product.imageUrl || FALLBACK_IMAGE;

            tbody.insertAdjacentHTML(
                "beforeend",
                `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.brand || "-"}</td>
                    <td>${product.model || "-"}</td>
                    <td>${product.category || "-"}</td>
                    <td>
                        <img src="${imageUrl}"
                             width="60"
                             height="60"
                             style="object-fit:contain;cursor:pointer"
                             class="product-thumb"
                             data-src="${imageUrl}"
                             onerror="this.src='${FALLBACK_IMAGE}'">
                    </td>
                    <td>${Number(product.price || 0).toFixed(2)}$</td>
                    <td>${product.rating || 0}</td>
                    <td>
                        <a href="./newproduct.html?id=${product.id}" class="btn btn-sm btn-warning">Edit</a>
                        <button class="btn btn-sm btn-danger deleteBtn" data-id="${product.id}">Delete</button>
                    </td>
                </tr>
                `
            );
        });
    }

    try {
        await loadProducts();
    } catch (e) {
        console.error(e);
        alert("Cannot load your products.");
    }

    tbody.addEventListener("click", async (event) => {
        if (event.target.classList.contains("product-thumb")) {
            const modalImg = document.querySelector(".imageInModal");
            modalImg.src = event.target.dataset.src;
            const modal = new bootstrap.Modal(document.getElementById("imageModal"));
            modal.show();
            return;
        }

        if (!event.target.classList.contains("deleteBtn")) {
            return;
        }

        const id = event.target.dataset.id;
        if (!confirm("Delete this product?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/products/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Cannot delete product");
            }

            await loadProducts();
        } catch (e) {
            console.error(e);
            alert("Cannot delete product.");
        }
    });
});
