const apiKey = "11ca61ac293ec43fc42cce70972c933a";
let searchHistory = [];

const translations = {
  en: {
    feelsLike: "Feels like",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    pressure: "Pressure",
    sunrise: "Sunrise",
    sunset: "Sunset",
    loading: "Loading...",
    locationError: "Geolocation is not supported by this browser.",
    searchHistory: "Search History",
    forecastTitle: "7-Day Forecast",
    pleaseEnterCity: "Please enter a city name.",
    search: "Search",
    enterCity: "Enter city name",
    forecast: "7-Day Forecast",
    time: "12:00 PM",
    description: "Condition"
  },
  tl: {
    feelsLike: "Ramdam na parang",
    humidity: "Halumigmig",
    windSpeed: "Bilis ng hangin",
    pressure: "Presyon",
    sunrise: "Pagsikat ng araw",
    sunset: "Paglubog ng araw",
    loading: "Naglo-load...",
    locationError: "Hindi suportado ng browser ang geolocation.",
    searchHistory: "Kasaysayan ng Paghahanap",
    forecastTitle: "7-Araw na Taya ng Panahon",
    pleaseEnterCity: "Mangyaring maglagay ng pangalan ng lungsod.",
    search: "Maghanap",
    enterCity: "Ilagay ang pangalan ng lungsod",
    forecast: "7-Araw na Taya ng Panahon",
    time: "12:00 PM",
    description: "Kondisyon"
  }
};

const languageSelector = document.getElementById("languageSelector");
let currentLang = localStorage.getItem("lang") || (navigator.language.startsWith("tl") ? "tl" : "en");
languageSelector.value = currentLang;

function applyTranslations() {
  document.getElementById("cityInput").placeholder = translations[currentLang].enterCity;
  document.getElementById("searchButton").textContent = translations[currentLang].search;

  const forecastHeader = document.querySelector("#forecastBox h3");
  if (forecastHeader) {
    forecastHeader.textContent = translations[currentLang].forecastTitle;
  }

  renderHistory();
}

languageSelector.addEventListener("change", () => {
  currentLang = languageSelector.value;
  localStorage.setItem("lang", currentLang);
  applyTranslations();
  const city = document.getElementById("cityInput").value.trim();
  if (city) fetchWeatherByCity(city);
});

window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.add(savedTheme);
  document.getElementById("toggleMode").textContent = savedTheme === "light" ? "☀️" : "🌙";
  document.getElementById("cityInput").focus();

  applyTranslations();

  const storedHistory = localStorage.getItem("weatherHistory");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
    renderHistory();
    getWeatherByCity(searchHistory[0]);
  }

  resizeCanvas();
  animateStars();
};

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert(translations[currentLang].pleaseEnterCity);
  fetchWeatherByCity(city);
}

function fetchWeatherByCity(city) {
  const weatherBox = document.getElementById("weatherResult");
  weatherBox.innerHTML = `<p>${translations[currentLang].loading}</p>`;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      updateSearchHistory(data.name);
      fetchForecast(data.name);
    })
    .catch(err => {
      weatherBox.innerHTML = `<p style="color:red;">${err.message}</p>`;
      document.getElementById("forecastBox").innerHTML = "";
    });
}

function displayWeather(data) {
  const weatherBox = document.getElementById("weatherResult");
  const { temp, feels_like, humidity, pressure } = data.main;
  const { speed } = data.wind;
  const { description } = data.weather[0];
  const { sunrise, sunset } = data.sys;

  weatherBox.innerHTML = `
    <p><strong>🌡️ ${temp}°C</strong> (${description})</p>
    <p>🤒 ${translations[currentLang].feelsLike}: ${feels_like}°C</p>
    <p>💧 ${translations[currentLang].humidity}: ${humidity}%</p>
    <p>🌬️ ${translations[currentLang].windSpeed}: ${speed} m/s</p>
    <p>🔽 ${translations[currentLang].pressure}: ${pressure} hPa</p>
    <p>🌅 ${translations[currentLang].sunrise}: ${new Date(sunrise * 1000).toLocaleTimeString()}</p>
    <p>🌇 ${translations[currentLang].sunset}: ${new Date(sunset * 1000).toLocaleTimeString()}</p>
  `;

  updateWeatherAnimation(description);
}

