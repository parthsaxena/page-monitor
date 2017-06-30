var player = require('play-sound')(opts = {})
fs = require('fs');
var http = require('http');
const path = require('path');
const notifier = require('node-notifier');

var url = "www.socifyinc.com";

const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'adidassaintpagemonitor@gmail.com',
        pass: 'theadidassaint'
    }
});

var options = {
  host: 'www.socifyinc.com',
  path: '/test.html'
};

let mailOptions = {
    from: '"The Adidas Saint" <theadidassaint@gmail.com>', // sender address
    to: 'henrikhp42@gmail.com, henrikhp42@gmail.com', // list of receivers
    subject: 'PAGE-MONITOR UPDATE ✔', // Subject line
    text: 'THERE HAS BEEN AN UPDATE ON ' + url + '.', // plain text body
    html: '<b>THERE HAS BEEN AN UPDATE ON ' + url + '.</b>' // html body
};

var timesChecked = 0;

var afterLoad = require('after-load');
/*afterLoad('https://socifyinc.com', function(html){
   console.log(html);
});*/

var previousData = "";
var currentData = "";

//checkPage();

setInterval(checkPage, 3000);

function checkPage() {
  timesChecked++;
  var req  = http.get(options, function(res) {
    // Buffer the body entirely for processing as a whole.
    var bodyChunks = "";
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks += chunk;
    }).on('end', function() {
      currentData = bodyChunks;

      // check for update
      if (currentData == previousData) {
        // NO UPDATE
        console.log("NO UPDATE ON " + url);
        //console.log("PREVIOUS: " + previousData + "CURRENT: " + currentData);
        previousData = currentData
      } else {
        // UPDATE
        if (timesChecked != 1) {
          console.log("UPDATE");
          fs.writeFile('update-current.txt', currentData, function (err) {
              if (err) return console.log(err);
                console.log('Wrote update-current.txt');
          });
          fs.writeFile('update-previous.txt', previousData, function (err) {
              if (err) return console.log(err);
                console.log('Wrote update-previous.txt');
          });

          //console.log("PREVIOUS: " + previousData + "CURRENT: " + currentData);
          previousData = currentData;

          sendUpdateNotifications();
        } else {
          console.log("Ran first time.");
          previousData = currentData;
          //sendUpdateNotifications();
        }
      }
    })
  });

  function sendUpdateNotifications() {

    notifier.notify({
      'title': 'TIME TO COOK!',
      'icon': path.join(__dirname, 'notification.jpeg'),
      'message': 'TIME TO COOK!'
    });

    player.play('notification.mp3', function(err){
      if (err) throw err
      console.log("Played notification sound.");
    })

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
}
