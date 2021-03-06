// &#9734;
let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiaGVsbG9yb2hhbiIsImEiOiJjamlyZG85dmMwZWp6M3BtdjJkMWh1a21oIn0.k9cA7BknpTRGVcNEiSgwbw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(Number(id), (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
      DBHelper.fetchRestaurantReviewsById(restaurant, (error, restaurant) => {
        if(error) {
          console.error(error);
          return;
        }
        self.restaurant = restaurant;
        this.fillRestaurantHTML();
      });
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  const imgName = restaurant.photograph.split(".")[0];
  image.className = 'restaurant-img'
  image.alt = `Ambience of ${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `/dist/${imgName}.jpg 300w, /dist/${imgName}@2x.jpg 600w, /dist/${imgName}@3x.jpg 800w`;
  image.sizes = '(max-width: 768px) 60vw, 45vw';
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill fav btn
  this.fillRestaurantFavoriteHTML();

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

favoriteRestaurantById = (id, toggle) => {
  DBHelper.toggleRestaurantFavorite(id, toggle, (error, restaurant) => {
    if(error) {
      console.error(error);
    } else {
      self.restaurant = restaurant;
      this.fillRestaurantFavoriteHTML(restaurant.is_favorite, restaurant.id);
    }
  })
}

favoriteBtnEventHandler = (e) => {
  const type = event.type;
  const toggle = self.restaurant.is_favorite === "false";
  if (type === 'keydown') {
    if (event.keyCode === 13 || event.keyCode === 32) {
      this.favoriteRestaurantById(self.restaurant.id, toggle);
      event.preventDefault();
    }
  }
  else if (type === 'click') {
    this.favoriteRestaurantById(self.restaurant.id, toggle);
  }
}

fillRestaurantFavoriteHTML = (is_favorite = self.restaurant.is_favorite, id = self.restaurant.id) => {
  const btn = document.getElementById('restaurant-fav');
  btn.addEventListener('click', this.favoriteBtnEventHandler);
  btn.addEventListener('keydown', this.favoriteBtnEventHandler);
  if(is_favorite === "true") {
    btn.innerHTML = '&#9733';
    btn.title = 'Remove from favorite';
    btn.setAttribute('aria-label', 'Remove from favorite');
    return;
  }
  btn.innerHTML = '&#9734';
  btn.title = 'Add to favorite';
  btn.setAttribute('aria-label', 'Add to favorite');
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.id = "no-reviews";
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.createElement('ul');
  ul.setAttribute('id','reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const titleContainer = document.createElement('div');
  titleContainer.className = 'title-container';
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = "info-name";
  titleContainer.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  date.className = "info-date";
  titleContainer.appendChild(date);
  li.appendChild(titleContainer);

  const detailsContainer = document.createElement('div');
  detailsContainer.className = "review-details"
  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'info-rating';
  detailsContainer.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  detailsContainer.appendChild(comments);

  li.appendChild(detailsContainer);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
