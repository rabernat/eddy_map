#!/usr/bin/env python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "Hello, World!"

# some test data for leaflet to plot
eddy_data ={
    'type': 'FeatureSet',
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
    return jsonify(eddy_data)

@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
