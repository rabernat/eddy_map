#!/usr/bin/env python
from flask import Flask, jsonify
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'eddies'
mongo = PyMongo(app)

@app.route('/')
def index():
    return "Hello, World!"

# some test data for leaflet to plot
eddy_data ={
    'type': 'FeatureCollection',
    'features':[
        {'type': 'Feature',
         'properties': {'name': 'start', 'date': '1992-01-01'},
         'geometry': {'type': 'Point',
                    'coordinates': [200,35]}},
        {'type': 'Feature',
         'properties': {'name': 'end', 'date': '1992-01-21'},
         'geometry': {'type': 'Point',
                    'coordinates': [190,33]}},
        {'type': 'Feature',
         'properties': {'name': 'trajectory', 'date': '1992-01-21'},
         'geometry': {'type': 'LineString',
                    'coordinates': [[200,35],[190,33]]}},
    ]
}

@app.route('/eddy')
def get_eddy():
    """A single test eddy."""
    return jsonify(eddy_data)

@app.route('/eddies')
def get_eddies(full_data=False):
    """Query mongodb for all eddies in the database."""
   
    # get everything
    filter = None

    if full_data:
        # get all fields, overloads the browser
        projection = None
    else:
        # just get the first three features
        # (initial center, final center, trajectory)
        projection = {'features': {'$slice': 3}}

    data = [eddy for eddy in mongo.db.rcs_eddies.find(filter, projection)]
    
    # wrap data into a larger FeatureCollection
    fs = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fs)

@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
