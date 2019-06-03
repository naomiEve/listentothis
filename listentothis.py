import random, requests, re, json
from pymemcache.client.base import Client
from flask import Flask, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)
memclient = Client(("localhost", 11211))

subreddits = ["music", "listentothis"]
sorting = ["new", "top"]
timesort = ["week", "year"]

def retrieveSong():
	url = "https://www.reddit.com/r/" + random.choice(subreddits) + ".json?sort=" + random.choice(sorting) + "&t=" + random.choice(timesort) + "&limit=100"

	if memclient.get(url) is None:
		print(url + " hasn't been cached yet.")
		r = requests.get(url, headers={"User-agent": "ListenToThis API/1.0"})
		memclient.set(url, r.text, expire=60*60)
		j = json.loads(r.text)

	else:
		print(url + " has been cached.")
		result = memclient.get(url)
		j = json.loads(result)

	hasFound = False
	attempts = 0

	while not hasFound:
		attempts += 1
		item = random.choice(j["data"]["children"])
		item = item["data"]
		if item["domain"] == "youtube.com":
			artist, *title = item["title"].split(" -")
			title = "".join(title)

			genre = re.search(r'\[(.*?)\]', title)
			genre = genre.group(1) if genre != None else ""

			year = re.search(r'\((.*?)\)', title)
			year = year.group(1) if year != None else ""

			title = title.replace("[" + genre + "]", "")
			title = title.replace("(" + year + ")", "")

			title = title.rstrip()[1:]

			song = {
				"artist": artist,
				"title": title,
				"url": item["url"],
				"genre": genre.capitalize(),
				"year": year,
				"discussion": "https://reddit.com" + item["permalink"]
			}
			hasFound = True

		if attempts > 10:
			song = None
			break

	return song

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/song")
def getSong():
	result = retrieveSong()
	if result is None:
		response = {
			"status": 0,
			"data": {}
		}
	else:
		response = {
			"status": 1,
			"data": result
		}

	return jsonify(response)
