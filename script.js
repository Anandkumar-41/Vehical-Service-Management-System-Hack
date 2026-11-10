 let customers = JSON.parse(localStorage.getItem("customers")) || [];
let vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
let services = JSON.parse(localStorage.getItem("services")) || [];
let currentUser = null;

function saveData() {
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    localStorage.setItem("services", JSON.stringify(services));
}

function commitChanges() {
    if (!currentUser) return;
    saveData();
    alert("All changes committed and saved successfully!");
    refresh();
}

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
        alert("Enter valid 10 digit phone number!");
        return;
    }

    if (customers.some(c =>
        c.username.toLowerCase() === user.toLowerCase())) {
        alert("Username already exists!");
        return;
    }

    customers.push({
        id: Date.now(),
        name,
        phone,
        username: user,
        password: pass
    });

    saveData();
    alert("Registration Successful!");

    document.getElementById("regName").value = "";
    document.getElementById("regPhone").value = "";
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";

    showLogin();
}

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
    document.getElementById("userInfo").innerText = "Welcome, " + customer.name;
    document.getElementById("welcomeName").innerText = customer.name;

    document.querySelectorAll("#mainSection section").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById("dashboard").classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.remove("active");
    });

    document.querySelector(".nav-btn").classList.add("active");
    refresh();
}

function logout() {
    currentUser = null;

    document.getElementById("mainSection").classList.add("hidden");
    document.getElementById("authSection").classList.remove("hidden");
    document.getElementById("userInfo").innerText =
        "Vehicle Service Management System";
    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";

    showLogin();
}

function showPage(page, button) {
    document.querySelectorAll("#mainSection section").forEach(s => {
        s.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");

    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.remove("active");
    });

    button.classList.add("active");
    refresh();
}

function myVehicles() {
    return vehicles.filter(v => v.customerId === currentUser.id);
}

function myServices() {
    return services.filter(s => s.customerId === currentUser.id);
}

function addVehicle() {
    let number = document.getElementById("vehicleNumber")
        .value.trim().toUpperCase();

    let model = document.getElementById("vehicleModel")
        .value.trim();

    let type = document.getElementById("vehicleType").value;

    if (!number || !model) {
        alert("Enter all vehicle details!");
        return;
    }

    if (vehicles.some(v => v.number === number)) {
        alert("Vehicle already registered!");
        return;
    }

    vehicles.push({
        id: Date.now(),
        customerId: currentUser.id,
        number,
        model,
        type
    });

    saveData();

    document.getElementById("vehicleNumber").value = "";
    document.getElementById("vehicleModel").value = "";
    document.getElementById("vehicleMessage").innerText =
        "Vehicle registered successfully!";

    refresh();
}

function editVehicle(id) {
    let vehicle = myVehicles().find(v => v.id === id);

    if (!vehicle) {
        alert("Vehicle not found!");
        return;
    }

    let number = prompt("Enter new vehicle number:", vehicle.number);
    if (number === null) return;

    number = number.trim().toUpperCase();

    if (!number) {
        alert("Vehicle number cannot be empty!");
        return;
    }

    if (vehicles.some(v => v.number === number && v.id !== id)) {
        alert("This vehicle number already exists!");
        return;
    }

    let model = prompt("Enter new vehicle model:", vehicle.model);
    if (model === null) return;

    model = model.trim();

    if (!model) {
        alert("Vehicle model cannot be empty!");
        return;
    }

    let type = prompt(
        "Enter vehicle type (Car/Bike/Scooter/Other):",
        vehicle.type
    );

    if (type === null) return;

    type = type.trim();

    if (!["Car", "Bike", "Scooter", "Other"].includes(type)) {
        alert("Enter Car, Bike, Scooter or Other!");
        return;
    }

    vehicle.number = number;
    vehicle.model = model;
    vehicle.type = type;

    saveData();
    alert("Vehicle updated successfully!");
    refresh();
}

function deleteVehicle(id) {
    let vehicle = myVehicles().find(v => v.id === id);
    if (!vehicle) return;

    let linkedServices = myServices().some(
        s => s.vehicleId === id
    );

    if (linkedServices) {
        alert("Cannot delete this vehicle because it has service records. Delete its service records first.");
        return;
    }

    if (!confirm("Are you sure you want to delete this vehicle?")) {
        return;
    }

    vehicles = vehicles.filter(v => v.id !== id);

    saveData();
    alert("Vehicle deleted successfully!");
    refresh();
}

function addService() {
    let vehicleId = Number(
        document.getElementById("serviceVehicle").value
    );

    let description = document.getElementById("serviceDescription")
        .value.trim();

    let vehicle = myVehicles().find(v => v.id === vehicleId);

    if (!vehicle || !description) {
        alert("Select vehicle and enter service description!");
        return;
    }

    services.push({
        id: Date.now(),
        customerId: currentUser.id,
        vehicleId: vehicle.id,
        description,
        charge: 0,
        status: "Pending",
        date: new Date().toLocaleDateString()
    });

    saveData();

    document.getElementById("serviceDescription").value = "";
    document.getElementById("serviceMessage").innerText =
        "Service created successfully!";

    refresh();
}

