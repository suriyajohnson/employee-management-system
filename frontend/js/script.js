
function saveEmployee() {

    let id = Number(document.getElementById("empId").value);
    let name = document.getElementById("empName").value;
    let salary = Number(document.getElementById("salary").value);

    let employee = {

        id: id,
        name: name,
        salary: salary

    };

    fetch("http://localhost:8081/employee", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(employee)

    })

    .then(response => response.text())

    .then(data => {

        console.log(data);
         alert(data);
         document.getElementById("empId").value= "";
         document.getElementById("empName").value= "";
         document.getElementById("salary").value= "";

    })

    .catch(error => {

        console.log(error);

    });

}