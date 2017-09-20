# Code to trigger Chrome "Aw, snap!" crash

## How to use
Download the media file to be transcoded, from
https://s3-eu-west-1.amazonaws.com/get-tobiicloud-com-eu-west-1/Temp/sintel-1024.webm
and put in the same folder as the code.

Serve up the files using any static web server.
For example, run:

     npm install http-server -g
     http-server

Then, go to served URL, for example http://localhost:8080 and open the console log, where progress can be viewed. After about a minute, it should all crash.

