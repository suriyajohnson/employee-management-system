function login() {

    let user = {

        username: document.getElementById("username").value,

        password: document.getElementById("password").value

    };

    fetch("/login", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(user)

    })

    .then(response => response.text())

    .then(message => {

        if(message === "ADMIN"){

            window.location.href = "admin-dashboard.html";

        }
        else if(message === "EMPLOYEE"){

            window.location.href = "employee-dashboard.html";

        }
        else{

            alert(message);

        }

    })

    .catch(error => {

        console.log(error);

    });

}