import os
import json
import flask
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
import requests
from threading import Lock
from datetime import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from twilio.rest import Client
from dotenv import load_dotenv
load_dotenv()


# Firebase setup
cred = credentials.Certificate("lala-coin-firebase-serviceaccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://your database.europe-west1.firebasedatabase.app/'
    })

# Flask and SocketIO setup
async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = "Your_secret_string"
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()
alerts_enabled=True

# URL for retrieving price and volume data of bitcoin in USDT
price_url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
volume_url = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'

# Background thread to continuously retrieve price and volume data and emit it to clients
def background_thread():
    prev_volume = None
    while True:
        socketio.sleep(2)
        try:
            price = ((requests.get(price_url)).json())['price']
            volume = ((requests.get(volume_url)).json())['volume']
        except Exception as e:
            print(f"Error while retrieving data: {e}")
            continue
        try:
            price = float(price)
        except ValueError:
            print(f"Error: price is not a number: {price}")
            continue
        try:
            volume = float(volume)
        except ValueError:
            print(f"Error: volume is not a number: {volume}")
            continue
        time = int(datetime.now().timestamp())
        if prev_volume is not None:
            delta_volume = round(volume - prev_volume, 1)
        else:
            delta_volume = None
        prev_volume = volume

        # Store the price, volume, and delta_volume data in Firebase database
        ref = db.reference('price_data')
        ref.push().set({"time": time, "price": price, "volume": volume, "delta_volume": delta_volume})

        

        # Check if the price is over 25000
        if price >= 25000 and alerts_enabled:
            # Emit an alert to clients
            socketio.emit('alert', {'data': 'Bitcoin price over 25000!'})

            # Send an SMS with Twilio

            # Your Account SID and Auth Token from twilio.com/console
       
            account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
            auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
            client = Client(account_sid, auth_token)        
           
            message = client.messages.create(
            to=os.environ.get("TO"),
            from_=os.environ.get("FROM"),
            body="Bitcoin price has reached over 25000 USD!")


        # Emit the price, volume, and delta_volume data to clients
        socketio.emit('my_response',
                      {'data': 'Bitcoin current price (USD): ' + str(price),
                       'time': str(time),  'volume': volume, 'delta_volume': delta_volume})

       
# Return the template 'index.html' and pass the async_mode variable to the template context

@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode,
                           API_KEY=os.environ.get('API_KEY'),
                           AUTH_DOMAIN=os.environ.get('AUTH_DOMAIN'),
                           DATABASE_URL=os.environ.get('DATABASE_URL'),
                           PROJECT_ID=os.environ.get('PROJECT_ID'),
                           STORAGE_BUCKET=os.environ.get('STORAGE_BUCKET'),
                           MESSAGING_SENDER_ID=os.environ.get('MESSAGING_SENDER_ID'),
                           APP_ID=os.environ.get('APP_ID'),
                           MEASUREMENT_ID=os.environ.get('MEASUREMENT_ID'))



#WebSocket event handler for the 'connect' event

@socketio.event
def connect():
    global thread
    with thread_lock:
        if thread is None:
            # If the thread is None, start a new background task with the 'background_thread' function
            thread = socketio.start_background_task(background_thread)
            # Emit a 'my_response' event with a data payload of 'Connected' and 'count': 0
            emit('my_response', {'data': 'Connected', 'count': 0})      


if __name__ == '__main__':
    socketio.run(app)



""" 

# Route for serving the lala-coin.json file
@app.route("/lala-coin.json")
def lala_coin_data():
    with open('lala-coin.json', 'r') as json_file:
        data = json.load(json_file)
        print(data)
    return jsonify(data)

@socketio.event
def my_event(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my_response',
         {'data': message['data'], 'count': session['receive_count']})

# Receive the test request from client and send back a test response
@socketio.on('test_message')
def handle_message(data):
    print('received message: ' + str(data))
    emit('test_response', {'data': 'Test response sent'})

# Broadcast a message to all clients
@socketio.on('broadcast_message')
def handle_broadcast(data):
    print('received: ' + str(data))
    emit('broadcast_response', {'data': 'Broadcast sent'}, broadcast=True) """