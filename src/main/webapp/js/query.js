// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* ==========================================================================
   RESTAURANT QUERY AND RE-ROLL
   ========================================================================== */
function query(queryStr) {
    const errorEl = document.getElementById("error");
    fetch(`/query?${queryStr}`, { method: "POST" })
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            if (response.status === "OK")
                redirectToUrl('results.html');
            else if (response.status === "INVALID_REQUEST") throw "Invalid request";
            else if (response.status === "ZERO_RESULTS") throw "No results";
            else if (response.status === "NO_REROLLS") throw "No re-rolls left";
            else throw "Unforeseen error";
        })
        .catch((error) => {
            errorEl.classList.remove("success-banner");
            errorEl.classList.remove("hidden");
            errorEl.classList.add("error-banner");
            errorEl.innerText = error;
        });
}

function roll() {
    const pickEl = document.getElementById("pick");
    const ratingEl = document.getElementById("rating");
    fetch(`/query`, { method: "GET" })
        .then((response) => response.json())
        .then((response) => {
            if (response.status === "OK") {
                pickEl.innerText = response.pick.name;
                ratingEl.innerText = response.pick.rating + ' ★';
                let photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=' + response.pick.photos[0].photoReference + '&key=AIzaSyBL_9GfCUu7DGDvHdtlM8CaAywE2bVFVJc';
                localStorage.setItem("restaurantAddress", response.pick.vicinity);
                loadImage(photoUrl);
                calculateAndDisplayRoute(directionsService, directionsRenderer);
            } else if (response.status === "INVALID_REQUEST") throw "Invalid request";
            else if (response.status === "ZERO_RESULTS") throw "No results";
            else if (response.status === "NO_REROLLS") throw "No re-rolls left";
            else throw "Unforeseen error";
        })
        .catch((error) => { pickEl.innerText = error; });
}

//Retrieve and display restaurant image
function loadImage(photoUrl) {
    let photoEl = document.getElementById("photo");
    photoEl.innerHTML = "";

    let img = document.createElement('img');
    img.src = photoUrl;
    photoEl.appendChild(img);
}

/* ==========================================================================
   USER LOCATION AND ADDRESS
   ========================================================================== */
function getLocation() {
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(geoLocEnabled, geoLocFallback);
    else
        geoLocFallback();
}

// Geolocation is supported and enabled
function geoLocEnabled(position) {
    let locationEl = document.getElementById("location-container");
    let pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
    };
    localStorage.setItem("lat", pos.lat);
    localStorage.setItem("lng", pos.lng);
    convertLocation(pos).then((address) => { locationEl.innerText = address; });
}

// Use inaccurate IP-based geolocation instead
function geoLocFallback() {
    let locationEl = document.getElementById("location-container");
    $.ajax({
        type: "POST",
        url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=' + 'AIzaSyBL_9GfCUu7DGDvHdtlM8CaAywE2bVFVJc', // TODO: use safe API key storage!!!
        data: { considerIp: 'true' },
        success: function(response) {
            let pos = {
                lat: response.location.lat,
                lng: response.location.lng,
            };
            localStorage.setItem("lat", pos.lat);
            localStorage.setItem("lng", pos.lng);
            convertLocation(pos).then((address) => { locationEl.innerText = address; });
        },
        error: function(xhr) {
            if (xhr.status == 404)
                console.log("No results");
            if (xhr.status == 403)
                console.log("Usage limits exceeded");
            if (xhr.status == 400)
                console.log("API key is invalid or JSON parsing error");
            geoLocHardcoded(); // DEBUG
        }
    });
}

// TODO: remove this entirely; fallback should be to leave form blank instead
function geoLocHardcoded() {
    let locationEl = document.getElementById("location-container");
    let pos = { lat: 40.730610, lng: -73.935242 };
    localStorage.setItem("lat", pos.lat);
    localStorage.setItem("lng", pos.lng);
    convertLocation(pos).then((address) => {
        locationEl.innerText = address;
    });
}

// Convert lat/lng to human readable address
function convertLocation(location) {
    let lat = location.lat;
    let long = location.lng;
    return fetch(`/convert?lat=${lat}&lng=${long}`)
        .then((response) => response.json())
        .then((response) => { return response.results[0].formatted_address; })
        .catch((error) => console.log(error));
}

