// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = "bc8d9b5333658420b9e7ceb6c6395570"; // Replace with your actual API key
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?";
    let currentUnit = 'C';

    // Automatically get user's location when page loads
    getLocation();

    // Add event listeners
    document.getElementById("getWeather").addEventListener("click", () => {
        const city = document.getElementById("cityInput").value;
        if (city) {
            fetchWeatherByCity(city);
        }
    });

    // Add enter key support
    document.getElementById("cityInput").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const city = document.getElementById("cityInput").value;
            if (city) {
                fetchWeatherByCity(city);
            }
        }
    });

    document.getElementById("toggleUnit").addEventListener("click", toggleUnit);

    // Geolocation feature
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherByCoords(lat, lon);
                },
                (error) => {
                    // If geolocation fails, default to a city or show error
                    showError("Unable to get your location. Please enter a city manually.");
                    document.getElementById("weatherInfo").classList.add("hidden");
                }
            );
        } else {
            showError("Geolocation is not supported by your browser. Please enter a city manually.");
        }
    }

    // Fetch weather by city name
    function fetchWeatherByCity(city) {
        const url = `${apiUrl}q=${city}&appid=${apiKey}&units=metric`;
        fetchWeather(url);
    }

    // Fetch weather by coordinates
    function fetchWeatherByCoords(lat, lon) {
        const url = `${apiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        fetchWeather(url);
    }

    // Main fetch function
    async function fetchWeather(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok) {
                displayWeatherData(data);
                displayWeatherDetails(data);
                document.getElementById("weatherInfo").classList.remove("hidden");
                document.getElementById("errorMessage").classList.add("hidden");
            } else {
                showError(data.message);
            }
        } catch (error) {
            showError("Failed to fetch weather data. Please try again.");
        }
    }

    function displayWeatherData(data) {
        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("condition").textContent = data.weather[0].main;
        
        // Use the icon directly from the API response
        const iconCode = data.weather[0].icon;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    function displayWeatherDetails(data) {
        // Calculate dew point
        const T = data.main.temp;
        const RH = data.main.humidity;
        const a = 17.27;
        const b = 237.7;
        
        const alpha = ((a * T) / (b + T)) + Math.log(RH/100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        // Update all highlights
        document.getElementById("dewPoint").textContent = `${Math.round(dewPoint)}°C`;
        document.getElementById("windSpeed").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        document.getElementById("uvIndex").textContent = "N/A";
    }

    function showError(message) {
        const errorDiv = document.getElementById("errorMessage");
        errorDiv.textContent = message;
        errorDiv.classList.remove("hidden");
        document.getElementById("weatherInfo").classList.add("hidden");
    }

    function toggleUnit() {
        const tempElement = document.getElementById("temperature");
        const currentTemp = tempElement.textContent.match(/\d+/)[0];
        const button = document.getElementById("toggleUnit");
        
        if (currentUnit === 'C') {
            const fahrenheit = Math.round((currentTemp * 9/5) + 32);
            tempElement.textContent = `${fahrenheit}°F`;
            button.textContent = "Switch to °C";
            currentUnit = 'F';
        } else {
            const celsius = Math.round((currentTemp - 32) * 5/9);
            tempElement.textContent = `${celsius}°C`;
            button.textContent = "Switch to °F";
            currentUnit = 'C';
        }
    }

    function getCustomWeatherIcon(weatherCondition) {
        // Use OpenWeatherMap icons instead of emoji characters
        const iconMap = {
            'Clear': '01d',
            'Clouds': '03d',
            'Rain': '10d',
            'Snow': '13d',
            'Thunderstorm': '11d',
            'Drizzle': '09d',
            'Mist': '50d',
            'Smoke': '50d',
            'Haze': '50d',
            'Dust': '50d',
            'Fog': '50d'
        };
        
        const iconCode = iconMap[weatherCondition] || '01d';
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Add geolocation button listener if it exists
    const locationButton = document.getElementById("getLocation");
    if (locationButton) {
        locationButton.addEventListener("click", getLocation);
    }
});