// import css
import "./css/fonts.css";
import "./css/normalize.css";
import "./css/reset.css";
import "./css/styles.css";

// variable declarations
const API_KEY = "A3H6XZ8XFWQCVMCY46XHXGB45";

const isFirstQuery = true; // used to update layout after first search

// obtain elements from page
const searchInput = document.querySelector("#search-bar");
const searchButton = document.querySelector(".search-button");
const todayContent = document.querySelector(".today-content");
const tenDayContent = document.querySelector(".ten-day-content");

// print to console based on search bar input
searchButton.addEventListener("click", async () => {
  // check if this is the initial page (i.e., first search query)
  if (isFirstQuery) {
    relocateSearchToHeader();
  }

  // prevent search button from operating if a request is being processed
  if (searchButton.disabled) {
    return;
  }

  // disable button while a request is being made
  searchButton.disabled = true;

  try {
    // fetch weather data using value in search input
    const location = searchInput.value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const weatherResponse = await fetchWeatherByLocation(location);
    const weatherData = await getWeatherDataFromResponse(weatherResponse);

    // update and show data on page
    showTempContent(weatherData);
  } catch {
    showError(searchInput.value);
  } finally {
    // enable button when request is done
    searchButton.disabled = false;
  }
});

// request data from API using a location
async function fetchWeatherByLocation(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${API_KEY}`;
  const response = await fetch(url);
  return response;
}

// takes a response and returns the relevant project data
async function getWeatherDataFromResponse(response) {
  const json = await response.json();

  /* get current forecast data:
    - resolved location  
    - temperature
    - description
    - high
    - low
    - icon
  */
  const todayData = {
    location: json.resolvedAddress,
    temp: Number(json.days[0].temp).toFixed(0),
    desc: json.days[0].conditions,
    high: Number(json.days[0].tempmax).toFixed(0),
    low: Number(json.days[0].tempmin).toFixed(0),
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
      high: Number(json.days[i].tempmax).toFixed(0),
      low: Number(json.days[i].tempmin).toFixed(0),
      icon: json.days[i].icon,
    };
    tenDayData.push(dayData);
  }

  const data = {
    today: todayData,
    tenDay: tenDayData,
  };

  return data;
}

// load an icon svg based on forecast icon name and returns an svg element
async function loadIconSvg(iconName) {
  const iconModule = await import(`./assets/icons/${iconName}.svg`);
  const iconRes = await fetch(iconModule.default);
  let iconSvgString = await iconRes.text();
  // replace styling class name to prevent icon styles from conflicting with each other

  // Replace classes in the CSS inside <style>
  iconSvgString = iconSvgString.replace(/\.cls-(\d+)/g, `.${iconName}-cls-$1`);
  // Replace class attributes on elements
  iconSvgString = iconSvgString.replace(
    /class="cls-(\d+)"/g,
    `class="${iconName}-cls-$1"`,
  );

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(iconSvgString, "image/svg+xml");
  const icon = svgDoc.querySelector("svg");
  return icon;
}

// update current forecast content on page
function updateTodayContent(data, parentElement) {
  // get child elements from parent element
  const location = parentElement.querySelector(".location");
  const temp = parentElement.querySelector(".temp");
  const desc = parentElement.querySelector(".description");
  const high = parentElement.querySelector(".high-temp");
  const low = parentElement.querySelector(".low-temp");

  // update child element data using forecast data
  location.textContent = data.location;
  temp.textContent = data.temp;
  desc.textContent = data.desc;
  high.textContent = `H:${data.high}°`;
  low.textContent = `L:${data.low}°`;
}

// update ten day forecast content on page
async function updateTenDayContent(data, parentElement) {
  // clear current ten day data
  parentElement.innerHTML = "";

  // loop through ten day data to create element
  for (let i = 0; i < data.length; i++) {
    // create wrapper
    const wrapper = document.createElement("li");
    wrapper.classList.add("day-content-wrapper");
    wrapper.classList.add(`day${i}`);

    // create elements
    const dayTitle = document.createElement("h4");
    dayTitle.classList.add("day-title");
    // title is different for current day, so check for current day
    if (i === 0) {
      dayTitle.textContent = "Today";
    } else {
      const dateObj = new Date(data[i].date);
      dayTitle.textContent = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
      });
    }
    wrapper.appendChild(dayTitle);

    const icon = await loadIconSvg(data[i].icon);
    icon.classList.add("day-icon");
    icon.classList.add(`${data[i].icon}`);
    wrapper.appendChild(icon);

    const lowTemp = document.createElement("p");
    lowTemp.classList.add("day-low-temp");
    lowTemp.textContent = `L:${data[i].low}°`;
    wrapper.appendChild(lowTemp);

    const highTemp = document.createElement("p");
    highTemp.classList.add("day-high-temp");
    highTemp.textContent = `H:${data[i].high}°`;
    wrapper.appendChild(highTemp);

    // append wrapper to parent element
    parentElement.appendChild(wrapper);
  }
}

// update content on page
async function updateContent(data, todayElement, tenDayElement) {
  updateTodayContent(data.today, todayElement);
  await updateTenDayContent(data.tenDay, tenDayElement);
}

// relocate search bar to header after initial query
function relocateSearchToHeader() {
  const header = document.querySelector(".main-header");
  const searchBarContainer = document.querySelector(".search-bar-wrapper");
  const searchTitle = document.querySelector(".search-bar-label");

  header.appendChild(searchBarContainer);
  searchBarContainer.classList.remove("in-main");
  searchTitle.classList.add("hidden");
}

// set visibility of main temp content element
function tempContentIsVisible(bool) {
  const todayContent = document.querySelector(".today-content");
  const tenDayContent = document.querySelector(".ten-day-content-wrapper");

  if (bool === true) {
    todayContent.classList.remove("hidden");
    tenDayContent.classList.remove("hidden");
  } else {
    todayContent.classList.add("hidden");
    tenDayContent.classList.add("hidden");
  }
}

// function to show the main temp content element
async function showTempContent(data) {
  hideMainContent();
  await updateContent(data, todayContent, tenDayContent);
  tempContentIsVisible(true);
}

// set visibility of error element
function errorIsVisible(bool) {
  const errorContent = document.querySelector(".error-content");

  if (bool === true) {
    errorContent.classList.remove("hidden");
  } else {
    errorContent.classList.add("hidden");
  }
}

// query message for error element
function updateErrorQuery(msg) {
  const errorQuery = document.querySelector(".error-query");
  errorQuery.textContent = msg;
}

// hide all children in main content wrapper: the idea being hide all
// all content and then show what's necessary
function hideMainContent() {
  const mainContent = document.querySelector(".main-content");
  const mainContentChildren = mainContent.children;

  for (const child of mainContentChildren) {
    child.classList.add("hidden");
  }
}

// function to show the error message
function showError(msg) {
  hideMainContent();
  updateErrorQuery(msg);
  errorIsVisible(true);
}
