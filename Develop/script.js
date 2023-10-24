const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const weatherCardsDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const cityInput = document.querySelector('.city-input');


// API Key for OpenWeatherMap
const API_KEY = "4ffa9db12ba1b0f6a2b585b0eeb1cb2f"

function metersPerSecondToMilesPerHour(mps) {
    return (mps * 2.23694).toFixed(2);
}

const createWeatherCard = (cityName, weatherItem, index, unit = "C") => {
    // Convert wind speed from M/S to MPH
    const windSpeed = unit === "F" ? metersPerSecondToMilesPerHour(weatherItem.wind.speed) : weatherItem.wind.speed;

    // Converts Celsius API into Farenheit
    let temperature;
    if (unit === "C") {
        temperature = (weatherItem.main.temp - 273.15).toFixed(2) + " °C";
    } else if (unit === "F") {
        temperature = (((weatherItem.main.temp - 273.15) * 9/5) + 32).toFixed(2) + " °F";
    }

    if(index === 0) { // HTML for the main weather card
    return `<div class="details">
                <h2>${cityName}  (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h4>Temperature: ${temperature}</h4>
                <h4>Wind: ${windSpeed} ${unit === "F" ? "MPH" : "M/S"}</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else { // HTML for the other five day forecast card
    return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${temperature}</h4>
                <h4>Wind: ${windSpeed} ${unit === "F" ? "MPH" : "M/S"}</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
        }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json()) //parse the response as JSON
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if(!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });


            // Clearing previous weather data  
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Creating weather cards and adding them to the DOM 
            fiveDaysForecast.forEach((weatherItem, index) => {
                if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, "F"));
                } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, "F"));
                }
            });

        }).catch(() => {
            // Handle errors by displaying an alert message
            alert("An error occured while fetching the weather forecast!");
        });

}

const getCityCoordinates = () => {
    // removes the extra spacing when user inputs the city name
    const cityName = cityInput.value.trim(); 
    // return if cityName is empty
    if(!cityName) {
        alert("Please enter a valid city name.")
    return;
    }


    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        // Once response is received, parse it as JSON and return the parsed data as a resolved promise
        if(!data.length) return alert (`no coordinates found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon); 
        // Catch method to catch and handle errors that may occur in the Promise chain.
    }).catch(() => {
        // Handle errors by displaying an alert message
        alert("An error occured while fetching the coordinates!");
    });

}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; 
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            //  Get city name from coordiates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name, lat, lon } = data[0];
                getWeatherDetails( name, latitude, longitude ); 
            }).catch(() => {
                alert("An error occured while fetching the city!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {

            }

        }
    );
}


locationBtn.addEventListener("click", getUserCoordinates);
searchBtn.addEventListener("click", getCityCoordinates);
// When user types the city name in the input
// they can press enter on they keyboard and it will trigger the search without having to press the search button
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());