/* ==========================================================================
   USER SIGN-IN
   ========================================================================== */
function onSignIn(googleUser) {
    let id_token = googleUser.getAuthResponse().id_token;
    let profile = googleUser.getBasicProfile();
    fetch(`/login?id_token=${id_token}`)
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem("user", data.sub);
            localStorage.setItem("loggedIn", true);
            addUserContent(profile.getName(), profile.getImageUrl());
            toggleAccountMenu();
        }).catch((error) => {
            console.log(error);
        });
}

//Add user information to signed in UI
function addUserContent(name, image) {
    document.getElementById("user-name").innerText = name;
    document.getElementById("profile-pic").src = image;
}

//Replaces the sign-in button with signed in UI
function toggleAccountMenu() {
    document.getElementById("account-menu").classList.toggle("show");
    document.getElementById("sign-in").classList.toggle("hide");
}

//Logs out of the account
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  localStorage.setItem("user", 0);
  toggleAccountMenu();
}

function backToHome() {
    window.location.replace("index.html");
}

function toAccount() {
    window.location.replace("account-info.html");
}

function toSearches() {
    window.location.replace("past-searches.html");
}

function toggleShow() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdown = document.getElementById("myDropdown");
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
  }
}

/*
    FUNCTIONS RELATED TO THE ACCOUNTS PAGE
*/

function accountFunctions() {
    getNumSearches();
    getLastVisited();
    getFavFood();
    getNumReviews();
}

function getNumSearches() {
    let count = 0;
    let numSearchesEl = document.getElementById('num-searches');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        searches.forEach((search) => {
            count += 1;
        });
    });
    numSearchesEl.innerText = count;
}

function getLastVisited() {
    let lastVisitedEl = document.getElementById('last-visited');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        lastVisitedEl.innerText = searches[0].name()});
}

