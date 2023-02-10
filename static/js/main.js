
var firebaseConfig = {
    apiKey: '{{ API_KEY }}',
    authDomain: '{{ AUTH_DOMAIN }}',
    databaseURL: 'your database.firebasedatabase.app',
    projectId: '{{ PROJECT_ID }}',
    storageBucket: '{{ STORAGE_BUCKET }}',
    messagingSenderId: '{{ MESSAGING_SENDER_ID }}',
    appId: '{{ APP_ID }}',
    measurementId: '{{ MEASUREMENT_ID }}'
    
};

firebase.initializeApp(firebaseConfig);
// Load the data from the JSON file
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://yourdatabase.firebasedatabase.app/price_data.json', true);
xhr.send();
xhr.onload = function () {
    if (xhr.status === 200) {
        var ref = firebase.database().ref("price_data");
        ref.on("value", function (snapshot) {
            var jsondata = Object.values(snapshot.val());

            // Limit the data to 20 points
            jsondata = jsondata.slice(Math.max(jsondata.length - 20, 0));
            // Format the data for the chart
            var time = [];
            var price = [];
            var delta_volume = [];
            for (var i = 0; i < jsondata.length; i++) {
                time.push(moment.unix(jsondata[i].time).format("MM-DD HH:mm:ss"));
                price.push(jsondata[i].price);
                delta_volume.push(jsondata[i].delta_volume);
            }
            //time.reverse();
            // price.reverse();
            // Create the chart
            var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: time,
                    datasets: [{
                        label: 'Price (USD)',
                        type: 'line',
                        data: price,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        yAxisID: 'y-axis-price',
                        fill: false
                    },
                    {
                        label: 'Transaction volume in Binance',
                        data: delta_volume,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        yAxisID: 'y-axis-amount',
                        fill: false
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Bitoin real time price and volume in Binance'
                    },
                    scales: {

                        yAxes: [{
                            id: 'y-axis-price',
                            position: 'left',
                            ticks: {
                                min: 21000
                            },

                            scaleLabel: {
                                display: true,
                                labelString: 'Price'
                            }
                        },
                        {
                            id: 'y-axis-amount',
                            position: 'right',
                            ticks: {
                                min: -50
                            }, scaleLabel: {
                                display: true,
                                labelString: 'Transcation volume'
                            }
                        }]
                    }
                }
            });

        });
    }
};

var alertsEnabled = true;
var minPrice = null;
var maxPrice = null;

// Get the toggle button
var toggleButton = document.getElementById('toggleButton');

// Set the initial state of the toggle button
toggleButton.innerHTML = (alertsEnabled) ? "Pause" : "Resume";

// Add click event listener to the toggle button
toggleButton.addEventListener('click', function () {
    // Update the value of alertsEnabled
    alertsEnabled = !alertsEnabled;

    // Update the text of the toggle button
    toggleButton.innerHTML = (alertsEnabled) ? "Pause" : "Resume";
});


document.getElementById("updateButton").addEventListener("click", function() {
    // Get the min and max prices
    var inputMinPrice = document.getElementById("minPrice").value;
    var inputMaxPrice = document.getElementById("maxPrice").value;

     // Check if the user entered a value for minPrice
     if (inputMinPrice) {
        minPrice = parseFloat(inputMinPrice);
    }
    // Check if the user entered a value for maxPrice
    if (inputMaxPrice) {
        maxPrice = parseFloat(inputMaxPrice);
    }

    // Save the minimum and maximum price to the database
    firebase.database().ref('price_data/minPrice').set(minPrice);
    firebase.database().ref('price_data/maxPrice').set(maxPrice);

    // Show the price limit updated alert message
    var className = 'alert-success';
    var message = "Price limit updated";
    var alertBox = document.createElement('div');
    alertBox.classList.add('alert', className, 'fade', 'show');
    alertBox.setAttribute('role', 'alert');
    alertBox.innerHTML = message;

    // Add the alert box to the page
    document.getElementById('alertContainer').appendChild(alertBox);

    // Remove the alert box after 5 seconds
    setTimeout(function () {
        alertBox.classList.remove('show');
        alertBox.classList.add('hide');

        // Remove the alert box from the page after it has been hidden
        setTimeout(function () {
            alertBox.remove();
        }, 500);
    }, 5000);
});



var socket = io();

// Get a reference to the Firebase database
var database = firebase.database();

// Get the minimum and maximum price from the database
var minPriceRef = database.ref('minPrice');
var maxPriceRef = database.ref('maxPrice');

var minPrice = null;
var maxPrice = null;

minPriceRef.on('value', function (snapshot) {
    minPrice = snapshot.val();
});

maxPriceRef.on('value', function (snapshot) {
    maxPrice = snapshot.val();
});


minPriceRef.on('value', function (snapshot) {
    minPrice = snapshot.val();
    console.log('Min price: ', minPrice);
}, function (error) {
    console.error('Error retrieving min price: ', error);
});

maxPriceRef.on('value', function (snapshot) {
    maxPrice = snapshot.val();
    console.log('Max price: ', maxPrice);
}, function (error) {
    console.error('Error retrieving max price: ', error);
});

socket.on('alert', function (data) {
    if (!alertsEnabled) {
        return;
    }

    var className = 'alert-danger';
    var message = data.data;

    // Check if the message is a price alert
    if (minPrice !== null && maxPrice !== null) {
        var price = parseFloat(data.data);
        if (price < minPrice || price > maxPrice) {
            return;
        } else {
            className = 'alert-success';
            message = "Price is within the limit";
        }
    }

    // Create the alert box
    var alertBox = document.createElement('div');
    alertBox.classList.add('alert', className, 'fade', 'show');
    alertBox.setAttribute('role', 'alert');
    alertBox.innerHTML = message;

    // Add the alert box to the page
    document.getElementById('alertContainer').appendChild(alertBox);

    // Remove the alert box after 5 seconds
    setTimeout(function () {
        alertBox.classList.remove('show');
        alertBox.classList.add('hide');

        // Remove the alert box from the page after it has been hidden
        setTimeout(function () {
            alertBox.remove();
        }, 500);
    }, 5000);
});
