// ================= SAVE =================

function saveEmployee() {

    let employee = {

        id: document.getElementById("empId").value,
        name: document.getElementById("empName").value,
        salary: document.getElementById("salary").value

    };

    fetch("http://localhost:8081/employee", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(employee)

    })

    .then(response => response.text())

    .then(message => {

        alert(message);

        clearForm();

        getAllEmployees();

    });

}


// ================= VIEW =================

function getAllEmployees() {

    fetch("http://localhost:8081/allemployee")

    .then(response => response.json())

    .then(data => {

        let tableBody = document.getElementById("employeeTable");

        tableBody.innerHTML = "";

        data.forEach(employee => {

            tableBody.innerHTML += `

                <tr>

                    <td>${employee.id}</td>

                    <td>${employee.name}</td>

                    <td>${employee.salary}</td>

                    <td>
                        <button onclick="editEmployee(${employee.id})">
                            Edit
                        </button>
                    </td>

                    <td>
                        <button onclick="deleteEmployee(${employee.id})">
                            Delete
                        </button>
                    </td>

                </tr>

            `;

        });

    });

}


// ================= EDIT =================

function editEmployee(id) {

    fetch(`http://localhost:8081/employee/${id}`)

    .then(response => response.json())

    .then(employee => {

        document.getElementById("empId").value = employee.id;
        document.getElementById("empName").value = employee.name;
        document.getElementById("salary").value = employee.salary;

    });

}


// ================= UPDATE =================

function updateEmployee() {

    let employee = {

        id: document.getElementById("empId").value,
        name: document.getElementById("empName").value,
        salary: document.getElementById("salary").value

    };

    fetch("http://localhost:8081/employee", {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(employee)

    })

    .then(response => response.text())

    .then(message => {

        alert(message);

        clearForm();

        getAllEmployees();

    });

}


// ================= DELETE =================

function deleteEmployee(id) {

    if(confirm("Are you sure you want to delete this employee?")){

        fetch(`http://localhost:8081/delete/${id}`, {

            method: "DELETE"

        })

        .then(response => response.text())

        .then(message => {

            alert(message);

            clearForm();

            getAllEmployees();

        });

    }

}


// ================= CLEAR =================

function clearForm(){

    document.getElementById("empId").value = "";
    document.getElementById("empName").value = "";
    document.getElementById("salary").value = "";

}