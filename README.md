## Real-time Stock/Crypto Market Data Visualization with Flask, SocketIO, Chart.js and Firebase

This app is a demo that demonstrates how to use Flask and SocketIO to capture real-time data from the stock and cryptocurrency market. Specifically, it captures the price of Bitcoin and plots it using Chart.js. Users can create alerts by setting price limits, pausing or resuming alert messages, and resetting price limits as needed. Thanks to Firebase Realtime Database, all changes in both prices and transaction volume are saved in real-time.

## Pre-settings

Before you can use the app, you'll need to complete the following pre-settings:

1. Set up Firebase in app.py and enable real-time data storage by using the following code. Replace "yourprojectname-firebase-serviceaccountKey.json" with your actual service account file name. After registering on Firebase, download the service account file and rename it to match the filename in the code.

&emsp;&emsp;Optionally, if you also want to receive alert messages via phone, you can register your app on Twilio."

```
cred = credentials.Certificate("yourprojectname-firebase-serviceaccountKey.json")

```
2. Rename copyenvfile to .env and save it in the root directory. Follow the instructions in the file.

## Quick start: 

Follow these steps to quickly get started with the app:

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

![Project Name (1)](https://user-images.githubusercontent.com/49494825/219082978-1360abfb-cb59-4131-8e94-fe1d28321d32.gif)
