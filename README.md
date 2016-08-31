To install crawler and get it to run, you need to install nodejs first. Instructions are available at nodejs.org and you'll want to install the stable one not the beta one.

Next, you'll need to install phantomjs (the headless browser) so the crawler can crawl. do this by typing:
npm install phantomjs -g

Next you'll need to install all the other "node stuff" that this project needs to run. Just run the following command:
npm install

Lastly, you'll want to run the crawler. To do so, run the following:
phantomjs index.js

BLAMO! Now you're crawling at 3 pages a second. Fancy! (timer is totally arbitrary. I think there's some kind of detection script that catches you crawling and haults your searches, but I haven't hit it because I'm moving slow enough to dodge it.)')'