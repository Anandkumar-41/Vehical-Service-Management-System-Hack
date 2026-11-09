
// LOAD DATA FROM LOCAL STORAGE

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];

let currentUser = null;

// SAVE DATA

function saveData() {
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    localStorage.setItem("services", JSON.stringify(services));
}

// REGISTRATION

function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
    document.getElementById("authMessage").innerText = "";
}

function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

function register() {
    let name = document.getElementById("regName").value.trim();
    let phone = document.getElementById("regPhone").value.trim();
    let user = document.getElementById("regUser").value.trim();
    let pass = document.getElementById("regPass").value;

    if (!name || !phone || !user || !pass) {
        alert("Please fill all details!");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter a valid 10-digit phone number!");
        return;
    }

    if (customers.some(c =>
        c.username.toLowerCase() === user.toLowerCase())) {
        alert("Username already exists!");
        return;
    }

    customers.push({
        id: Date.now(),
        name: name,
        phone: phone,
        username: user,
        password: pass
    });

    saveData();

    alert("Registration Successful! Please Login.");

    document.getElementById("regName").value = "";
    document.getElementById("regPhone").value = "";
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";

    showLogin();
}

// LOGIN

function login() {
    let user = document.getElementById("loginUser").value.trim();
    let pass = document.getElementById("loginPass").value;

    let customer = customers.find(c =>
        c.username.toLowerCase() === user.toLowerCase() &&
        c.password === pass
    );

    if (!customer) {
        document.getElementById("authMessage").innerText =
            "Invalid username or password!";
        return;
    }

    currentUser = customer;

    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("mainSection").classList.remove("hidden");

    document.getElementById("userInfo").innerText =
        "Welcome, " + customer.name;

    document.getElementById("welcomeName").innerText =
        customer.name;

    // Open dashboard after login

    document.querySelectorAll("#mainSection section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById("dashboard").classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelector(".nav-btn").classList.add("active");

    refresh();
}

// LOGOUT

function logout() {
    currentUser = null;

    document.getElementById("mainSection").classList.add("hidden");
    document.getElementById("authSection").classList.remove("hidden");

    document.getElementById("userInfo").innerText =
        "Vehicle Service Management System";

    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";

    document.getElementById("authMessage").innerText = "";

    showLogin();
}

// NAVIGATION

function showPage(page, button) {

    document.querySelectorAll("#mainSection section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    refresh();
}

// GET CURRENT CUSTOMER VEHICLES

function myVehicles() {
    return vehicles.filter(v =>
        v.customerId === currentUser.id
    );
}

// GET CURRENT CUSTOMER SERVICES

function myServices() {
    return services.filter(s =>
        s.customerId === currentUser.id
    );
}

// REGISTER VEHICLE

function addVehicle() {

    let number = document.getElementById("vehicleNumber")
        .value.trim().toUpperCase();

    let model = document.getElementById("vehicleModel")
        .value.trim();

    let type = document.getElementById("vehicleType").value;

    if (!number || !model) {
        alert("Please enter all vehicle details!");
        return;
    }

    if (vehicles.some(v => v.number === number)) {
        alert("This vehicle number is already registered!");
        return;
    }

    vehicles.push({
        id: Date.now(),
        customerId: currentUser.id,
        number: number,
        model: model,
        type: type
    });

    saveData();

    document.getElementById("vehicleNumber").value = "";
    document.getElementById("vehicleModel").value = "";

    document.getElementById("vehicleMessage").innerText =
        "Vehicle registered successfully!";

    refresh();
}

// CREATE SERVICE RECORD

function addService() {

    let vehicleId = Number(
        document.getElementById("serviceVehicle").value
    );

    let description = document.getElementById("serviceDescription")
        .value.trim();

    let vehicle = myVehicles().find(v => v.id === vehicleId);

    if (!vehicle || !description) {
        alert("Please select a vehicle and enter service description!");
        return;
    }

    services.push({
        id: Date.now(),
        customerId: currentUser.id,
        vehicleId: vehicle.id,
        description: description,
        charge: 0,
        status: "Pending",
        date: new Date().toLocaleDateString()
    });

    saveData();

    document.getElementById("serviceDescription").value = "";

    document.getElementById("serviceMessage").innerText =
        "Service record created successfully!";

    refresh();
}

// ADD SERVICE CHARGES

function addCharge() {

    let id = Number(
        document.getElementById("chargeService").value
    );

    let amount = Number(
        document.getElementById("serviceCharge").value
    );

    let service = myServices().find(s => s.id === id);

    if (!service || !Number.isFinite(amount) || amount <= 0) {
        alert("Please select a service and enter a valid charge!");
        return;
    }

    if (service.status === "Completed") {
        alert("Cannot change charges for completed services!");
        return;
    }

    service.charge = amount;

    saveData();

    document.getElementById("serviceCharge").value = "";

    document.getElementById("chargeMessage").innerText =
        "Service charges saved successfully!";

    refresh();
}

// COMPLETE SERVICE

function completeService() {

    let id = Number(
        document.getElementById("completeService").value
    );

    let service = myServices().find(s => s.id === id);

    if (!service) {
        alert("Please select a service!");
        return;
    }

    if (service.status === "Completed") {
        alert("Service is already completed!");
        return;
    }

    if (service.charge <= 0) {
        alert("Please add service charges before completion!");
        return;
    }

    service.status = "Completed";

    saveData();

    document.getElementById("completeMessage").innerText =
        "Service completed successfully!";

    refresh();
}

// PREVENT HTML INJECTION

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// REFRESH DASHBOARD AND TABLES

function refresh() {

    if (!currentUser) return;

    let myV = myVehicles();
    let myS = myServices();

    // DASHBOARD COUNTS

    document.getElementById("totalVehicles").innerText =
        myV.length;

    document.getElementById("totalServices").innerText =
        myS.length;

    document.getElementById("pendingServices").innerText =
        myS.filter(s => s.status === "Pending").length;

    document.getElementById("completedServices").innerText =
        myS.filter(s => s.status === "Completed").length;

    // VEHICLE TABLE

    document.getElementById("vehicleTable").innerHTML =
        myV.map(v => `
            <tr>
                <td>${escapeHTML(v.number)}</td>
                <td>${escapeHTML(v.model)}</td>
                <td>${escapeHTML(v.type)}</td>
            </tr>
        `).join("") ||
        "<tr><td colspan='3'>No vehicles registered</td></tr>";

    // VEHICLE DROPDOWN

    document.getElementById("serviceVehicle").innerHTML =
        myV.map(v => `
            <option value="${v.id}">
                ${escapeHTML(v.number)} - ${escapeHTML(v.model)}
            </option>
        `).join("") ||
        "<option value=''>Register a vehicle first</option>";

    // SERVICE TABLE

    document.getElementById("serviceTable").innerHTML =
        myS.map(s => {

            let vehicle = myV.find(v => v.id === s.vehicleId);

            return `
                <tr>
                    <td>${s.id}</td>
                    <td>${escapeHTML(vehicle ? vehicle.number : "Unknown")}</td>
                    <td>${escapeHTML(s.description)}</td>
                    <td>₹${Number(s.charge).toFixed(2)}</td>
                    <td>
                        <span class="status ${s.status}">
                            ${s.status}
                        </span>
                    </td>
                </tr>
            `;

        }).join("") ||
        "<tr><td colspan='5'>No service records found</td></tr>";

    // PENDING SERVICES

    let pending = myS.filter(s => s.status === "Pending");

    // CHARGE DROPDOWN

    document.getElementById("chargeService").innerHTML =
        pending.map(s => `
            <option value="${s.id}">
                Service #${s.id} - ₹${Number(s.charge).toFixed(2)}
            </option>
        `).join("") ||
        "<option value=''>No pending services</option>";

    // COMPLETION DROPDOWN

    document.getElementById("completeService").innerHTML =
        pending.map(s => `
            <option value="${s.id}">
                Service #${s.id} - ₹${Number(s.charge).toFixed(2)}
            </option>
        `).join("") ||
        "<option value=''>No pending services</option>";
}
