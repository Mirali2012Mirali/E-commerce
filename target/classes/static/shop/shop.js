document.addEventListener("DOMContentLoaded", async () => {

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const usernameDisplay = document.getElementById("usernameDisplay");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (currentUser) {
        usernameDisplay.textContent = currentUser.username;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

        logoutBtn.onclick = () => {
            localStorage.removeItem("currentUser");
            window.location.href = "../home/home.html";
        };
    }

    const productsContainer = document.getElementById("products-container");
    const categoryList = document.getElementById("category-list");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const FALLBACK_IMAGE = "../images/img1.jpg";

    let allProducts = [];
    let selectedCategory = "All";
    let selectedRating = null;
    let searchQuery = "";
    let sortBy = "default";

    function resolveImageUrl(imageUrl) {
        if (!imageUrl || imageUrl === "https://..." || imageUrl.trim() === "") {
            return FALLBACK_IMAGE;
        }
        return imageUrl;
    }

    function renderCategories(products) {
        const categories = [...new Set(
            products
                .map(p => p.category)
                .filter(Boolean)
        )].sort();

        categoryList.innerHTML = `
            <li class="list-group-item active" data-category="All">All</li>
            ${categories.map(cat =>
                `<li class="list-group-item" data-category="${cat}">${cat}</li>`
            ).join("")}
        `;
    }

    function renderProducts(products) {
        productsContainer.innerHTML = "";

        if (products.length === 0) {
            productsContainer.innerHTML =
                `<div class="col-12"><p class="text-muted">No products found.</p></div>`;
            return;
        }

        products.forEach(product => {
            const rating = Number(product.rating) || 0;
            const stars =
                "★".repeat(Math.min(rating, 5)) +
                "☆".repeat(5 - Math.min(rating, 5));
            const imageSrc = resolveImageUrl(product.imageUrl);
            const title = product.model || product.brand || "Product";

            productsContainer.insertAdjacentHTML(
                "beforeend",
                `
        <div class="col-md-3 product mb-3"
             data-id="${product.id}"
             data-category="${product.category || ""}"
             data-rating="${rating}"
             data-price="${product.price || 0}">

            <div class="card h-100">
                <a href="../productpage.html?id=${product.id}">
                    <img
                        src="${imageSrc}"
                        class="card-img-top product-img"
                        alt="${title}"
                        onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
                </a>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${product.price}$</p>
                    <p class="rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">(${rating})</span>
                    </p>
                    <button
                        class="btn btn-dark addCartBtn mt-auto"
                        data-id="${product.id}">
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
        `
            );
        });
    }

    function applyFilters() {
        let filtered = [...allProducts];

        if (selectedCategory && selectedCategory !== "All") {
            filtered = filtered.filter(p =>
                (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (selectedRating !== null) {
            filtered = filtered.filter(p =>
                (Number(p.rating) || 0) >= selectedRating
            );
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                [p.model, p.brand, p.category, p.description]
                    .filter(Boolean)
                    .some(value => value.toLowerCase().includes(q))
            );
        }

        if (sortBy === "low-high") {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === "high-low") {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        renderProducts(filtered);
    }

    try {
        const response = await fetch("http://localhost:8080/api/products");

        if (!response.ok) {
            throw new Error("Cannot load products.");
        }

        allProducts = await response.json();
        renderCategories(allProducts);
        applyFilters();

    } catch (e) {
        console.error(e);
        alert("Cannot load products.");
    }

    categoryList.addEventListener("click", (event) => {
        const item = event.target.closest(".list-group-item");
        if (!item) return;

        categoryList.querySelectorAll(".list-group-item")
            .forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        selectedCategory = item.dataset.category || "All";
        applyFilters();
    });

    document.querySelectorAll(".rating-filter").forEach(el => {
        el.addEventListener("click", () => {
            const rating = Number(el.dataset.rating);

            if (selectedRating === rating) {
                selectedRating = null;
                document.querySelectorAll(".rating-filter")
                    .forEach(r => r.classList.remove("active"));
            } else {
                selectedRating = rating;
                document.querySelectorAll(".rating-filter")
                    .forEach(r => r.classList.remove("active"));
                el.classList.add("active");
            }

            applyFilters();
        });
    });

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim();
        applyFilters();
    });

    sortSelect.addEventListener("change", () => {
        sortBy = sortSelect.value;
        applyFilters();
    });

    document.addEventListener("click", async (event) => {
        if (!event.target.classList.contains("addCartBtn")) {
            return;
        }

        const user = JSON.parse(localStorage.getItem("currentUser"));

        if (!user) {
            alert("Please login first");
            window.location.href = "../login/login.html";
            return;
        }

        const productId = event.target.dataset.id;

        try {
            const response = await fetch("http://localhost:8080/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: user.username,
                    productId: Number(productId),
                    quantity: 1
                })
            });

            if (response.ok) {
                alert("Product added to cart!");
            } else {
                const errorText = await response.text();
                alert(errorText || "Error adding to cart");
            }
        } catch (e) {
            console.error(e);
            alert("Error adding to cart");
        }
    });
});
