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

const apiKey = 'AIzaSyBL_9GfCUu7DGDvHdtlM8CaAywE2bVFVJc';
let searchResults;

function chooseRandomRestaurant() {
    const restaurants = [
        "Panera Bread",
        "Qdoba",
        "Los Tacos No 1",
        "The Modern",
        "Piccola Cucina",
        "Superiority Burger",
        "Cote",
        "Marea"
    ]
    const selectedRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const resultsText = document.getElementById("selected-restaurant");
    resultsText.innerText = selectedRestaurant;
}

function loadPage() {
    window.location.replace("results.html");
}

function test() {
    let obj;
    let url = 'https://jsonplaceholder.typicode.com/posts/1';

    fetch(url)
        .then(response => response.json())
        .then(data => obj = data)
        .then(() => console.log(obj))
}

function query() {
    const lat = -33.8670522;
    const long = 151.1957362;
    // const lat = 39.109635;
    // const long = -108.542347;
    const radius = document.getElementById('distance').value;
    const type = 'restaurant';
    const keyword = document.getElementById('searchTerms').value;
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 'location=' + lat + ',' + long + '&radius=' + radius + '&type=' + type + '&keyword=' + keyword + '&key=' + apiKey;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";

<<<<<<< HEAD
    fetch(proxyurl + url)
        .then(response => response.json())
        .then(response => searchResults = response)
        .then(() => console.log(searchResults))
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"));
}
=======
    saveSearch(url, radius, keyword);
    fetch(proxyurl + url)
        .then(response => response.json())
        .then(response => searchResults = response)
        .then(() => {
            console.log(searchResults);
        })
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"));
}

function onSignIn(googleUser) {
  let id_token = googleUser.getAuthResponse().id_token;
  let profile = googleUser.getBasicProfile();
  fetch(`/login?id_token=${id_token}`).then(response => response.json()).then((data) => {
      localStorage.setItem("user", data.id); 
      localStorage.setItem("loggedIn", true);
      addUserContent(profile.getName(), profile.getImageUrl());
      toggleAccountMenu();
    }); 
}

function addUserContent(name, image){
    document.getElementById("user-name").innerText = name;
    document.getElementById("profile-pic").src = image;
}

function toggleAccountMenu() {
    document.getElementById("account-menu").classList.toggle('show');
    document.getElementById("sign-in").classList.toggle('hide');
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  localStorage.setItem("user", 0);
  toggleAccountMenu();
}

function saveSearch(url, radius, keyword){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}&radius=${radius}&keywords=${keyword}&url=${url}`, {
        method: 'POST'
    });
}

function getSearches(){
    let userID = 0;
    if(localStorage.getItem("loggedIn")){
        userID = localStorage.getItem("user");
    }
    fetch(`/searches?user=${userID}`, {method: 'GET'}).then(response => response.json()).then(data => console.log(data));
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
>>>>>>> prototype