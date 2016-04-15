var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var verifytoken = "purrlbot123";
var token = "CAADJ7RwJtiMBAJfZBnpfiSXcUi0C6p6YFrcogJFhWpQ5Dd4HJ1iZCHOZAF8vWZB42L1qrrYSYSZCBzQPse77OfEsZCJyZCsTSpfCWjF9ld1BNb8Hli0rCplWUtbmeGX4GtvWX1iM3sWbzL9t9KSjPgk4ABgQiQ3ZBcilFwbsPFY3H0mlIJJiPg6m5somU6dx6TT91ZBqcnaZAI2QZDZD";

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});


app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === verifytoken) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

app.post('/webhook', function (req, res) {

    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {

        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            var text = event.message.text;
                if (text === "Generic") {
                    sendGenericMessage(sender);
                    continue;
                }
                else {
                    sendTextMessage(sender, "Echo: " + text.substring(0, 200));
                }
        }
    }

    res.sendStatus(200);

});


function sendTextMessage(sender, text) {

    var messageData = {
        text: text
    };

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function (error, response) {

        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }

    });

}

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
