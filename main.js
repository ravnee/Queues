var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);
	console.log("I printed this "+req.originalUrl);
	req.getUrl = function() {
      return req.protocol + "://" + req.get('host') + req.originalUrl;
    }
    var recUrl = req.protocol + "://" + req.get('host') + req.originalUrl;
    console.log(req.protocol + "://" + req.get('host') + req.originalUrl);       
    client.lpush(['recentUrls', recUrl], function(err, reply) {
      console.log("added "+reply); //prints 2
	});
	client.ltrim("recentUrls", 0, 4);
	// ... INSERT HERE.
	
	next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
  res.send('hello world')
})

app.get('/get', function(req, res) {
  client.get("key", function(err,value){ 
  	console.log(value);
  	res.send(value);
  });
})

app.get('/set', function(req, res) {
	console.log("inside");
  client.set("key", "this message will self-destruct in 10 seconds");
  client.expire("key",10);
  res.send("key added successfully");
})

app.get('/recent', function(req, res) {
  console.log("checking if I am getting the recent Urls");
  client.lrange('recentUrls', 0, -1, function(err, reply) {
    console.log("This is my list ");
    console.log(reply); 
    res.send(reply);
  });
})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img);
	  		client.lpush('images',img);
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	
	client.lpop('images',function(err,imagedata){
		if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});
		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		res.end();
	})				
})

// HTTP SERVER
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

