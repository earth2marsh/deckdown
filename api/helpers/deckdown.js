var fs = require("fs")
  , ejs = require('ejs')
  , lessMiddleware = require('less-middleware')
  , marked = require('marked')
  , extend = require('node.extend')
  , path = require('path')
  , express = require('express')
  , request = require('request')
  , querystring = require('querystring')
  , bodyParser = require('body-parser')
  , validator = require('validator')
  , app = express();


marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

//load the templates
var template = {
  main: fs.readFileSync(process.cwd() + "../templates/index.html", "utf8"), 
  slides: fs.readFileSync(process.cwd() + "../templates/masters/default.html", "utf8")
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

  




