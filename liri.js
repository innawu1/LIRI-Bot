//Requires for Twitter keys, Twitter, Spotify, and OMdb packages 
const keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");
var inquirer = require("inquirer");

var twitterClient = new Twitter ({
	consumer_key: keys.twitterKeys.consumer_key,
	consumer_secret: keys.twitterKeys.consumer_secret,
	access_token_key: keys.twitterKeys.access_token_key,
	access_token_secret: keys.twitterKeys.access_token_secret
});

var spotifyClient = new Spotify({
  id: "f8d6d22b06504adcbf0abda581753f88",
  secret: "39145019383446d08904916383a4b3ac"
});

var previewLink = "";
var queryUrl = "";
var command = process.argv[2];
var query = "";



//Switch statement that performs different tasks depending on which command is entered at process.argv[2]
switch(command){
	case "my-tweets":
	myTweets();
	break;

	case "spotify-this-song":
	inquirer.prompt({message: "Enter a song: ",
					type: "input",
					name: "song"}).then(function(ans){
						query = ans.song;
						songSearch(query);
					});
	break;

	case "movie-this":
	inquirer.prompt({message: "Enter a movie: ",
					 type: "input",
					 name: "movie"}).then(function(ans){
						query = ans.movie;
						movieSearch(query);
					});
	break;

	case "do-what-it-says":
	fileCommand();
	break;

	default:
	//User instructions
	console.log("Welcome to LIRI! Please enter one of the following commands after entering: node liri.js");
	console.log("my-tweets: This will show your last 20 tweets and when they were created");
	console.log("spotify-this-song: This will show the following information about the song you enter");
	console.log("movie-this: This will show the following information about the movie you enter");
	console.log("do-what-it-says: This will perform the command written on a random.txt");
}

//Function that can return up to 20 tweets
function myTweets(){
	var params = {q:"node.js",
			  	  count: 20,
			      lang: "en",
			      result_type: "recent"};

    twitterClient.get('search/tweets', params, function(error, tweets, response){
	if(!error && response.statusCode === 200){
		console.log("@"+tweets.statuses[0].user.screen_name + ": " + tweets.statuses[0].text +" <" + tweets.statuses[0].created_at + ">");

	} else{
		console.log("Error. Please try again.")
	} 

	});
};

function songSearch(song){
	if(!song){
		spotifyClient.search({ type: 'track', query: "The Sign" }, function(err, data) {
		previewLink = data.tracks.items[0].preview_url;
  		if (err) {
    		return console.log('Error occurred: ' + err);
  		} else {
			 console.log("Artist(s): "+ data.tracks.items[0].artists[0].name);
			 console.log("Song: "+ data.tracks.items[0].name );

			 
			 if(previewLink === null){
				console.log("This song does not have a preview link")
			 	} else {
					console.log("Preview Link: "+ previewLink);
					}

			    console.log("Album: " + data.tracks.items[0].album.name);
			}

			});

	} else {

		spotifyClient.search({ type: 'track', query: song }, function(err, data) {
		previewLink = data.tracks.items[0].preview_url;
  		if (err) {
    		return console.log('Error occurred: ' + err);
  		} else {
			 console.log("Artist(s): "+ data.tracks.items[0].artists[0].name);
			 console.log("Song: "+ data.tracks.items[0].name );

			 
			 if(previewLink === null){
				console.log("This song does not have a preview link")
			 } else {
				console.log("Preview Link: "+ previewLink);
				}

			  console.log("Album: " + data.tracks.items[0].album.name);
			}
			});
	}
};

//Function that runs a request to the OMDB API with the movie specified and logs specific information about the movie to the console
function movieSearch(movie){
	if(!movie){
	queryUrl = "http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=40e9cece";
	request(queryUrl, function(error, response, body){

	  // If the request is successful
	  if(!error && response.statusCode === 200){

	  	//Parse JSON retrieved from OMDB
	  	body = JSON.parse(body);

	  	//And console log information about the movie
	  	console.log("Title: " + body.Title);
	    console.log("Realease Year: " + body.Year);
	    console.log("IMDB Rating: " + body.imdbRating);
	    
	    //Loops through the Ratings array to see if a Rotten Tomatoes rating exists 
	    for(var i = 0; i < body.Ratings.length; i++){
		 var rating = body.Ratings[i].Source;

		//If a Rotten Tomatoes rating is found it will be logged to the console
		if(rating === "Rotten Tomatoes"){
			console.log("Rotten Tomatoes Rating: " + body.Ratings[i].Value);
		}
	}
	    console.log("Country(s) produced: " + body.Country);
	    console.log("Language(s): " + body.Language);
	    console.log("Plot: " + body.Plot);
	    console.log("Actors: " + body.Actors);
	  }
	});

	} else{
		queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";
		request(queryUrl, function(error, response, body){

		  // If the request is successful
		  if(!error && response.statusCode === 200){

		  	//Parse JSON retrieved from OMDB
		  	body = JSON.parse(body);

		  	//And console log information about the movie
		  	console.log("Title: " + body.Title);
		    console.log("Realease Year: " + body.Year);
		    console.log("IMDB Rating: " + body.imdbRating);
		    
		    //Loops through the Ratings array to see if a Rotten Tomatoes rating exists 
		    for(var i = 0; i < body.Ratings.length; i++){
			 var rating = body.Ratings[i].Source;

			//If a Rotten Tomatoes rating is found it will be logged to the console
			if(rating === "Rotten Tomatoes"){
				console.log("Rotten Tomatoes Rating: " + body.Ratings[i].Value);
			}
		}
		    console.log("Country(s) produced: " + body.Country);
		    console.log("Language(s): " + body.Language);
		    console.log("Plot: " + body.Plot);
		    console.log("Actors: " + body.Actors);
		  }
		});
	}

};

function fileCommand(){
	fs.readFile("random.txt","UTF-8", function(err, data) {
		if(err){
		return console.log(err);
		}

	//Takes contents of random.txt and inserts them into fileContents array
	var fileContents = data.split(",");

	//Pushes each value in the fileContents array to process.argv
	for(var i = 0; i < fileContents.length; i++){
		process.argv.push(fileContents[i]);
		}

	//Removes 'do-what-it-says' from process.argv array
	process.argv.splice(2,1);

	command = process.argv[2];
    query = process.argv[3];
		
	switch(command){
		case "my-tweets":
		myTweets();
		break;

		case "spotify-this-song":
		songSearch(query);
		break;

		case "movie-this":
		movieSearch(query);
		break;
		}

	});
};
