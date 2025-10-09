// import css
import "./styles.css";

// variable declarations
const API_KEY = "A3H6XZ8XFWQCVMCY46XHXGB45";
const location = "Las Vegas";

// obtain elements from page
const searchInput = document.querySelector("#search-bar");
const searchButton = document.querySelector(".search-button");

// print to console based on search bar input
searchButton.addEventListener("click", async () => {
  // prevent search button from operating if a request is being processed
  if (searchButton.disabled) {
    return;
  }
  
  // disable button while a request is being made
  searchButton.disabled = true;


  try {
    // fetch weather data using value in search input 
    const location = searchInput.value;
    const weatherResponse = await fetchWeatherByLocation(location);
    const weatherData = await getWeatherDataFromResponse(weatherResponse);

    // print data object
    console.log(weatherData);

  } catch {
    console.log("Error!");
  } finally {
    // enable button when request is done
    searchButton.disabled = false;
  }

})

// request data from API using a location
async function fetchWeatherByLocation(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${API_KEY}`;
  const response = await fetch(url);
  return response;
}

// takes a response and returns the relevant project data
async function getWeatherDataFromResponse(response) {
  const json = await response.json();

  /* get general data:
    - resolved address
  */
 const addressData = json.resolvedAddress;

  /* get current forecast data:
    - temperature
    - description
    - high
    - low
    - icon
  */
 const todayData = {
    temp: json.days[0].temp,
    desc: json.days[0].description,
    high: json.days[0].tempmax,
    low:  json.days[0].tempmin,
    icon: json.days[0].icon
 };

  /* get 10 day forecast data (includes current day)
    - date
    - high 
    - low 
    - icon
  */
 const tenDayData = [];
 for (let i = 0; i < 10; i++) {
  const dayData = {
    date: json.days[i].datetime,
    high: json.days[i].tempmax,
    low:  json.days[i].tempmin,
    icon: json.days[i].icon
  };
  tenDayData.push(dayData);
 }

 const data = {
  address: addressData,
  today: todayData,
  tenDay: tenDayData
 };

  return data;
}