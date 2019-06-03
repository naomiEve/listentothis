// ListenToThis / prefetcher 2019

// Load the Youtube IFrame API asynchronously
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const API = window.location.origin + "/song";

var player;
var currentsong;
var lastState;

/* Stolen off https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url */
function getVideoIDFromLink(link) { 
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	var match = link.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}

function setInfo() {
	document.title = currentsong["data"]["title"] + " - " + currentsong["data"]["artist"] + " / ListenToThis";
	document.getElementById("playing").innerHTML = "<b>" + currentsong["data"]["title"] + "</b> by " + currentsong["data"]["artist"];
	document.getElementById("genre").innerHTML = currentsong["data"]["genre"] ? currentsong["data"]["genre"] : "?";
	document.getElementById("year").innerHTML = currentsong["data"]["year"] ? currentsong["data"]["year"] : "?";

	document.getElementById("yt-link").href = currentsong["data"]["url"];
	document.getElementById("reddit-link").href = currentsong["data"]["discussion"];
}

function skipSong() {
	player.stopVideo();
}

function onYouTubeIframeAPIReady() {
	retrieveSong().then(function(res) {
		currentsong = res;

		var id = getVideoIDFromLink(currentsong["data"]["url"]);
		setInfo();

		player = new YT.Player('video', {
			playerVars: { 'autoplay': 1, 'controls': 0, "origin": "https://www.youtube.com" },
			videoId: id,
			events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange,
				'onError': onPlayerError
			}
		});
	});
}

function retrieveSong() {
	return fetch(API).then(function(response){
		return response.json()
	}).then(function(songjson){
		return songjson
	});
}

function onPlayerReady(event) {
	event.target.playVideo();
}

function onPlayerError(event) {
	console.log("[player] => encountered an error, requesting next video.")
	retrieveSong().then(function(res) {
		currentsong = res;
		var id = getVideoIDFromLink(currentsong["data"]["url"]);
	
		setInfo();
		console.log("[player] => got video " + id);
		event.target.loadVideoById(id);
	});
}

function onPlayerStateChange(event) {
	console.log("[state] => " + event.data);
	if (event.data == 0 || event.data == 5) { // Fetch new on either video end or video stop (skip)
		console.log("[player] => requesting new video");
		retrieveSong().then(function(res) {
			currentsong = res;

			var id = getVideoIDFromLink(currentsong["data"]["url"]);
			setInfo();
			console.log("[player] => got video " + id);

			event.target.loadVideoById(id);
		});
	}
	lastState = event.data;
}

function showmenu() {
	var menu = document.getElementById("menu")
	menu.hidden = !menu.hidden;
	document.getElementById("icon").classList.toggle("invert");
}