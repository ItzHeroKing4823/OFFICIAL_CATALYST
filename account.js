// ========================================
// CATALYST HEALTH PASSPORT
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // GET CURRENT USER
    // ========================================

    if (typeof getCurrentUser !== "function") {
        console.error("getCurrentUser() was not found. Check auth.js.");
        return;
    }

    let user = getCurrentUser();

    const loggedOut = document.getElementById("loggedOut");
    const accountPreview = document.getElementById("accountPreview");

    if (!user) {
        if (loggedOut) loggedOut.hidden = false;
        if (accountPreview) accountPreview.hidden = true;

        updateAccountNavbar();
        return;
    }

    if (loggedOut) loggedOut.hidden = true;
    if (accountPreview) accountPreview.hidden = false;

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function getElement(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        const element = getElement(id);

        if (element) {
            element.textContent = value ?? "";
        }
    }

    function getSavedData(key, fallback) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (error) {
            console.error("Could not read saved data:", error);
            return fallback;
        }
    }

    function getUserName() {
        return user.name || user.username || "CATALYST Member";
    }

    function getUserEmail() {
        return user.email || "";
    }

    function getInitials(name) {
        return name
            .trim()
            .split(/\s+/)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }

    function hashEmail(email) {
        let total = 7;

        for (let i = 0; i < email.length; i++) {
            total = (total * 31 + email.charCodeAt(i)) % 100000;
        }

        return total;
    }

    function getMemberNumber(email) {
        return "CAT-" + String(hashEmail(email)).padStart(5, "0");
    }

    function showMessage(message) {
        if (typeof showToast === "function") {
            showToast(message);
        } else {
            alert(message);
        }
    }

    // ========================================
    // PROFILE INFORMATION
    // ========================================

    function showProfile() {
        const name = getUserName();
        const email = getUserEmail();

        const township = user.township || user.area || "Not provided";

        setText("greeting", "Welcome to CATALYST");
        setText("userName", name);
        setText("memberNo", getMemberNumber(email));
        setText("userArea", township);
        setText("userEmail", email);

        setText("loginBannerText", "Welcome, " + name + "!");

        const avatar = getElement("avatar");

        if (avatar) {
            avatar.textContent = getInitials(name);
        }

        const joined = user.joined || user.createdAt || user.dateJoined;

        if (joined) {
            const date = new Date(joined);

            if (!isNaN(date.getTime())) {
                setText(
                    "statSince",
                    date.toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric"
                    })
                );
            } else {
                setText("statSince", joined);
            }
        } else {
            setText("statSince", "CATALYST Member");
        }
    }

    // ========================================
    // TOWNSHIP INFORMATION
    // ========================================

    function showArea() {
        const township = user.township || user.area || "";

        setText(
            "areaTitle",
            township ? township + " township" : "Your area"
        );

        const areaLevel = getElement("areaLevel");
        const areaText = getElement("areaText");
        const areaAdvice = getElement("areaAdvice");
        const areaSource = getElement("areaSource");

        if (!township) {
            if (areaLevel) {
                areaLevel.textContent = "PROFILE INCOMPLETE";
                areaLevel.className = "level-tag level-none";
            }

            if (areaText) {
                areaText.textContent =
                    "You have not added your Yangon township yet.";
            }

            if (areaAdvice) {
                areaAdvice.textContent =
                    "Edit your passport to add your township and view relevant local information.";
            }

            if (areaSource) {
                areaSource.textContent = "";
            }

            return;
        }

        let hasAlert = false;

        if (typeof isAlertTownship === "function") {
            hasAlert = isAlertTownship(township);
        }

        if (hasAlert) {
            if (areaLevel) {
                areaLevel.textContent = "AREA NOTICE";
                areaLevel.className = "level-tag level-alert";
            }

            if (areaText) {
                areaText.textContent =
                    "Your township has an active notice in the available CATALYST warning data.";
            }

            if (areaAdvice) {
                areaAdvice.textContent =
                    "Check the latest information and follow official public health guidance.";
            }
        } else {
            if (areaLevel) {
                areaLevel.textContent = "GENERAL UPDATE";
                areaLevel.className = "level-tag level-low";
            }

            if (areaText) {
                areaText.textContent =
                    "There is no active township notice recorded for your selected area in the available data.";
            }

            if (areaAdvice) {
                areaAdvice.textContent =
                    "Continue practising everyday prevention and check official updates regularly.";
            }
        }

        if (areaSource) {
            areaSource.textContent =
                "Check the Yangon Early Warning page for the latest information.";
        }
    }

    // ========================================
    // HEALTH CALENDAR
    // ========================================

    function showCalendar() {
        const calendar = getElement("calendar");

        if (!calendar) return;

        calendar.innerHTML = "";

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"
        ];

        const currentMonth = new Date().getMonth();

        const diseases = [
            {
                name: "Dengue",
                months: [4, 5, 6, 7, 8, 9]
            },
            {
                name: "Cholera",
                months: [5, 6, 7, 8, 9]
            },
            {
                name: "Malaria",
                months: [5, 6, 7, 8, 9, 10]
            },
            {
                name: "Influenza",
                months: [10, 11, 0, 1]
            },
            {
                name: "Measles",
                months: [0, 1, 2, 3]
            }
        ];

        // Empty corner before month headings
        calendar.appendChild(document.createElement("div"));

        // Month headings
        months.forEach(function (month, index) {
            const cell = document.createElement("div");

            cell.className = "month";

            if (index >= 2 && index <= 4) {
                cell.classList.add("hot");
            } else if (index >= 5 && index <= 9) {
                cell.classList.add("rainy");
            } else {
                cell.classList.add("cool");
            }

            if (index === currentMonth) {
                cell.classList.add("now");
            }

            cell.textContent = month;

            calendar.appendChild(cell);
        });

        // Disease rows
        diseases.forEach(function (disease) {
            const label = document.createElement("div");

            label.className = "row-label";
            label.textContent = disease.name;

            calendar.appendChild(label);

            months.forEach(function (month, index) {
                const cell = document.createElement("div");

                cell.className = "cell";

                if (disease.months.includes(index)) {
                    cell.classList.add("on");
                }

                if (index === currentMonth) {
                    cell.classList.add("now");
                }

                cell.title = disease.name + " - " + month;

                calendar.appendChild(cell);
            });
        });

        setText(
            "seasonNow",
            "Current month: " +
            months[currentMonth] +
            " " +
            new Date().getFullYear()
        );
    }

    // ========================================
    // PROTECTION CHECKLIST
    // ========================================

    const checklistItems = [
        "Wash your hands regularly with soap and clean water.",
        "Drink safe and properly treated water.",
        "Keep your surroundings clean and remove stagnant water.",
        "Use mosquito repellent when necessary.",
        "Cover your mouth and nose when coughing or sneezing.",
        "Stay informed through reliable health information."
    ];

    function showChecklist() {
        const list = getElement("checklist");

        if (!list) return;

        list.innerHTML = "";

        const email = getUserEmail() || "guest";
        const storageKey = "catalystChecklist_" + email;

        let saved = getSavedData(storageKey, []);

        if (!Array.isArray(saved)) {
            saved = [];
        }

        checklistItems.forEach(function (item, index) {
            const li = document.createElement("li");
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            const span = document.createElement("span");

            checkbox.type = "checkbox";
            checkbox.checked = saved.includes(index);

            span.textContent = item;

            checkbox.addEventListener("change", function () {
                if (checkbox.checked) {
                    if (!saved.includes(index)) {
                        saved.push(index);
                    }
                } else {
                    saved = saved.filter(function (number) {
                        return number !== index;
                    });
                }

                localStorage.setItem(
                    storageKey,
                    JSON.stringify(saved)
                );

                updateProgress();
            });

            label.appendChild(checkbox);
            label.appendChild(span);

            li.appendChild(label);
            list.appendChild(li);
        });

        updateProgress();

        function updateProgress() {
            const completed = saved.length;
            const total = checklistItems.length;
            const percentage = (completed / total) * 100;

            const progressBar = getElement("progressBar");

            if (progressBar) {
                progressBar.style.width = percentage + "%";
            }

            setText(
                "progressText",
                completed + " of " + total + " completed"
            );
        }
    }

    // ========================================
    // APPOINTMENTS
    // ========================================

    function showAppointments() {
        const list = getElement("appointmentList");

        if (!list) return;

        list.innerHTML = "";

        const appointments = getSavedData("catalystAppointments", []);

        const email = getUserEmail().toLowerCase();

        const myAppointments = appointments.filter(function (appointment) {
            return (
                appointment.email &&
                appointment.email.toLowerCase() === email
            );
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = myAppointments.filter(function (appointment) {
            const date = new Date(
                appointment.date || appointment.appointmentDate
            );

            return !isNaN(date.getTime()) && date >= today;
        });

        setText("statUpcoming", upcoming.length);
        setText("statAppointments", myAppointments.length);

        const noAppointments = getElement("noAppointments");

        if (noAppointments) {
            noAppointments.hidden = myAppointments.length > 0;
        }

        myAppointments.forEach(function (appointment) {
            const date = new Date(
                appointment.date || appointment.appointmentDate
            );

            if (isNaN(date.getTime())) return;

            const li = document.createElement("li");
            li.className = "appointment";

            const dateBox = document.createElement("div");
            dateBox.className = "appointment-date";

            const day = document.createElement("strong");
            day.textContent = date.getDate();

            const month = document.createElement("span");
            month.textContent = date.toLocaleDateString("en", {
                month: "short"
            });

            dateBox.appendChild(day);
            dateBox.appendChild(month);

            const details = document.createElement("div");

            const reason = document.createElement("span");
            reason.className = "reason";
            reason.textContent =
                appointment.reason ||
                appointment.service ||
                "Healthcare appointment";

            const when = document.createElement("span");
            when.className = "when";

            when.textContent = date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            details.appendChild(reason);
            details.appendChild(when);

            li.appendChild(dateBox);
            li.appendChild(details);

            list.appendChild(li);
        });
    }

    // ========================================
    // TIP OF THE DAY
    // ========================================

    function showTip() {
        const tips = [
            "Wash your hands with soap and clean water regularly.",
            "Drink safe water to help prevent waterborne diseases.",
            "Remove stagnant water around your home to reduce mosquito breeding.",
            "Cover your mouth and nose when coughing or sneezing.",
            "Do not take antibiotics without advice from a qualified healthcare professional.",
            "Keep up to date with recommended vaccinations.",
            "Seek medical advice if you experience serious or worsening symptoms."
        ];

        const day = Math.floor(
            Date.now() / (1000 * 60 * 60 * 24)
        );

        setText("tipText", tips[day % tips.length]);
    }

    // ========================================
    // TOWNSHIP OPTIONS
    // ========================================

    function fillTownshipOptions() {
        const select = getElement("editTownship");

        if (!select) return;

        select.innerHTML = "";

        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select your township";

        select.appendChild(defaultOption);

        const townships =
            typeof TOWNSHIP_NAMES !== "undefined"
                ? TOWNSHIP_NAMES
                : [];

        townships.forEach(function (township) {
            const option = document.createElement("option");

            option.value = township;
            option.textContent = township;

            select.appendChild(option);
        });

        select.value = user.township || user.area || "";
    }

    // ========================================
    // EDIT PASSPORT
    // ========================================

    const editBtn = getElement("editBtn");
    const editDialog = getElement("editDialog");
    const editForm = getElement("editForm");

    if (editBtn && editDialog) {
        editBtn.addEventListener("click", function () {
            const nameInput = getElement("editName");

            if (nameInput) {
                nameInput.value = getUserName();
            }

            fillTownshipOptions();

            editDialog.showModal();
        });
    }

    const cancelEdit = getElement("cancelEdit");

    if (cancelEdit && editDialog) {
        cancelEdit.addEventListener("click", function () {
            editDialog.close();
        });
    }

    if (editForm) {
        editForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const newName = getElement("editName").value.trim();
            const newTownship = getElement("editTownship").value;

            if (!newName) {
                alert("Please enter your name.");
                return;
            }

            const users = getSavedData("catalystUsers", []);
            const email = getUserEmail().toLowerCase();

            const userIndex = users.findIndex(function (account) {
                return (
                    account.email &&
                    account.email.toLowerCase() === email
                );
            });

            if (userIndex === -1) {
                alert("Your account could not be found.");
                return;
            }

            // Update the saved account
            users[userIndex].name = newName;
            users[userIndex].township = newTownship;

            localStorage.setItem(
                "catalystUsers",
                JSON.stringify(users)
            );

            // Update the current user
            user.name = newName;
            user.township = newTownship;

            localStorage.setItem(
                "catalystUser",
                JSON.stringify(user)
            );

            showProfile();
            showArea();
            updateAccountNavbar();

            editDialog.close();

            showMessage("Your passport has been updated.");
        });
    }

    // ========================================
    // DELETE ACCOUNT
    // ========================================

    const deleteBtn = getElement("deleteBtn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
            const confirmed = confirm(
                "Are you sure you want to delete your CATALYST account? This cannot be undone."
            );

            if (!confirmed) return;

            const users = getSavedData("catalystUsers", []);
            const email = getUserEmail().toLowerCase();

            const updatedUsers = users.filter(function (account) {
                return (
                    !account.email ||
                    account.email.toLowerCase() !== email
                );
            });

            localStorage.setItem(
                "catalystUsers",
                JSON.stringify(updatedUsers)
            );

            localStorage.removeItem("catalystUser");
            localStorage.removeItem(
                "catalystChecklist_" + getUserEmail()
            );

            if (typeof logout === "function") {
                logout();
            } else {
                window.location.href = "index.html";
            }
        });
    }

    // ========================================
    // START THE PAGE
    // ========================================

    showProfile();
    showArea();
    showCalendar();
    showChecklist();
    showAppointments();
    showTip();


});