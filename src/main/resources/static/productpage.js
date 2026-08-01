document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    try {


        const response = await fetch(`http://localhost:8080/api/products/${id}`);
        const product = await response.json();

        document.getElementById("product-title").textContent = product.model;
        document.getElementById("product-price").textContent = product.price + "$";
        document.getElementById("product-description").textContent = product.description || "";
        document.getElementById("product-rating").textContent =
            "⭐".repeat(product.rating || 0);

        document.getElementById("product-image").src = product.imageUrl;


        const response2 = await fetch("http://localhost:8080/api/products");
        const products = await response2.json();


        const related = products
            .filter(p => p.id != product.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);


        const relatedContainer = document.querySelector(".related-items .row");

        relatedContainer.innerHTML = "";

        related.forEach(item => {

            relatedContainer.innerHTML += `

            <div class="col-md-3 related-product">

                <a href="productpage.html?id=${item.id}">
                    <img src="${item.imageUrl}" class="img-fluid rounded">
                </a>

                <p class="mt-2">${item.model}</p>

                <p class="text-danger">
                    ${item.price}$
                </p>

                <p>
                    ${"⭐".repeat(item.rating || 0)}
                </p>

            </div>

            `;

        });

        // add to cart
        document.getElementById("add-to-cart").addEventListener("click", async () => {

            const currentUser = JSON.parse(localStorage.getItem("currentUser"));

            if (!currentUser) {
                alert("Please login first");
                return;
            }

            const cartResponse = await fetch("http://localhost:8080/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: currentUser.username,
                    productId: Number(id),
                    quantity: 1
                })
            });

            if (cartResponse.ok) {
                alert("Product added to cart!");
            } else {
                alert("Error adding cart");
            }

        });

    } catch (e) {

        console.error(e);

    }

});