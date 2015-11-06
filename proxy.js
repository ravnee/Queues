var redis = require('redis')
var express = require('express')
var request = require('request')
var app = express()
var client = redis.createClient(6379, '127.0.0.1', {})
var nexthit='3000'
//client.rpush(['servers', 3000,3001]);

client.lrange('servers',0,-1,function(err,serverVar){
      if (err) throw err
      console.log(serverVar);
      console.log(serverVar.length);
      if(serverVar.length==0){
        client.rpush(['servers', 3000,3001], function(err, reply) {
            console.log("added servers"+reply); //prints 2
        });
      }
    })



var nextServer;

var server = app.listen(3006, function () {

    var host = server.address().address
    var port = server.address().port
    //nextServer = client.rpoplpush('servers','servers')

  //client.set('lasthit','3000')
    console.log('Example app listening at http://%s:%s', host, port)
})

app.get('/', function(req, res) {

    console.log("listening /")
    client.rpoplpush('servers', 'servers', function(err, reply) {
      console.log("rpoplpush servers"); //prints 2      
  });
    client.lrange('servers',0,0,function(err,serverVar){
      if (err) throw err
      nextServer = serverVar;
      console.log("nextServer is "+nextServer)
    })
    request('http://0.0.0.0:'+nextServer+'/', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            res.send(body) 
          }
        })

      /*client.get('lasthit',function(err,value){
        if(value == '3000'){
          nexthit='3002'
          client.set('lasthit','3002')
        }
        else{
          nexthit='3000'
          client.set('lasthit','3000')
        }
        request('http://0.0.0.0:'+nexthit+'/', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            res.send(body) 
          }
        })
      })*/
})



app.get('/get',function(req,res){
  console.log("in get , nextServer is "+nextServer);

  request('http://0.0.0.0:'+nextServer+'/get', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body) 
        }
      })
})

/*
app.get('/set',function(req,res){
  request('http://0.0.0.0:'+nexthit+'/set', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body) 
        }
      })
})

app.get('/upload',function(req,res){
  request('http://0.0.0.0:'+nexthit+'/upload', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body) 
        }
      })
})

app.get('/meow',function(req,res){
  request('http://0.0.0.0:'+nexthit+'/meow', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body) 
        }
      })
})

app.get('/recent',function(req,res){
  request('http://0.0.0.0:'+nexthit+'/recent', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body) 
        }
      })
})


*/