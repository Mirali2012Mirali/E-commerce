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

    const form = document.querySelector(".form");
    const brandInput = document.querySelector(".brandInput");
    const modelInput = document.querySelector(".modelInput");
    const categoryInput = document.querySelector(".categoryInput");
    const descriptionInput = document.querySelector(".descriptionInput");
    const priceInput = document.querySelector(".priceInput");
    const rateInput = document.querySelector(".rateInput");
    const imageInput = document.querySelector(".imageInput");
    const imagePreview = document.querySelector(".imageInForm");
    const title = document.querySelector(".title");

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const isEdit = Boolean(editId);

    if (isEdit) {
        title.textContent = "Edit Product";
        try {
            const response = await fetch(`http://localhost:8080/api/products/${editId}`);
            if (!response.ok) {
                throw new Error("Product not found");
            }
            const product = await response.json();

            brandInput.value = product.brand || "";
            modelInput.value = product.model || "";
            categoryInput.value = product.category || "";
            descriptionInput.value = product.description || "";
            priceInput.value = product.price || "";
            rateInput.value = product.rating || "";
            imageInput.value = product.imageUrl || "";
            imagePreview.src = product.imageUrl || "";
        } catch (e) {
            console.error(e);
            alert("Cannot load product.");
        }
    }

    imageInput.addEventListener("input", () => {
        imagePreview.src = imageInput.value || "";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const payload = {
            brand: brandInput.value.trim(),
            model: modelInput.value.trim(),
            category: categoryInput.value.trim(),
            description: descriptionInput.value.trim(),
            price: Number(priceInput.value),
            rating: Number(rateInput.value),
            imageUrl: imageInput.value.trim(),
            ownerUsername: currentUser.username
        };

        try {
            const url = isEdit
                ? `http://localhost:8080/api/products/${editId}`
                : "http://localhost:8080/api/products";

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Cannot save product");
            }

            alert(isEdit ? "Product updated!" : "Product created!");
            window.location.href = "./userproducts.html";
        } catch (e) {
            console.error(e);
            alert(e.message || "Cannot save product");
        }
    });
});
