#!/usr/bin/env python
from flask import Flask, jsonify, send_file, request, Response
from flask.ext.pymongo import PyMongo
import json
from bson import json_util

app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'eddies'
mongo = PyMongo(app)
#COLLECTION = 'rcs_eddies'
COLLECTION = 'ssh_eddies'


@app.route('/')
def index():
    return send_file('static/index.html')

@app.route('/eddy/<eddy_id>')
def get_eddy(eddy_id):
    """Full data for eddy."""
    eddy = mongo.db[COLLECTION].find_one({'_id': int(eddy_id)})
    return jsonify(eddy)

@app.route('/eddy_stream')
def stream_eddies(full_data=False, duration=30, add_mean_trajectory=False):
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

    query = mongo.db[COLLECTION].find(filter, projection)

    # https://blog.al4.co.nz/2016/01/streaming-json-with-flask/
    def generate():
        """
        A lagging generator to stream JSON so we don't have to hold everything in memory
        This is a little tricky, as we need to omit the last comma to make valid JSON,
        thus we use a lagging generator, similar to http://stackoverflow.com/questions/1630320/
        """
        releases = query.__iter__()

        json_prefix = '{"type": "FeatureCollection", "features": ['
        json_suffix = ']}'
        try:
            prev_release = next(releases)  # get first result
        except StopIteration:
            # StopIteration here means the length was zero, so yield a valid releases doc and stop
            yield json_prefix + json_suffix
            raise StopIteration
        # We have some releases. First, yield the opening json
        yield json_prefix
        # Iterate over the releases
        for release in releases:
            yield json.dumps(prev_release, default=json_util.default) + ', '
            prev_release = release
        # Now yield the last iteration without comma but with the closing brackets
        yield json.dumps(prev_release, default=json_util.default) + json_suffix

    return Response(generate(), content_type='application/json')


@app.route('/eddies')
def get_eddies(full_data=False, duration=30, add_mean_trajectory=False):
    """Query mongodb for all eddies in the database."""

    # maybe overwrite duration from query string
    if request.args.get('duration'):
        duration = int(request.args.get('duration'))

    # get everything
    #filter = {'duration': duration} 
    filter = {}

    if full_data:
    # get all fields, overloads the browser
        projection = None
    else:
        # just get the first two features
        # (initial center, final center)
        projection = {'features': {'$slice': 1}}

    data = []
    for eddy in mongo.db[COLLECTION].find(filter, projection):
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
