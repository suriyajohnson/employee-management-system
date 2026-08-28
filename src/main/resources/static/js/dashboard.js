
let employeeModal;
let editingEmployeeId = null;
/*=====================================================
            ENTERPRISE EMPLOYEE MANAGEMENT SYSTEM
                    DASHBOARD.JS
=====================================================*/


/*=====================================================
                LIVE CLOCK
=====================================================*/

function updateClock() {

    const now = new Date();

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const clock = document.getElementById("clock");

    if (clock) {

        clock.innerHTML = now.toLocaleTimeString('en-IN', options);

    }

}


/*=====================================================
                CURRENT DATE
=====================================================*/

function updateDate() {

    const now = new Date();

    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    const date = document.getElementById("todayDate");

    if (date) {

        date.innerHTML = now.toLocaleDateString('en-IN', options);

    }

    const calendar = document.getElementById("currentDate");

    if (calendar) {

        calendar.innerHTML = now.toDateString();

    }

}


/*=====================================================
                START CLOCK
=====================================================*/

setInterval(updateClock,1000);

updateClock();

updateDate();


/*=====================================================
            PAGE LOAD
=====================================================*/

window.onload=function(){

    console.log("Enterprise Dashboard Loaded Successfully");

};

/*=====================================================
                EMPLOYEE GROWTH CHART
=====================================================*/

const employeeChartCanvas = document.getElementById("employeeChart");

