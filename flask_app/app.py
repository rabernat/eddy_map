# -------------------------------------------------------------------------------------- imports ----- #
#!/usr/bin/env python
from bson import json_util
from datetime import datetime
import flash
from flask import Flask, jsonify, request, Response, send_file
from flask.ext.pymongo import PyMongo
import json


# --------------------------------------------------------------------------------------- basics ----- #
app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'eddies'
mongo = PyMongo(app)


# ----------------------------------------------------------------------------------------- data ----- #
COLLECTION_01 = 'rcs_eddies'
COLLECTION_02 = 'ssh_eddies'


# ----------------------------------------------------------------------------------------- home ----- #
@app.route('/')
def index():
    return send_file('static/index.html')


# ------------------------------------------------------------------------------------------ rcs ----- #

# --------------------------------------------------------------------- eddy ----- #
@app.route('/rcs_eddy/<string:eddy_id>')
def get_rcs_eddy(eddy_id):
    eddy = mongo.db[COLLECTION_01].find_one({'_id': eddy_id})
    return jsonify(eddy)

# ------------------------------------------------------------------- eddies ----- #
@app.route('/rcs_eddies')
def get_rcs_eddies(full_data=False, add_mean_trajectory=False,
                   dat_min = datetime.strptime('1992-10-13-12', '%Y-%m-%d-%H'),
                   dat_max = datetime.strptime('2012-03-15-12', '%Y-%m-%d-%H'),
                   lat_min=float(-91), lat_max=float(91),
                   lon_min=float(-1), lon_max=float(361),
                   dur_min=int(2), dur_max=int(168)):

    # ------------------------------------------------- date ----- #
    if request.args.get('dat_min'):
        dat_min = datetime.strptime(str(request.args.get('dat_min'))+'-12', '%Y-%m-%d-%H')
    if request.args.get('dat_max'):
        dat_max = datetime.strptime(str(request.args.get('dat_max'))+'-12', '%Y-%m-%d-%H')

    # --------------------------------------------- latitude ----- #

    if request.args.get('lat_min'):
        lat_min = float(request.args.get('lat_min'))
    if request.args.get('lat_max'):
        lat_max = float(request.args.get('lat_max'))

    # -------------------------------------------- longitude ----- #
    if request.args.get('lon_min'):
        lon_min = float(request.args.get('lon_min'))
    if request.args.get('lon_max'):
        lon_max = float(request.args.get('lon_max'))

    # --------------------------------------------- duration ----- #
    if request.args.get('dur_min'):
        dur_min = int(request.args.get('dur_min'))*7
    if request.args.get('dur_max'):
        dur_max = int(request.args.get('dur_max'))*7

    # ----------------------------------------------- filter ----- #
    filter = {'date_start': {'$gt': dat_min, '$lt': dat_max},
              'loc_start': {'$within': {'$box': [[lon_min, lat_min], [lon_max, lat_max]]}},
              'duration': {'$gt': dur_min, '$lt': dur_max}}

    # ------------------------------------------------ slice ----- #
    if full_data:
        projection = None # all
    else:
        projection = {'features': {'$slice': 1}} # start center

    # ----------------------------------------------- inject ----- #
    data = []
    for eddy in mongo.db[COLLECTION_01].find(filter, projection).limit(3000):
        try:
            eddy['features'][0]['properties']['eddy_id'] = eddy['_id'] # id
            eddy['features'][0]['properties']['eddy_start_date'] = eddy['date_start'] # start date
            eddy['features'][0]['properties']['eddy_end_date'] = eddy['date_end'] # end date
            eddy['features'][0]['properties']['eddy_duration'] = eddy['duration'] # duration
            eddy['features'][0]['properties']['eddy_mean_area'] = eddy['area'] # mean area
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

    # ------------------------------------------------- wrap ----- #
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


# ------------------------------------------------------------------------------------------ ssh ----- #

# --------------------------------------------------------------------- eddy ----- #
@app.route('/ssh_eddy/<int:eddy_id>')
def get_ssh_eddy(eddy_id):
    eddy = mongo.db[COLLECTION_02].find_one({'_id': eddy_id})
    return jsonify(eddy)

# ------------------------------------------------------------------- eddies ----- #
@app.route('/ssh_eddies')
def get_ssh_eddies(full_data=False, add_mean_trajectory=False,
                   dat_min = datetime.strptime('1992-10-13-12', '%Y-%m-%d-%H'),
                   dat_max = datetime.strptime('2012-03-15-12', '%Y-%m-%d-%H'),
                   lat_min=float(-91), lat_max=float(91),
                   lon_min=float(-1), lon_max=float(361),
                   dur_min=int(2), dur_max=int(168)):

    # ------------------------------------------------- date ----- #
    if request.args.get('dat_min'):
        dat_min = datetime.strptime(str(request.args.get('dat_min'))+'-12', '%Y-%m-%d-%H')
    if request.args.get('dat_max'):
        dat_max = datetime.strptime(str(request.args.get('dat_max'))+'-12', '%Y-%m-%d-%H')

    # --------------------------------------------- latitude ----- #

    if request.args.get('lat_min'):
        lat_min = float(request.args.get('lat_min'))
    if request.args.get('lat_max'):
        lat_max = float(request.args.get('lat_max'))

    # -------------------------------------------- longitude ----- #
    if request.args.get('lon_min'):
        lon_min = float(request.args.get('lon_min'))
    if request.args.get('lon_max'):
        lon_max = float(request.args.get('lon_max'))

    # --------------------------------------------- duration ----- #
    if request.args.get('dur_min'):
        dur_min = int(request.args.get('dur_min'))*7
    if request.args.get('dur_max'):
        dur_max = int(request.args.get('dur_max'))*7

    # ----------------------------------------------- filter ----- #
    filter = {'date_start': {'$gt': dat_min, '$lt': dat_max},
              'loc_start': {'$within': {'$box': [[lon_min, lat_min], [lon_max, lat_max]]}},
              'duration': {'$gt': dur_min, '$lt': dur_max}}

    # ------------------------------------------------ slice ----- #
    if full_data:
        projection = None # all
    else:
        projection = {'features': {'$slice': 1}} # start center

    # ----------------------------------------------- inject ----- #
    data = []
    if mongo.db[COLLECTION_02].find(filter, projection).count() < 3000:
        for eddy in mongo.db[COLLECTION_02].find(filter, projection).limit(3000):
            try:
                eddy['features'][0]['properties']['eddy_id'] = eddy['_id'] # id
                eddy['features'][0]['properties']['eddy_start_date'] = eddy['date_start'] # start date
                eddy['features'][0]['properties']['eddy_end_date'] = eddy['date_end'] # end date
                eddy['features'][0]['properties']['eddy_duration'] = eddy['duration'] # duration
                eddy['features'][0]['properties']['eddy_mean_area'] = eddy['area'] # mean area
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
    else:
        flash('eddy number is too large to load.')

    # ------------------------------------------------- wrap ----- #
    fc = {'type': 'FeatureCollection', 'features': data}
    return jsonify(fc)


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
