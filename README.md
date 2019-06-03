# ListenToThis

ListenToThis fetches new songs from reddit's /r/music and /r/listentothis every single hour and randomly picks music for you to listen to.
It runs on top of Flask and memcached for caching previously fetched results.

# Requirements
- flask & flask-cors
- pymemcache
- memcached
- python 3+

# Installation
Clone this repository and run `pip install -r requirements.txt`. Afterwards run `FLASK_APP=listentothis.py flask run` to run your own instance at `localhost:5000`