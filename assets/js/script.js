// Set global variables
var cityList = [];
var myKey = "9e5577df40e0e01c873e9e3a38ab4d5a";

// create function to store search results in localStorage
function cityStorage() {
  localStorage.setItem("cities", JSON.stringify(cityList));
}

// create function to add latest user search to list
function createLiEl() {
  $(".cityList").empty();
  cityList.forEach(function (city) {
    $(".cityList").prepend(
      $(
        `<button class="list-group-item list-group-item-action cityButton" data-city="${city}">${city}</button>`
      )
    );
  });
}

// create function to load list and call API on click event
function loadLi() {
  var citiesStored = JSON.parse(localStorage.getItem("cities"));

  if (citiesStored !== null) {
    cityList = citiesStored;
  }

  createLiEl();

  if (cityList) {
    var searchedCity = cityList[cityList.length - 1];
    getWeather(searchedCity, myKey);
    getCurrentForecast(searchedCity, myKey);
  }
}

// create function for API call for weather data (ex. UV index etc.)
function getWeather(searchedCity, myKey) {
  var apiCityURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&units=metric&appid=${myKey}`;
  var longitude;
  var latitude;

  $.ajax({
    url: apiCityURL,
    method: "GET",
  }).then(function (data) {
    $(".currentCity").append(
      `<div class="row ml-1">
                <h3 class="mr-3">${data.name} (${
        new Date(1000 * data.dt).getUTCDate() - 1
      }/${new Date(1000 * data.dt).getUTCMonth() + 1}/${new Date(
        1000 * data.dt
      ).getUTCFullYear()})</h3>
            </div>`
    );
    $(".currentCity").append(`<p>Wind: ${data.wind.speed} Kph</p>`);
    $(".currentCity").append(`<p>Humidity: ${data.main.humidity} %</p>`);
    $(".currentCity").append(`<p>Temperature: ${data.main.temp} &degC</p>`);
    longitude = data.coord.lon;
    latitude = data.coord.lat;
    getUVIndex(myKey, longitude, latitude);
  });
}

// function to get the UV index info from the API
function getUVIndex(myKey, longitude, latitude) {
  var apiUvURL = `https://api.openweathermap.org/data/2.5/uvi?lon=${longitude}&lat=${latitude}&appid=${myKey}`;

  $.ajax({
    url: apiUvURL,
    method: "GET",
  }).then(function (data) {
    $(".currentCity").append(
      `<p>UV Index: <span class="badge bg-primary rounded pill p-2">${data.value}</span></p>`
    );
  });
}

// function for the forecast
function getCurrentForecast(searchedCity, myKey) {
  var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&units=metric&appid=${myKey}`;

  $.ajax({
    url: forecastURL,
    method: "GET",
  }).then(function (data) {
    for (index = 0; index < data.list.length; index++) {
      if (data.list[index].dt_txt.search("18:00:00") != -1) {
        var forecastDay = data.list[index];
        $(".forecast").append(
          `<div class="card bg-light shadow m-4">
                        <div class="card-body">
                            <h4 class="card-title">${new Date(
                              1000 * forecastDay.dt
                            ).getUTCDate()}/${
            new Date(1000 * forecastDay.dt).getUTCMonth() + 1
          }/${new Date(1000 * forecastDay.dt).getUTCFullYear()}</h4>
                            <div class="card-text">
                                <img src="http://openweathermap.org/img/w/${
                                  forecastDay.weather[0].icon
                                }.png">
                                <p class="card-text">Temp: ${
                                  forecastDay.main.temp
                                } &degC</p>
                                <p class="card-text">Humidity: ${
                                  forecastDay.main.humidity
                                } %</p>
                            </div>
                        </div>
                    </div>`
        );
      }
    }
  });
}

// function that calls forecast and current weather
function displayWeather() {
  var searchedCity = $(this).attr("data-city");

  $(".currentCity").empty();
  getWeather(searchedCity, myKey);

  $(".forecast").empty();
  getCurrentForecast(searchedCity, myKey);
}

// loads city list when page is first loaded
loadLi();

// Search input functionality
$("form").on("submit", function (event) {
  event.preventDefault();
  var city = $("#searchCity").val().trim();
  cityList.push(city);
  createLiEl();
  loadLi();
  $("#searchCity").val("");
});

$(".cityList").on("click", ".cityButton", displayWeather);
