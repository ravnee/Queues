# Queues
Cache, Proxies, Queues

Setup

1. Cloned the Queues repository
2. Installed Redis
3. Run redis server
4. Run npm install in the Queues folder
5. Run nodejs main.js

## Server setup in main.js

```
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
```


## Routes handled by express:

###/set

```
app.get('/set', function(req, res) {
  client.set("key", "this message will self-destruct in 10 seconds");
  client.expire("key",10);
  res.send("key added successfully");
})
```

### /get

```
app.get('/get', function(req, res) {
  client.get("key", function(err,value){ 
  	console.log(value);
  	res.send(value);
  });
})
```

### /recent

```
app.get('/recent', function(req, res) {
  client.lrange('recentUrls', 0, -1, function(err, reply) {
    console.log(reply); 
    res.send(reply);
  });
})
```

### /upload

```
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
```

### /meow

```
app.get('/meow', function(req, res) {
	
	client.lpop('images',function(err,imagedata){
		if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});
		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		res.end();
	})				
})
```

## Proxy setup

1. For this task, I have created one more instance of server running at port 3001, other than the main.js running at 3000.
2. In proxy server, I have added the avaiable servers in a list.
3. Using redis rpoplpush, I am taking the alternate avaiable servers and sending the requests to that.

###
Code block to add servers to the queue 'servers'. I have checked that if the queue already contains servers, then don't add them again.
```
client.lrange('servers',0,-1,function(err,serverVar){
    if (err) throw err
    //console.log(serverVar);
    //console.log(serverVar.length);
    if(serverVar.length==0){
      client.rpush(['servers', 3000,3001], function(err, reply) {
          console.log("added servers"+reply); //prints 2
      });
    }
})
```

Using rpoplpush, popping the right and pushing it to the left . This way I keep on alternating between available servers.

```
client.rpoplpush('servers', 'servers', function(err, reply) {
    console.log("rpoplpush servers"); //prints 2      
});
```

Using lrange, I am getting the newly pushed server in the queue.

```
client.lrange('servers',0,0,function(err,serverVar){
    if (err) throw err
    nextServer = serverVar;
})
```

