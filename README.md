Real-time Stock/Crypto Market Data Visualization with Flask, SocketIO, and Chart.js:

The app is a demo that shows how to use Flask and SocketIO to capture real-time data from the stock/cryptocurrency market. In this case, it captures the Bitcoin price and plots it through Chart.js. Users can create alerts by setting price limits, pausing/resuming alert messages, and resetting new price limits whenever they want. Thanks to Firebase Realtime Database, all changes in both prices and transaction volume are saved.

Quick start: 

1. Install virtualenv by running the following command in your terminal:

```
pip install virtualenv

```
2. Create a virtual environment by running the following command in your terminal:

```
virtualenv venv 

```

3. Activate the virtual environment by running the following command in your terminal:

```
source venv/bin/activate 

```
4.Install the required packages by running the following command in your terminal:

```
pip install -r requirements.txt

```
5. Run the Flask application by running the following command in your terminal:

```
flask run

```
Note: Before running the flask run command, make sure you have navigated to the project directory where the app.py file is located. 
Also, ensure that the requirements.txt file is present in the same directory.

