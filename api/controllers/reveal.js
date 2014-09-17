'use strict';

var request = require('request');
var async = require('async');
var GitHubApi = require("github");

var fs = require("fs")
  , ejs = require('ejs')
  , lessMiddleware = require('less-middleware')
  , marked = require('marked')
  , extend = require('node.extend')
  , path = require('path')
//  , express = require('express')
//  , request = require('request')
  , querystring = require('querystring')
  , bodyParser = require('body-parser')
  , validator = require('validator');
//  , app = express();

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
  var gistid = req.swagger.params.gistid.value;
  // var url = "https://api.github.com/gists/"+gist;
  //console.log('Executing request: '+url);
  github.gists.get({
      id: gistid
    },
    function(err, response) {
//      JSON.stringify(response);
      for (var key in response.files) {
        if (response.files[key].language === "Markdown") {
			res.send(ejs.render(template.deck, {
			  content: slides(response.files[key].content)
			}));
			break;
        }
      }
    }
  );
  
  //request.get(url).pipe(res);

//  var html = gist ? util.format('https://api.github.com/gists/%s', gist) : 'No gist id supplied!';
//  res.json(html);
}

function getGistRawMarkdown(id) {
};

marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

//load the templates
var template = {
  deck: fs.readFileSync(process.cwd() + "/api/templates/deck.html", "utf8"), 
  slides: fs.readFileSync(process.cwd() + "/api/templates/masters/default.html", "utf8")
};

function slides(body){
  var rawSlides = mdToHtmlArray(body);
  //combine
  var slides = rawSlides.map(function(slide, i){
    return ejs.render(template.slides, {
      content: slide.content
    });
  });
  return slides.join("");
}

function mdToHtmlArray(markdown){
    var html = marked(markdown);
    //Array of values we need to prepend after the split
    var headers = html.match(/(<h[1-6])|(<hr>)/g); 
    
    //leave a marker for splitting
    html = html.replace(/(<h[1-6])|(<hr>)/g, '<========/*slide*/=========>'); 
    var slides = html.split("<========/*slide*/=========>"); 
    
    //element 0 is whitespace. artifact of split method
    slides.shift(); 
    
    slides = slides.map(function(s, i){
      //add proper header number back after it was lost in the replace
      var result = {};
      if(headers[i] == "<hr>"){
        result = {
          'level': 'text',
          'content': s
        };
      }
      else{
        result = {
          'level': headers[i].slice(1),
          'content': headers[i] + s
        };
      }      
      return result; 
    });
    
    return slides;
  }