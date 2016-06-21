# ------------------------------------------------------------------------------------- packages ----- #
#!/usr/bin/env python
from bson import json_util
from datetime import datetime
from flask import Flask, jsonify, request, Response, send_file
from flask.ext.pymongo import PyMongo
import json


# --------------------------------------------------------------------------------------- basics ----- #
app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'eddies'
mongo = PyMongo(app)


# ---------------------------------------------------------------------------------- collections ----- #
# COLLECTION = 'rcs_eddies'
COLLECTION = 'ssh_eddies'


# ----------------------------------------------------------------------------------------- home ----- #
@app.route('/')
def index():
    return send_file('static/index.html')


# ------------------------------------------------------------------------------------------ all ----- #
@app.route('/all')
def get_all():
    data = []
    cursor = mongo.db[COLLECTION].find()
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ------------------------------------------------------------------------------------------- id ----- #
@app.route('/id/<int:eddy_id>')
def get_id(eddy_id):
    eddy = mongo.db[COLLECTION].find_one({'_id': eddy_id})
    return jsonify(eddy)


# ----------------------------------------------------------------------------------------- date ----- #
@app.route('/date/<string:eddy_date>')
def get_date(eddy_date):
    datestamp = datetime.strptime(eddy_date+'-12', '%Y-%m-%d-%H')
    cursor = mongo.db[COLLECTION].find({'date_start': datestamp})
    data = []
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ------------------------------------------------------------------------------------- timeline ----- #
@app.route('/timeline')
def get_timeline():
    date_min = datetime.strptime(str(request.args.get('date_min'))+'-12', '%Y-%m-%d-%H')
    date_max = datetime.strptime(str(request.args.get('date_max'))+'-12', '%Y-%m-%d-%H')
    cursor = mongo.db[COLLECTION].find({'date_start': {'$gt': date_min, '$lt': date_max}})
    data = []
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ---------------------------------------------------------------------------------------- point ----- #
@app.route('/point')
def get_point():
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))    
    cursor = mongo.db[COLLECTION].find({"loc_start": {"$within": {"$center": [[lon, lat], 1]}}})
    data = []
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ------------------------------------------------------------------------------------------ box ----- #
@app.route('/box')
def get_box():
    lat_min = float(request.args.get('lat_min'))
    lat_max = float(request.args.get('lat_max'))
    lon_min = float(request.args.get('lon_min'))   
    lon_max = float(request.args.get('lon_max'))    
    cursor = mongo.db[COLLECTION].find({"loc_start": {"$within": {"$box": [[lon_min, lat_min], [lon_max, lat_max]]}}})
    data = []
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ------------------------------------------------------------------------------------- duration ----- #
@app.route('/duration/<int:eddy_duration>')
def get_duration(eddy_duration):
    cursor = mongo.db[COLLECTION].find({'duration': eddy_duration*7})
    data = []
    for eddy in cursor:
        data.append(eddy)
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ----------------------------------------------------------------------------------------- eddy ----- #
@app.route('/eddy/<eddy_id>')
def get_eddy(eddy_id):
    """Full data for eddy."""
    eddy = mongo.db[COLLECTION].find_one({'_id': int(eddy_id)})
    return jsonify(eddy)    


# --------------------------------------------------------------------------------------- eddies ----- #
@app.route('/eddies')
def get_eddies(full_data=False, add_mean_trajectory=False):
    """Query mongodb for all eddies in the database."""

    # ----------------------------------------------------------------- timeline ----- #    
    if request.args.get('date_min'):
         date_min = datetime.strptime(str(request.args.get('date_min'))+'-12', '%Y-%m-%d-%H')
    if request.args.get('date_max'):
         date_max = datetime.strptime(str(request.args.get('date_max'))+'-12', '%Y-%m-%d-%H')
    
    # ---------------------------------------------------------------------- box ----- #
    if request.args.get('lat_min'):
        lat_min = float(request.args.get('lat_min'))
    if request.args.get('lat_max'):
        lat_max = float(request.args.get('lat_max'))
    if request.args.get('lon_min'):
        lon_min = float(request.args.get('lon_min'))
    if request.args.get('lon_max'):
        lon_max = float(request.args.get('lon_max'))
    
    # ----------------------------------------------------------------- duration ----- #    
    if request.args.get('duration_min'):
        duration_min = int(request.args.get('duration_min'))*7
    if request.args.get('duration_max'):
        duration_max = int(request.args.get('duration_max'))*7
    
    # ------------------------------------------------------------------- filter ----- #
    # filter = {}
    filter = {'date_start': {'$gt': date_min, '$lt': date_max},
              'loc_start': {'$within': {'$box': [[lon_min, lat_min], [lon_max, lat_max]]}},
              'duration': {'$gt': duration_min, '$lt': duration_max}}
    
    # --------------------------------------------------------------------- json ----- #
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


# ----------------------------------------------------------------------------------------- test ----- #
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


# ----------------------------------------------------------------------------------------- path ----- #
@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)


# ------------------------------------------------------------------------------------------ end ----- #
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')