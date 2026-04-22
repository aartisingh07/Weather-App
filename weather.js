function showToast(message, type = "error", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add("show"), 50);

    // auto remove
    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
}

let checkCity = () => {
    let citybox = document.getElementById("city");
    let city = citybox.value.trim();

    if(city === ""){
        showToast("City cannot be empty", "error");
        return;
    }
    fetchWeather(city);
}

let fetchWeather = async (city) => {
    try {
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=6ed570ac911dad2a255e2965a53ced74&units=metric`
        );
        let data = await response.json();

        // ❌ Invalid city → only error toast
        if (data.cod !== 200) {
            showToast("City not found", "error");
            return;
        }
        // ✅ Valid city → now show fetching toast
        showToast("Fetching weather...", "info", 500);

        // ⏳ Delay UI render
        setTimeout(() => {
            showWeather(data);
        }, 500);

    } catch (error) {
        showToast("Network error", "error");
    }
};

let showWeather = (data)=>{
    console.log(data);
    let weatherbox = document.getElementById("weather");

    let {name, sys, main, weather, wind} = data;

    weatherbox.innerHTML = `<h2>Weather in ${name}, ${sys.country}</h2>
        <p>Temperature: ${main.temp}°C</p>
        <p>Weather: ${weather[0].description}</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
        <img src="https://openweathermap.org/img/wn/${weather[0].icon}.png" class="weather-icon" alt="Weather Icon">`;
}

document.getElementById("city").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        checkCity();
    }
});