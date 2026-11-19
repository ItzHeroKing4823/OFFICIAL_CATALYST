// The 33 townships of Yangon city (used by the sign up form and the account page)
const TOWNSHIP_NAMES = [
    "Ahlone", "Bahan", "Botahtaung", "Dagon", "Dagon Seikkan", "Dala", "Dawbon", "East Dagon",
    "Hlaing", "Hlaingthaya", "Insein", "Kamayut", "Kyauktada", "Kyimyindaing", "Lanmadaw", "Latha",
    "Mayangone", "Mingalar Taung Nyunt", "Mingaladon", "North Dagon", "North Okkalapa", "Pabedan",
    "Pazundaung", "Sanchaung", "Seikkan", "Seikkyi Kanaungto", "Shwepyitha", "South Dagon",
    "South Okkalapa", "Tamwe", "Thaketa", "Thingangyun", "Yankin"
];

// Closes the mobile menu (the menu itself is plain HTML + CSS: a hidden checkbox).
function closeMenu() {
    const toggle = document.getElementById("menuToggle");

    if (toggle != null) {
        toggle.checked = false;
    }
}

// ---------- Accounts (saved in this browser with localStorage) ----------

// Read a saved value. If it is missing or damaged, give back the fallback instead of crashing the page.
function readSaved(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value == null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function getCurrentUser() {
    return readSaved("catalystUser", null);
}

function getUsers() {
    return readSaved("catalystUsers", []);
}

// Make one HTML element with a class and some text
function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;
    return element;
}

// Make a Bootstrap Icons icon, for example makeIcon("bi-person")
function makeIcon(iconClass) {
    const icon = document.createElement("i");

    icon.className = "bi " + iconClass;
    icon.setAttribute("aria-hidden", "true");
    return icon;
}

function logout() {
    localStorage.removeItem("catalystUser");
    saveFlash("You have been logged out. See you again soon!", "info");
    window.location.href = "index.html";
}

// ---------- Short messages that stay on screen for a few seconds ----------

// Save a message so the next page can show it
function saveFlash(text, type) {
    sessionStorage.setItem("catalystFlash", JSON.stringify({ text: text, type: type }));
}

function showToast(text, type) {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.setAttribute("role", "status");

    let icon = "";
    switch (type) {
        case "success":
            icon = "\u2714 ";
            break;
        case "error":
            icon = "\u2716 ";
            break;
        default:
            icon = "\u2139 ";
    }
    toast.textContent = icon + text;
    document.body.appendChild(toast);

    // Click the message to close it. After that the click listener is removed.
    const closeToast = () => {
        toast.removeEventListener("click", closeToast);
        toast.remove();
    };
    toast.addEventListener("click", closeToast);
    setTimeout(closeToast, 6000);
}

function showFlash() {
    const saved = sessionStorage.getItem("catalystFlash");

    if (saved == null) {
        return;
    }
    const flash = JSON.parse(saved);
    sessionStorage.removeItem("catalystFlash");
    showToast(flash.text, flash.type);
}

// ---------- Header (shows the signed in person from localStorage) ----------

function fillAccountButtons(box, firstName) {
    box.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "account-dropdown";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "account-dropdown-toggle";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.appendChild(makeIcon("bi-person-circle"));
    toggle.appendChild(makeElement("span", "", "Hi, " + firstName));
    toggle.appendChild(makeElement("span", "dropdown-arrow", "\u25BE"));

    const menu = document.createElement("div");
    menu.className = "account-dropdown-menu";

    const profileLink = document.createElement("a");
    profileLink.href = "account.html";
    profileLink.appendChild(makeIcon("bi-person"));
    profileLink.appendChild(document.createTextNode("Profile"));
    menu.appendChild(profileLink);

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.appendChild(makeIcon("bi-box-arrow-right"));
    logoutButton.appendChild(document.createTextNode("Log Out"));
    logoutButton.addEventListener("click", logout);
    menu.appendChild(logoutButton);

    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);
    box.appendChild(wrapper);

    function setOpen(open) {
        wrapper.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => setOpen(!wrapper.classList.contains("open")));
    document.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
            setOpen(false);
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key == "Escape") {
            setOpen(false);
        }
    });
}

function showLoginState() {
    const user = getCurrentUser();

    if (user == null) {
        return;
    }

    const firstName = user.name.split(" ")[0];
    fillAccountButtons(document.getElementById("headerButtons"), firstName);
    fillAccountButtons(document.getElementById("mobileAuth"), firstName);

    const signInLinks = document.getElementsByClassName("signin-link");
    while (signInLinks.length > 0) {
        signInLinks[0].href = "account.html";
        signInLinks[0].textContent = "My Account";
        signInLinks[0].classList.remove("signin-link");
    }

    const signUpLinks = document.getElementsByClassName("signup-link");
    while (signUpLinks.length > 0) {
        const item = signUpLinks[0].parentElement;
        if (item.tagName == "LI") {
            item.remove();
        } else {
            signUpLinks[0].remove();
        }
    }
}

showLoginState();
showFlash();

// ---------- Scroll animation (AOS library, loaded in each page) ----------
if (typeof AOS != "undefined") {
    AOS.init({ duration: 700, once: true, offset: 60 });
}
