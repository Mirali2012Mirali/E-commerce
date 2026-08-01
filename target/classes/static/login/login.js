async function login(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            const error = await response.text();
            alert(error);
            return;
        }

        const user = await response.json();

        localStorage.setItem("currentUser", JSON.stringify(user));

        alert("Вы успешно вошли!");
        window.location.href = "../home/home.html";

    } catch (error) {
        console.error(error);
        alert("Ошибка подключения к серверу.");
    }
}