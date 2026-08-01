function createAccount(event) {
    event.preventDefault();

    const newUser = {
        name: document.getElementById("name").value,
        surname: document.getElementById("surname").value,
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("password").value
    };

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Registration failed");
        }
        return response.json();
    })
    .then(data => {
        alert("Account created successfully!");

        localStorage.setItem("currentUser", JSON.stringify(data));

        window.location.href = "../login/login.html";
    })
    .catch(error => {
        console.error(error);
        alert(error.message);
    });
}