function editService(id) {
    let service = myServices().find(s => s.id === id);

    if (!service) return;

    if (service.status === "Completed") {
        alert("Completed service records cannot be edited!");
        return;
    }

    let description = prompt(
        "Enter updated service description:",
        service.description
    );

    if (description === null) return;

    description = description.trim();

    if (!description) {
        alert("Description cannot be empty!");
        return;
    }

    service.description = description;

    saveData();
    alert("Service updated successfully!");
    refresh();
}

function deleteService(id) {
    let service = myServices().find(s => s.id === id);
    if (!service) return;

    if (!confirm("Are you sure you want to delete this service record?")) {
        return;
    }

    services = services.filter(s =>
        !(s.id === id && s.customerId === currentUser.id)
    );

    saveData();
    alert("Service deleted successfully!");
    refresh();
}

function addCharge() {
    let id = Number(
        document.getElementById("chargeService").value
    );

    let amount = Number(
        document.getElementById("serviceCharge").value
    );

    let service = myServices().find(s => s.id === id);

    if (!service || !Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid service and charge!");
        return;
    }

    if (service.status === "Completed") {
        alert("Cannot change completed service charges!");
        return;
    }

    service.charge = amount;

    saveData();

    document.getElementById("serviceCharge").value = "";
    document.getElementById("chargeMessage").innerText =
        "Service charges saved successfully!";

    refresh();
}

function editCharge(id) {
    let service = myServices().find(s => s.id === id);

    if (!service) return;

    if (service.status === "Completed") {
        alert("Cannot edit charges of completed services!");
        return;
    }

    let amount = prompt(
        "Enter updated service charge:",
        service.charge
    );

    if (amount === null) return;

    amount = Number(amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid charge greater than zero!");
        return;
    }

    service.charge = amount;

    saveData();
    alert("Service charge updated successfully!");
    refresh();
}

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
        alert("Add service charges before completion!");
        return;
    }

    service.status = "Completed";

    saveData();

    document.getElementById("completeMessage").innerText =
        "Service completed successfully!";

    refresh();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function refresh() {
    if (!currentUser) return;

    let myV = myVehicles();
    let myS = myServices();

    document.getElementById("totalVehicles").innerText = myV.length;
    document.getElementById("totalServices").innerText = myS.length;

    document.getElementById("pendingServices").innerText =
        myS.filter(s => s.status === "Pending").length;

    document.getElementById("completedServices").innerText =
        myS.filter(s => s.status === "Completed").length;

    document.getElementById("vehicleTable").innerHTML =
        myV.map(v => `
            <tr>
                <td>${escapeHTML(v.number)}</td>
                <td>${escapeHTML(v.model)}</td>
                <td>${escapeHTML(v.type)}</td>
                <td>
                    <button class="edit-btn"
                        onclick="editVehicle(${v.id})">Edit</button>
                    <button class="delete-btn"
                        onclick="deleteVehicle(${v.id})">Delete</button>
                </td>
            </tr>
        `).join("") ||
        "<tr><td colspan='4'>No vehicles registered</td></tr>";

    document.getElementById("serviceVehicle").innerHTML =
        myV.map(v => `
            <option value="${v.id}">
                ${escapeHTML(v.number)} - ${escapeHTML(v.model)}
            </option>
        `).join("") ||
        "<option value=''>Register a vehicle first</option>";

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
                    <td>
                        <button class="edit-btn"
                            onclick="editService(${s.id})">Edit</button>
                        <button class="delete-btn"
                            onclick="deleteService(${s.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join("") ||
        "<tr><td colspan='6'>No service records found</td></tr>";

    document.getElementById("chargeTable").innerHTML =
        myS.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${escapeHTML(s.description)}</td>
                <td>₹${Number(s.charge).toFixed(2)}</td>
                <td>
                    <span class="status ${s.status}">
                        ${s.status}
                    </span>
                </td>
                <td>
                    <button class="edit-btn"
                        onclick="editCharge(${s.id})">Edit Charge</button>
                </td>
            </tr>
        `).join("") ||
        "<tr><td colspan='5'>No charges available</td></tr>";

    let pending = myS.filter(s => s.status === "Pending");

    document.getElementById("chargeService").innerHTML =
        pending.map(s => `
            <option value="${s.id}">
                Service #${s.id} - ₹${Number(s.charge).toFixed(2)}
            </option>
        `).join("") ||
        "<option value=''>No pending services</option>";

    document.getElementById("completeService").innerHTML =
        pending.map(s => `
            <option value="${s.id}">
                Service #${s.id} - ₹${Number(s.charge).toFixed(2)}
            </option>
        `).join("") ||
        "<option value=''>No pending services</option>";
}
// PRESS ENTER TO PERFORM ACTIONS
document.addEventListener("keydown", function(event) {
    if (event.key !== "Enter") return;

    let id = document.activeElement.id;

    let actions = {
        loginUser: login,
        loginPass: login,

        regName: register,
        regPhone: register,
        regUser: register,
        regPass: register,

        vehicleNumber: addVehicle,
        vehicleModel: addVehicle,
        vehicleType: addVehicle,

        serviceVehicle: addService,
        serviceDescription: addService,

        chargeService: addCharge,
        serviceCharge: addCharge,

        completeService: completeService
    };

    if (actions[id]) {
        event.preventDefault();
        actions[id]();
    }
});
