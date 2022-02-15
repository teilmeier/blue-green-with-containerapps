require('dotenv-extended').load();
const config = require('./config');

const express = require('express');
const app = express();
const morgan = require('morgan');

var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

const OS = require('os');

// add logging middleware
app.use(morgan('dev'));

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', function(req, res) {
    console.log('received request');
    res.send('Hi!');
});
app.get('/ping', function(req, res) {
    console.log('received ping');
    var sourceIp = req.connection.remoteAddress;
    var forwardedFrom = (req.headers['x-forwarded-for'] || '').split(',').pop();
    var pong = { response: "pong!", host: OS.hostname(), source: sourceIp, forwarded: forwardedFrom, version: config.version };
    console.log(pong);
    res.send(pong);
});
app.get('/healthz', function(req, res) {
    res.send('OK');
});

var primeFactors = function getAllFactorsFor(remainder) {
    var factors = [], i;
    
    for (i = 2; i <= remainder; i++) {
        try{
            while ((remainder % i) === 0) {
                if (config.laggy && i == 19){
                    console.log("blocking for " + config.laggy +" seconds");
                    var waitTill = new Date(new Date().getTime() +config.laggy * 1000);
                    while(waitTill > new Date()){}
                }
                factors.push(i);
                remainder /= i;
            }
        }catch(e){
            console.log(e);
        }
    }
    
    return factors;
}

// curl -X POST --header "number: 3" --header "randomvictim: true" http://localhost:3002/api/calculation
app.post('/api/calculation', function(req, res) {
    console.log("received client request:");
    console.log(req.headers);
    var resultValue = [0];
    try{
        resultValue = primeFactors(req.headers.number);
        console.log("calculated:"); 
        console.log(resultValue);
    }catch(e){
        console.log(e);
        resultValue = [0];
    }
    var endDate = new Date();

    if (req.headers.joker){
        resultValue = "42";
    }

    var randomNumber = Math.floor((Math.random() * 20) + 1);

    if ((req.headers.randomvictim && req.headers.randomvictim ===true ) || (config.buggy && randomNumber > 19)){
        console.log("looks like a 19 bug");
        res.status(500).send({ value: "[ b, u, g]", error: "looks like a 19 bug", host: OS.hostname(), remote: remoteAddress, version: config.version });
    }
    else{
        var remoteAddress = req.connection.remoteAddress;
        var serverResult = JSON.stringify({ timestamp: endDate, value: resultValue, host: OS.hostname(), remote: remoteAddress, version: config.version } );
        console.log(serverResult);
        res.send(serverResult.toString());
    }
});

app.post('/api/dummy', function(req, res) {
    console.log("received dummy request:");
    console.log(req.headers)
    res.send('42');
});

console.log(config);
console.log(OS.hostname());

app.listen(config.port);
console.log('Listening on localhost:'+ config.port);