if(employeeChartCanvas){

    new Chart(employeeChartCanvas,{

        type:"line",

        data:{

            labels:[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug"
            ],

            datasets:[{

                label:"Employees",

                data:[
                    55,
                    67,
                    74,
                    82,
                    96,
                    108,
                    117,
                    125
                ],

                borderColor:"#2563eb",

                backgroundColor:"rgba(37,99,235,0.15)",

                fill:true,

                tension:.4,

                borderWidth:3,

                pointRadius:5,

                pointBackgroundColor:"#2563eb"

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{
                    display:true
                }

            }

        }

    });

}


/*=====================================================
            DEPARTMENT DISTRIBUTION CHART
=====================================================*/

const departmentCanvas=document.getElementById("departmentChart");

if(departmentCanvas){

    new Chart(departmentCanvas,{

        type:"doughnut",

        data:{

            labels:[

                "Automation",

                "Java",

                "HR",

                "Support",

                "Testing"

            ],

            datasets:[{

                data:[

                    35,

                    25,

                    15,

                    10,

                    15

                ],

                backgroundColor:[

                    "#2563eb",

                    "#16a34a",

                    "#f59e0b",

                    "#dc2626",

                    "#7c3aed"

                ]

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}

/*=====================================================
                DARK MODE
=====================================================*/

function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        localStorage.setItem("theme","dark");

    }else{

        localStorage.setItem("theme","light");

    }

}


/*=====================================================
            LOAD SAVED THEME
=====================================================*/

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark-mode");

}


/*=====================================================
            PROFILE MENU
=====================================================*/

const profileButton=document.querySelector(".profile-dropdown button");

const profileMenu=document.querySelector(".profile-menu");

if(profileButton && profileMenu){

    profileButton.addEventListener("click",function(e){

        e.stopPropagation();

        if(profileMenu.style.display==="block"){

            profileMenu.style.display="none";

        }else{

            profileMenu.style.display="block";

        }

    });

    document.addEventListener("click",function(){

        profileMenu.style.display="none";

    });

}


/*=====================================================
            NOTIFICATION ICON
=====================================================*/

const notification=document.querySelector(".notification-icon");

if(notification){

    notification.addEventListener("click",function(){

        alert(
            "🔔 Notifications\n\n" +
            "• 2 Employees joined today\n" +
            "• Payroll pending approval\n" +
            "• Attendance report generated"
        );

    });

}

/*=====================================================
            EMPLOYEE TABLE SEARCH
=====================================================*/

const employeeSearch = document.querySelector(".table-search");

if (employeeSearch) {

    employeeSearch.addEventListener("keyup", function () {

        const filter = this.value.toLowerCase();

        const rows = document.querySelectorAll("table tbody tr");

        rows.forEach(function (row) {

            const text = row.innerText.toLowerCase();

            if (text.includes(filter)) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    });

}


/*=====================================================
            QUICK ACTION BUTTONS
=====================================================*/

const quickButtons = document.querySelectorAll(".quick-btn");

quickButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const action = this.innerText;

        alert("🚀 " + action + " module will be connected with Spring Boot soon.");

    });

});


/*=====================================================
            SMALL CARD ANIMATION
=====================================================*/

const cards = document.querySelectorAll(".stat-card");

cards.forEach(function(card){

    card.addEventListener("mouseenter",function(){

        card.style.transform="translateY(-10px) scale(1.02)";

    });

    card.addEventListener("mouseleave",function(){

        card.style.transform="translateY(0px) scale(1)";

    });

});


/*=====================================================
            PAGE SCROLL EFFECT
=====================================================*/

window.addEventListener("scroll",function(){

    const topbar=document.querySelector(".topbar");

    if(!topbar) return;

    if(window.scrollY>30){

        topbar.style.boxShadow="0 10px 30px rgba(0,0,0,.15)";

    }

    else{

        topbar.style.boxShadow="0 3px 15px rgba(0,0,0,.08)";

    }

});

/*=====================================================
        ENTERPRISE DASHBOARD INITIALIZATION
=====================================================*/

document.addEventListener("DOMContentLoaded", function () {

    console.log("========================================");
    console.log(" Enterprise Employee Management System ");
    console.log(" Dashboard Initialized Successfully");
    console.log("========================================");

    initializeDashboard();

});


/*=====================================================
            DASHBOARD INITIALIZATION
=====================================================*/

function initializeDashboard() {

    loadDashboardStatistics();

    loadEmployeeTable();

    initializeCharts();

    initializeEvents();

	loadEmployees();
}


/*=====================================================
            DASHBOARD STATISTICS
=====================================================*/


    // Future API Call
    // fetch('/api/dashboard/statistics')
	
	function loadDashboardStatistics() {

	    console.log("Loading Dashboard Statistics...");

	    fetch("/dashboard/statistics")
	        .then(response => {

	            if (!response.ok) {
	                throw new Error("Failed to load dashboard statistics");
	            }

	            return response.json();

	        })
	        .then(data => {

	            console.log(data);

				document.getElementById("empCount").innerText = data.TotalEmployee;
				            document.getElementById("activeCount").innerText = data.ActiveEmployee;
				            document.getElementById("inactiveCount").innerText = data.Inactive;

	        })
	        .catch(error => {

	            console.error("Dashboard Error :", error);

	        });

	}





/*=====================================================
            EMPLOYEE TABLE
=====================================================*/

function loadEmployeeTable() {

    console.log("Loading Employee Table...");

    // Future API Call
    // fetch('/api/employees')

}


/*=====================================================
            CHART INITIALIZATION
=====================================================*/

function initializeCharts() {

    console.log("Charts Loaded Successfully");

}


/*=====================================================
            EVENT INITIALIZATION
=====================================================*/

function initializeEvents() {

    console.log("Dashboard Events Registered");

}


/*=====================================================
            FUTURE SPRING BOOT APIs
=====================================================*/

/*

GET     /employees

POST    /employees

PUT     /employees/{id}

DELETE  /employees/{id}

GET     /dashboard/statistics

GET     /dashboard/chart

GET     /departments

GET     /attendance

GET     /payroll

*/


/*=====================================================
            APPLICATION VERSION
=====================================================*/

const APPLICATION = {

    NAME: "Enterprise Employee Management System",

    VERSION: "2.0.0",

    AUTHOR: "Suriya Johnson"

};

console.log(APPLICATION);

/*=====================================================
            LOAD EMPLOYEES
=====================================================*/

function loadEmployees() {

    console.log("Loading Employee Table...");

    fetch("/allemployee")
        .then(response => response.json())
        .then(data => {

			const tableBody = document.getElementById("employeeTableBody");

			tableBody.innerHTML = "";

			data.forEach(employee => {

			    tableBody.innerHTML += `

			        <tr>

			            <td>
			                <img src="https://i.pravatar.cc/45?img=5" class="emp-img">
			            </td>

			            <td>${employee.id}</td>

			            <td>${employee.name}</td>

			            <td>${employee.designation}</td>

			            <td>₹${employee.salary}</td>

			            <td>${employee.status}</td>

			            <td>

						<button class="btn btn-primary btn-sm"
						        onclick="viewEmployee(${employee.id})">
						    View
						</button>

						<button class="btn btn-warning btn-sm"
						        onclick="editEmployee(${employee.id})">
						    Edit
						</button>

						<button class="btn btn-danger btn-sm"
						        onclick="deleteEmployee(${employee.id})">
						    Delete
						</button>

			            </td>

			        </tr>

			    `;

			});
            console.log(data);

        })
        .catch(error => {

            console.error(error);

        });

}

/*=====================================================
            OPEN EMPLOYEE MODAL
=====================================================*/

function openEmployeeModal() {

    editingEmployeeId = null;

    document.getElementById("saveEmployeeBtn").innerHTML = "Save Employee";

    document.getElementById("employeeCode").value = "";
    document.getElementById("employeeName").value = "";
    document.getElementById("employeeEmail").value = "";
    document.getElementById("employeeMobile").value = "";
    document.getElementById("employeeDesignation").value = "";
    document.getElementById("employeeSalary").value = "";
    document.getElementById("employeeJoiningDate").value = "";

    employeeModal = new bootstrap.Modal(
        document.getElementById("employeeModal")
    );

    employeeModal.show();

}
/*=====================================================
            SAVE EMPLOYEE
=====================================================*/

function saveEmployee() {

    const employee = {

        employeeCode: document.getElementById("employeeCode").value,
        name: document.getElementById("employeeName").value,
        email: document.getElementById("employeeEmail").value,
        mobile: document.getElementById("employeeMobile").value,
        designation: document.getElementById("employeeDesignation").value,
        salary: document.getElementById("employeeSalary").value,
        dateOfJoining: document.getElementById("employeeJoiningDate").value

    };

    // Add ID only while updating
    if (editingEmployeeId != null) {
        employee.id = editingEmployeeId;
    }

    const url = "/employee";

    const method = editingEmployeeId == null
        ? "POST"
        : "PUT";

    console.log("Editing ID :", editingEmployeeId);
    console.log("HTTP Method :", method);
    console.log(employee);

    fetch(url, {

        method: method,

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(employee)

    })

    .then(response => {

        if (!response.ok) {
            throw new Error("HTTP Error : " + response.status);
        }

        return response.text();

    })

    .then(data => {

        alert(data);

        // Close Modal
        employeeModal.hide();

        // Reset editing mode
        editingEmployeeId = null;

        // Change button back
        document.getElementById("saveEmployeeBtn").innerHTML = "Save Employee";

        // Reload table
        loadEmployees();

        // Reload dashboard
        loadDashboardStatistics();

    })

    .catch(error => {

        console.error(error);

        alert("Something went wrong while saving employee.");

    });

}

function viewEmployee(id){

    fetch("/employee/" + id)

    .then(response => response.json())

    .then(employee => {

        console.log(employee);

        document.getElementById("viewEmployeeCode").innerHTML = employee.employeeCode;

        document.getElementById("viewEmployeeName").innerHTML = employee.name;

        document.getElementById("viewEmployeeEmail").innerHTML = employee.email;

        document.getElementById("viewEmployeeMobile").innerHTML = employee.mobile;

        document.getElementById("viewEmployeeDesignation").innerHTML = employee.designation;

        document.getElementById("viewEmployeeSalary").innerHTML = "₹" + employee.salary;

        document.getElementById("viewEmployeeStatus").innerHTML = employee.status;

        document.getElementById("viewEmployeeDOJ").innerHTML = employee.dateOfJoining;

        new bootstrap.Modal(document.getElementById("viewEmployeeModal")).show();

    })

    .catch(error => console.error(error));

}
function editEmployee(id) {

    fetch("/employee/" + id)

        .then(response => response.json())

        .then(employee => {

            console.log(employee);

            // ⭐ Remember which employee is being edited
            editingEmployeeId = employee.id;

            // ⭐ Change button text
            document.getElementById("saveEmployeeBtn").innerHTML = "Update Employee";

            // Fill the form
            document.getElementById("employeeCode").value = employee.employeeCode;
            document.getElementById("employeeName").value = employee.name;
            document.getElementById("employeeEmail").value = employee.email;
            document.getElementById("employeeMobile").value = employee.mobile;
            document.getElementById("employeeDesignation").value = employee.designation;
            document.getElementById("employeeSalary").value = employee.salary;
            document.getElementById("employeeJoiningDate").value = employee.dateOfJoining;

            // Open modal
            employeeModal = new bootstrap.Modal(
                document.getElementById("employeeModal")
            );

            employeeModal.show();

        })

        .catch(error => {

            console.error(error);

        });

}

function deleteEmployee(id) {

    if (!confirm("Are you sure you want to delete this employee?")) {
        return;
    }

    fetch("/delete/" + id, {
        method: "DELETE"
    })

    .then(response => response.text())

    .then(data => {

        alert(data);

        loadEmployees();

        loadDashboardStatistics();

    })

    .catch(error => {

        console.error(error);

    });

}

function searchEmployee() {

    const searchText = document
        .getElementById("searchEmployee")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#employeeTableBody tr");

    rows.forEach(row => {

        const rowText = row.textContent.toLowerCase();

        if (rowText.includes(searchText)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}