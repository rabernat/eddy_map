#!/usr/bin/env python
from flask import Flask, jsonify, send_file, request
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'eddies'
mongo = PyMongo(app)

@app.route('/')
def index():
    return send_file('static/index.html')

@app.route('/eddy/<eddy_id>')
def get_eddy(eddy_id):
    """Full data for eddy."""
    eddy = mongo.db.rcs_eddies.find_one({'_id': eddy_id})
    return jsonify(eddy)

@app.route('/eddies')
def get_eddies(full_data=False, duration=30, add_mean_trajectory=False):
    """Query mongodb for all eddies in the database."""

    # maybe overwrite duration from query string
    if request.args.get('duration'):
        duration = int(request.args.get('duration'))

    # get everything
    filter = {'duration': duration} 

    if full_data:
        # get all fields, overloads the browser
        projection = None
    else:
        # just get the first two features
        # (initial center, final center)
        projection = {'features': {'$slice': 1}}

    data = []
    for eddy in mongo.db.rcs_eddies.find(filter, projection):
        # inject id into properties of start point
        try:
            eddy['features'][0]['properties']['eddy_id'] = eddy['_id']
            if add_mean_trajectory:
                start_pt = eddy['features'][0]['geometry']['coordinates']
                end_pt = eddy['features'][1]['geometry']['coordinates']
                eddy['features'].append({
                    'type': 'Feature',
                    'properties': {'name': 'trajectory'},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [start_pt, end_pt]
                        }
                    })
            data.append(eddy)
        except KeyError:
            app.logger.warning('problem parsing eddy ' + eddy['_id'])
    
    # wrap data into a larger FeatureCollection
    fs = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fs)

@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
