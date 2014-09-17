'use strict';

var request = require('request');
var async = require('async');
var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com",
    // pathPrefix: "/api/v3", // for some GHEs
    timeout: 5000
});

var util = require('util');

module.exports = {
  reveal: reveal
}

function reveal(req, res) {
  var gist = req.swagger.params.gist.value;
  var url = "https://api.github.com/gists/"+gist;
  //console.log('Executing request: '+url);
  github.gists.get({
      id: gist
    },
    function(err, response) {
//      JSON.stringify(response);
        res.send(response.files["example.md"].content);
    }
  );
  
  //request.get(url).pipe(res);

//  var html = gist ? util.format('https://api.github.com/gists/%s', gist) : 'No gist id supplied!';
//  res.json(html);
}

function getWeatherByCity(req, res) {
	var city = req.swagger.params.city.value;
	var url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial";
	console.log('Executing request: '+url);
	request.get(url).pipe(res);
};

function getGistRawMarkdown(id) {
};