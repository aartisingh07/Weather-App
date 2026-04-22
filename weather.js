function showToast(message, type = "error", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
}

// ==========================
// Search History Load
// ==========================
window.onload = () => {
    loadHistory();
    document.getElementById("historySection").style.display = "block";
};

// ==========================
// Check City Input
// ==========================
function checkCity() {
    let citybox = document.getElementById("city");
    let city = citybox.value.trim();

    if (city === "") {
        showToast("City cannot be empty", "error");
        return;
    }

    fetchWeather(city);
}
// ==========================
// Fetch Weather By City
// ==========================
async function fetchWeather(city) {
    try {
        showToast("Fetching weather...", "info", 800);
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6ed570ac911dad2a255e2965a53ced74&units=metric`
        );
        let data = await response.json();

        if (data.cod != 200) {
            showToast("City not found", "error");
            return;
        }

        showWeather(data);
        saveHistory(city);

    } catch (error) {
        showToast("Network Error", "error");
    }
}
// ==========================
// Show Weather
// ==========================
function showWeather(data) {
    let weatherbox = document.getElementById("weather");

    let { name, sys, main, weather, wind } = data;

    weatherbox.innerHTML = `
        <h2>${name}, ${sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" class="weather-icon">
        <p>🌡 Temperature: ${main.temp}°C</p>
        <p>💧 Humidity: ${main.humidity}%</p>
        <p>🌬 Wind: ${wind.speed} m/s</p>
        <p>☁ Weather: ${weather[0].description}</p>
    `;
    document.getElementById("historySection").style.display = "none";
    changeBackground(weather[0].main, weather[0].icon);
}

// ==========================
// Enter Key Search
// ==========================
document.getElementById("city").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        checkCity();
    }
});

// ==========================
// Current Location Weather
// ==========================
function getLocationWeather() {
    if (!navigator.geolocation) {
        showToast("Geolocation not supported", "error");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        try {
            showToast("Fetching your location weather...", "info");

            let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=6ed570ac911dad2a255e2965a53ced74&units=metric`
            );

            let data = await response.json();

            showWeather(data);
            saveHistory(data.name);

        } catch (error) {
            showToast("Location weather failed", "error");
        }

    }, () => {
        showToast("Location access denied", "error");
    });
}

function clearWeather() {
    document.getElementById("city").value = "";
    document.getElementById("weather").innerHTML = "";

    document.getElementById("historySection").style.display = "block";

    showToast("Cleared", "success", 1000);
    document.body.style.background = "linear-gradient(135deg, #7a4bff, #9f56ff)";
}

// ==========================
// Search History
// ==========================
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    if (!history.includes(city)) {
        history.unshift(city);
    }

    history = history.slice(0, 5);

    localStorage.setItem("weatherHistory", JSON.stringify(history));

    loadHistory();
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    let historyBox = document.getElementById("history");

    historyBox.innerHTML = "";

    history.forEach(city => {
        historyBox.innerHTML += `
            <button onclick="fetchWeather('${city}')" class="history-btn">
                ${city}
            </button>
        `;
    });
}

function clearHistory() {
    localStorage.removeItem("weatherHistory");

    document.getElementById("history").innerHTML = "";

    showToast("Search history cleared", "success", 1200);
}

function changeBackground(condition, icon) {

    let body = document.body;

    // Night check (icons ending with n)
    let isNight = icon.includes("n");

    if (isNight) {
        body.style.background = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
        return;
    }

    switch(condition.toLowerCase()) {

        case "clear":
            body.style.background =
            "linear-gradient(135deg, #56ccf2, #2f80ed)";
            break;

        case "clouds":
            body.style.background =
            "linear-gradient(135deg, #bdc3c7, #2c3e50)";
            break;

        case "rain":
        case "drizzle":
            body.style.background =
            "linear-gradient(135deg, #373b44, #4286f4)";
            break;

        case "thunderstorm":
            body.style.background =
            "linear-gradient(135deg, #232526, #414345)";
            break;

        case "mist":
        case "haze":
        case "fog":
            body.style.background =
            "linear-gradient(135deg, #757f9a, #d7dde8)";
            break;

        case "snow":
            body.style.background =
            "linear-gradient(135deg, #e6dada, #274046)";
            break;

        default:
            body.style.background =
            "linear-gradient(135deg, #7a4bff, #9f56ff)";
    }
}

function startVoiceSearch() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        showToast("Voice search not supported", "error");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    showToast("Listening...", "info", 1500);

    recognition.onresult = function(event) {

        const city = event.results[0][0].transcript;

        document.getElementById("city").value = city;

        showToast(`Searching ${city}`, "success", 1200);

        fetchWeather(city);
    };

    recognition.onerror = function() {
        showToast("Voice search failed", "error");
    };
}