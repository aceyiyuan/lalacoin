
var firebaseConfig = {
    apiKey: '{{ API_KEY }}',
    authDomain: '{{ AUTH_DOMAIN }}',
    databaseURL: 'https://your database.europe-west1.firebasedatabase.app',
    projectId: '{{ PROJECT_ID }}',
    storageBucket: '{{ STORAGE_BUCKET }}',
    messagingSenderId: '{{ MESSAGING_SENDER_ID }}',
    appId: '{{ APP_ID }}',
    measurementId: '{{ MEASUREMENT_ID }}'
    
};

firebase.initializeApp(firebaseConfig);
// Load the data from the JSON file
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://your database.europe-west1.firebasedatabase.app/price_data.json', true);
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
                                min: 22000
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

var alerts_enabled = true;

// Get the toggle button
var toggleButton = document.getElementById('toggleButton');

// Set the initial state of the toggle button

toggleButton.innerHTML = (alerts_enabled) ? "Pause Alerts" : "Resume Alerts";


// Add click event listener to the toggle button
toggleButton.addEventListener('click', function () {
    // Update the value of alertsEnabled
    alerts_enabled = !alerts_enabled;

    // Update the text of the toggle button
    toggleButton.innerHTML = (alerts_enabled) ? "Pause Alerts" : "Resume Alerts";
});

var socket = io();

socket.on('alert', function (data) {
    // Create the alert box
    var alertBox = document.createElement('div');
    alertBox.classList.add('alert', 'alert-danger', 'fade', 'show');
    alertBox.setAttribute('role', 'alert');
    alertBox.innerHTML = data.data;

    // Add the alert box to the page
    document.getElementById('alertContainer').appendChild(alertBox);

    // Remove the alert box after 5 seconds
    setTimeout(function () {
        alertBox.classList.remove('show');
        alertBox.classList.add('hide');

        // Remove the alert box from the page after it has been hidden
        setTimeout(function () {
            alertBox.remove();
        }, 500);//removes the HTML element represented by the alertBox variable from the DOM after 0.5 seconds have elapsed.
    }, 5000);
});


/* var socket = io();
// Handle the alert event from the server
socket.on('alert', function (data) {
// Show an alert message to the user
alert(data.data);
}); */
