const searchBtn = document.querySelector('.search-btn');
const weatherCardsDiv = document.querySelector('.weather-cards');
const cityInput = document.querySelector('.city-input');


// API Key for OpenWeatherMap
const API_KEY = "4ffa9db12ba1b0f6a2b585b0eeb1cb2f"

const createWeatherCard = (weatherItem) => {
    return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
 
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

            console.log(fiveDaysForecast);
            fiveDaysForecast.forEach(weatherItem => {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
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
    if(!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    



    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(GEOCODING_API_URL)
    // Below is a promise chain
    .then(res => res.json()) //parse the response as JSON
    .then(data => {
        // Once response is received, parse it as JSON and return the parsed data as a resolved promise
        if(!data.length) return alert (`no coordaintes found for ${cityName}`);
        const { name, lat, lon } = data[0];
        getWeatherDetails( name, lat, lon ); 

        

        // Catch method to catch and handle errors that may occur in the Promise chain.
    }).catch(() => {
        // Handle errors by displaying an alert message
        alert("An error occured while fetching the coordinates!");
    });

}

searchBtn.addEventListener('click', getCityCoordinates);