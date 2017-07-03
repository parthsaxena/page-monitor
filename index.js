var request = require('request');
var player = require('play-sound')(opts = {})
fs = require('fs');
var http = require('http');
const path = require('path');
const notifier = require('node-notifier');
var cheerio = require('cheerio');
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: 'bnYLK8TZaDuf1ZXhCqyRpBHXI',
  consumer_secret: 'DOwuaMyLAsm9iOfIh7AzaFfgtdX5tF5Dw5k2BGqfXxcZhMZLgv',
  access_token_key: '881162849589932033-uEV4wh2B8H6Bcwv9ChW6aaiBQg7OPx3',
  access_token_secret: 'uPYjIpCr7d9vwo4uXyKNY8VRDGIn29uLRapZlypJZjSxi'
});

var url = "www.yeezysupply.com";

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
  host: 'https://yeezysupply.com/collections/all',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': '*/*'
  }
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

setInterval(checkPage, 7500);

function checkPage() {
  timesChecked++;

  var requestOptions = {
    url: 'https://yeezysupply.com/collections/all',
    headers: {
      //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
      //"Cookie: _orig_referrer=; _landing_page=%2Fcollections%2Fall"
    }
  };



  // request Request
//    'use strict';

    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'yeezysupply.com',
        port: '443',
        path: '/collections/all',
        method: 'GET',
        headers: {"Cookie":"_orig_referrer=; _landing_page=%2Fcollections%2Fall"}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;

    // Paw Store Cookies option is not supported

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';

        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ?
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

                // WE HAVE RESPONSE STRING, PROCESS
                currentData = responseStr;

                // check for update
                if (currentData == previousData) {
                  // NO UPDATE
                  console.log("NO UPDATE ON " + url);
                  fs.writeFile('update-current.html', currentData, function (err) {
                      if (err) return console.log(err);
                        console.log('Wrote update-current.html');
                  });

                  // SCRAPE HTML FOR MOST RECENT PRODUCT
                  const $ = cheerio.load(currentData);
                  links = $('a.ProductGridItem');
                  $(links).each(function(i, link){
                    if (i == 0) {
                        var link = "https://yeezysupply.com" + $(link).attr('href');
                        console.log("FIRST LINK: " + link);
                        //sendUpdateNotifications(link);
                    }
                  });

                  //console.log("PREVIOUS: " + previousData + "CURRENT: " + currentData);
                  previousData = currentData
                } else {
                  // UPDATE
                  fs.writeFile('update-current.html', currentData, function (err) {
                      if (err) return console.log(err);
                        console.log('Wrote update-current.html');
                  });
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

                    // SCRAPE HTML FOR MOST RECENT PRODUCT
                    const $ = cheerio.load(currentData);
                    links = $('a.ProductGridItem');
                    $(links).each(function(i, link){
                      if (i == 0) {
                          var link = "https://yeezysupply.com" + $(link).attr('href');
                          console.log("FIRST LINK: " + link);
                          sendUpdateNotifications(link);
                      }
                    });
                  } else {
                    console.log("Ran first time.");
                    previousData = currentData;
                    //sendUpdateNotifications();
                  }
                }
        });

    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("")
    request.end();













  /*request(requestOptions, function(error, response, data) {
    if (error || response === undefined) {
      // error
      console.log("ERROR: " + error);
    } else {

    }
  })*/
}

  function sendUpdateNotifications(link) {
    // SEND EMAIL
    notifier.notify({
      'title': 'TIME TO COOK!',
      'icon': path.join(__dirname, 'notification.jpeg'),
      'message': 'TIME TO COOK!'
    });

    player.play('notification.mp3', function(err){
      if (err) throw err
      console.log("Played notification sound.");
    })

    let mailOptions = {
        from: '"The Adidas Saint" <theadidassaint@gmail.com>', // sender address
        to: 'henrikhp42@gmail.com, henrikhp42@gmail.com', // list of receivers
        subject: 'PAGE-MONITOR UPDATE ✔', // Subject line
        text: 'THERE HAS BEEN AN UPDATE ON ' + url + '.', // plain text body
        html: '<b>THERE HAS BEEN AN UPDATE ON ' + url + '.\n NEW PRODUCT URL: ' + link + '</b>' // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });

    // SEND TWEET
    client.post('statuses/update', {status: 'PRODUCT LINK: ' + link}, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
    });
  }