function getFavFood() {
    let food = document.getElementById('fav-food');
    fetch(`/fav-food?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((foods) => {
        if (foods[0].length == 0) {
            food.appendChild('<textarea id="food-selection" placeholder="or foods :)"></textarea>');
        } else {
            food.innerText = foods[0];
        }
    });
}

function getNumReviews() {
    let count = 0;
    let numFeedbackEl = document.getElementById('num-feedback');
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/feedback?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((feedbackList) => {
        feedbackList.forEach((feedback) => {
            count += 1;
        });
    });
    numFeedbackEl.innerText = count;
}

/* ==========================================================================
   RETRIEVING SEARCHES
   ========================================================================== */
//Retrieve searches associated with the current user
function getSearches(){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then((searches) => {
        let searchesEl = document.getElementById('cards');
        searches.forEach((search) => {
            let searchCard = createSearchElement(search);
            searchesEl.appendChild(searchCard);
        });
    });
}

function createSearchElement(search) {
    const newCardEl = document.createElement('div');
    newCardEl.className = 'card card-2';
    const newCardBody = document.createElement('div');
    newCardBody.className = 'card-body';
    //creating the restaurant name element
    const nameElement = document.createElement('p2');
    nameElement.id = 'restaurant-name';
    nameElement.innerText = search.name;
    newCardBody.appendChild(nameElement);
    newCardBody.appendChild(document.createElement('br'));

    //creating the list of parameters
    const paramElement = document.createElement('p3');
    const tempParamElement = "Parameters: " + search.keywords;

    // tempParamElement += radius;
    paramElement.innerText = tempParamElement;
    newCardBody.appendChild(paramElement);

    newCardBody.appendChild(document.createElement('br'));

    //creating the feedback element
    const feedbackElement = document.createElement('p3');

    (async () => {
        let updatedFeedbackElements = await getFeedback(search);
        tempFeedbackElement = updatedFeedbackElements[0];
        buttons = updatedFeedbackElements[1];

        feedbackElement.innerText = tempFeedbackElement;
        feedbackElement.innerText = tempFeedbackElement;
        newCardBody.appendChild(feedbackElement);
        newCardBody.appendChild(document.createElement('br'));
        newCardBodyWithButtons = createSearchesButtons(search, buttons, newCardBody);
        newCardEl.appendChild(newCardBodyWithButtons);
    })()

    return newCardEl;
}

function createSearchesButtons(search, buttons, newCardBody) {
    let feedbackButton = null;
    let formEl = document.getElementById('searches-form');
    if (buttons) {
        let modal = document.getElementById('searchModal');
        let span = document.getElementsByClassName("close")[0];
        span.onclick = function() {
            let restaurantContainerEl = document.getElementById("restaurant-name-container");
            restaurantContainerEl.remove();
            let submitButtonEl = document.getElementById("submit-button");
            if (submitButtonEl != null) {
                submitButtonEl.remove();
            }
            modal.style.display = "none";
        }
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                let restaurantContainerEl = document.getElementById("restaurant-name-container");
                restaurantContainerEl.remove();
                let submitButtonEl = document.getElementById("submit-button");
                if (submitButtonEl != null) {
                    submitButtonEl.remove();
                }
                modal.style.display = "none";
            }
        }
        feedbackButton = document.createElement('button');
        feedbackButton.className = 'btn1 feedback';
        feedbackButton.innerText = "Submit Feedback";
        feedbackButton.addEventListener('click', () => {
            let restaurantNameEl = createRestaurantElement(search.name);
            formEl.appendChild(restaurantNameEl);
            modal.style.display = "block";
        });
        newCardBody.appendChild(feedbackButton);
    }
    let searchButton = document.createElement('button');
    searchButton.className = 'btn1 search';
    searchButton.innerText = "Search with These Parameters Again";
    newCardBody.appendChild(searchButton);
    // searchButton.addEventListener('click', () => {
    //     reroll()});
    return newCardBody;
}

function createRestaurantElement(restaurantName) {
    let userID = 0;
    if (localStorage.getItem("loggedIn")) {
        userID = localStorage.getItem("user");
    }
    let userEl = document.createElement('input');
    userEl.className = "input--style-2";
    userEl.type = "text";
    userEl.id = "user-id";
    userEl.name = "user-id";
    userEl.value = userID;
    userEl.hidden = true;

    let inputGroupEl = document.createElement('div');
    inputGroupEl.className = "input-group";
    inputGroupEl.id = "restaurant-name-container";
    let inputContainer = document.createElement('input');
    inputContainer.className = "input--style-2";
    inputContainer.type = "text";
    inputContainer.id = "restaurant-name-fill";
    inputContainer.name = "restaurant-name-fill";
    inputContainer.value = restaurantName;
    inputContainer.innerText = restaurantName;
    inputGroupEl.appendChild(inputContainer);
    inputGroupEl.appendChild(userEl);

    let submitEl = document.createElement('input');
    submitEl.type = "submit";
    submitEl.id = "submit-button";
    inputGroupEl.appendChild(submitEl);
    return inputGroupEl;
}

async function fetchFeedback() {
    let userID = 0;
    if (localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    let response = await fetch(`/feedback?user=${userID}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        return data;
    });
    return response;
}

async function getFeedback(search) {
    let buttons = true;
    let tempFeedbackElement = "Feedback: You haven't submitted feedback yet";
    let fetchedFeedback = await fetchFeedback();
    fetchedFeedback.forEach((feedback) => {
        if (feedback.restaurantName == search.name) {
            thisRestaurantsFeedback = feedback.restaurantRating + "; " + feedback.notes;
            buttons = false;
            tempFeedbackElement = "Feedback: " + thisRestaurantsFeedback;
        }
    });
    return [tempFeedbackElement, buttons];
}

/* ==========================================================================
   DIRECTIONS TO THE RESTAURANT
   ========================================================================== */
let directionsRenderer;
let directionsService;

function addMapScript() {
    let script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDbEPugXWcqo1q6b-X_pd09a0Zaj3trDOw&callback=initMap';
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

function initMap() {
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    let lat = localStorage.getItem("lat")
    let lng = localStorage.getItem("lng")
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) }
    });
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("directionsPanel"));
    calculateAndDisplayRoute(directionsService, directionsRenderer);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    let start = localStorage.getItem("lat") + "," + localStorage.getItem("lng");
    let end = localStorage.getItem("restaurantAddress");
    directionsService.route({
            origin: start,
            destination: end,
            travelMode: "DRIVING"
        },
        function(response, status) {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}
