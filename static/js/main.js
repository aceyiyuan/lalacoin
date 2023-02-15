
var firebaseConfig = {
    apiKey: '{{ API_KEY }}',
    authDomain: '{{ AUTH_DOMAIN }}',
    databaseURL: 'https://lala-coin-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: '{{ PROJECT_ID }}',
    storageBucket: '{{ STORAGE_BUCKET }}',
    messagingSenderId: '{{ MESSAGING_SENDER_ID }}',
    appId: '{{ APP_ID }}',
    measurementId: '{{ MEASUREMENT_ID }}'

};

firebase.initializeApp(firebaseConfig);
// Load the data from the JSON file
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://lala-coin-default-rtdb.europe-west1.firebasedatabase.app/price_data.json', true);
xhr.send();
xhr.onload = function () {
    if (xhr.status === 200) {
        var ref = firebase.database().ref("price_data");
        ref.on("value", function (snapshot) {
            if (snapshot.val()) {
                var jsondata = Object.values(snapshot.val());
                // Limit the data to 20 points
                jsondata = jsondata.slice(Math.max(jsondata.length - 20, 0));
                // Format the data for the chart
                var time = [];
                var price = [];
                var delta_volume = [];
                
                for (var i = 0; i < jsondata.length; i++) {
                    if (jsondata[i].hasOwnProperty("price")){
                        time.push(moment.unix(jsondata[i].time).format("MM-DD HH:mm:ss"));
                        price.push(jsondata[i].price);
                        delta_volume.push(jsondata[i].delta_volume);

                    }
                   
                }


            } else {
                console.log('Error: snapshot.val() is null or undefined');
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
                        backgroundColor: 'rgb(96, 27, 207)',
                        borderColor: 'white',
                        borderWidth: 1,
                        yAxisID: 'y-axis-price',
                        fill: false,
                        fontColor:"white"
                    },
                    {
                        label: 'Transaction volume on Binance',
                        data: delta_volume,
                        backgroundColor: '#FF5733',
                        borderColor: '#C70039',
                        borderWidth: 1,
                        yAxisID: 'y-axis-amount',
                        fill: false,
                        fontColor:"white"
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: 'Bitcoin real-time price and volume on Binance',
                        fontColor:"white",
                        fontSize: 16
                    },
                   
                   
                    scales: {
                        xAxes: [{
                            gridLines: {
                              display: true,
                              color: "grey"
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Price',
                                fontColor:"white"
                            },
                            ticks: {
                              
                                fontColor:"white"
                            },
                          }],
                        
                        yAxes: [{
                            id: 'y-axis-price',
                            position: 'left',
                            ticks: {
                                min: 21000,
                                fontColor:"white"
                            },
                            gridLines: {
                                color: 'grey'
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Price',
                                fontColor:"white"
                            }
                        },
                        {
                            id: 'y-axis-amount',
                            position: 'right',
                            ticks: {
                                min: -50,
                                fontColor:"white"
                            }, 
                         
                            scaleLabel: {
                                display: true,
                                labelString: 'Transcation volume',
                                fontColor:"white"
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

// Get a reference to the Firebase database
var database = firebase.database();

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

// Get the min and max prices
var minPriceRef = firebase.database().ref('price_data/minPrice');
var maxPriceRef = firebase.database().ref('price_data/maxPrice');


document.getElementById("updateButton").addEventListener("click", function () {
    
    // Get the user's input values for minPrice and maxPrice

    var minPriceInput = document.getElementById("minPrice").value;
    var maxPriceInput = document.getElementById("maxPrice").value;

    // Check if the user entered a value for minPrice
    if (minPriceInput) {
        minPrice = parseFloat(minPriceInput);
        minPriceRef.set(minPrice);
    }

    // Check if the user entered a value for maxPrice
    if (maxPriceInput) {
        maxPrice = parseFloat(maxPriceInput);
        maxPriceRef.set(maxPrice);

    }

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

socket.on("toggle_alerts", function (data) {
    alertsEnabled = data.state === "enabled";
});


minPriceRef.on('value', function (snapshot) {
    minPrice = snapshot.val();

});

maxPriceRef.on('value', function (snapshot) {
    maxPrice = snapshot.val();

});

socket.on('alert', function (data) {
    if (!alertsEnabled) {
        return;
    }

    var className = 'alert-danger';
    var message = "";

    // Get the latest price data
    var priceRef = database.ref('price_data');
    priceRef.orderByChild('time').limitToLast(1).once('value', function (snapshot) {
        var priceData = snapshot.val();
        var price = parseFloat(priceData[Object.keys(priceData)[0]].price);


        // Check if the price is within the limit
        if (minPrice !== null || maxPrice !== null) {
            if (minPrice !== null && price < minPrice) {
                message = "The price has dropped below " + minPrice + " now is " + price + " USD";
            } else if (maxPrice !== null && price > maxPrice) {
                message = "The price is now " + price + " USD, higher than your " + maxPrice + " USD limit";
            } else {
                className = 'alert-success';
                message = "Price is within the limit, the current price is " + price + " USD";
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
});