function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Forecast not found.");
      return res.json();
    })
    .then(displayForecast)
    .catch(err => {
      document.getElementById("forecastBox").innerHTML = `<p style="color:red;">${err.message}</p>`;
    });
}

function displayForecast(data) {
  const forecastBox = document.getElementById("forecastBox");
  const grouped = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  let html = `<h3>${translations[currentLang].forecast}:</h3><div class='forecast-container'>`;
  let count = 0;

  for (const date in grouped) {
    const entry = grouped[date].find(i => i.dt_txt.includes("12:00:00")) || grouped[date][0];
    const { temp } = entry.main;
    const { icon, description } = entry.weather[0];

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    html += `
      <div class="forecast-card">
        <p class="day"><strong>${formattedDate}</strong></p>
        <p class="time">${translations[currentLang].time}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p class="desc">${translations[currentLang].description}: ${description}</p>
      </div>
    `;

    if (++count >= 7) break;
  }

  html += "</div>";
  forecastBox.innerHTML = html;
}

function updateSearchHistory(city) {
  const lower = city.toLowerCase();
  if (!searchHistory.includes(lower)) {
    searchHistory.unshift(lower);
    if (searchHistory.length > 5) searchHistory.pop();
    localStorage.setItem("weatherHistory", JSON.stringify(searchHistory));
    renderHistory();
  }
}

function renderHistory() {
  const historyBox = document.getElementById("historyBox");
  historyBox.innerHTML = `<h3>${translations[currentLang].searchHistory}:</h3>` +
    searchHistory.map(city => `<button onclick="fetchWeatherByCity('${city}')">${city}</button>`).join(" ");
}

function getCurrentLocation() {
  if (!navigator.geolocation) return alert(translations[currentLang].locationError);

  document.getElementById("weatherResult").innerHTML = `<p>${translations[currentLang].loading}</p>`;

  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    err => {
      document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  );
}

function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      displayWeather(data);
      updateSearchHistory(data.name);
      fetchForecast(data.name);
    })
    .catch(err => {
      document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${err.message}</p>`;
    });
}

function toggleMode() {
  const body = document.body;
  const btn = document.getElementById("toggleMode");

  if (body.classList.contains("dark-mode")) {
    body.classList.replace("dark-mode", "light-mode");
    btn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.replace("light-mode", "dark-mode");
    btn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
}

// Canvas star animation
const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");
let stars = [];

function initStars(count = 300) {
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.5 + 0.2
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  for (const star of stars) {
    ctx.beginPath();
    ctx.globalAlpha = Math.random();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
  ctx.globalAlpha = 1;
}

function animateStars() {
  drawStars();
  requestAnimationFrame(animateStars);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}
window.addEventListener("resize", resizeCanvas);

function updateWeatherAnimation(description) {
  const animation = document.getElementById("weatherAnimation");
  if (!animation) return;

  let src = "https://assets9.lottiefiles.com/packages/lf20_jmgekqub.json"; // default

  description = description.toLowerCase();
  if (description.includes("cloud")) src = "https://assets9.lottiefiles.com/private_files/lf30_tQ6d3W.json";
  else if (description.includes("rain")) src = "https://assets2.lottiefiles.com/packages/lf20_jmgekfqg.json";
  else if (description.includes("clear")) src = "https://assets9.lottiefiles.com/private_files/lf30_jmgekfqg.json";
  else if (description.includes("storm")) src = "https://assets10.lottiefiles.com/private_files/lf30_eqvshlcs.json";
  else if (description.includes("snow")) src = "https://assets10.lottiefiles.com/private_files/lf30_hw3qfdrd.json";

  animation.setAttribute("src", src);
}
