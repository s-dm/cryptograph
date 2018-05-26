// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

admob.initAdmob("ca-app-pub-9286697504300611~1342368073","ca-app-pub-9286697504300611/3044007144");//admob id format ca-app-pub-xxxxxxxxxxxxxxxxxxx/xxxxxxxxxx

document.addEventListener(admob.Event.onInterstitialReceive, onInterstitialReceive, false);//show in ad receive event fun need add receive listener
admob.cacheInterstitial();// load admob Interstitial
function onInterstitialReceive(message) {//show in ad receive event fun
    admob.showInterstitial();
}
function onGameOver(){//call this fun to show when game over
       admob.isInterstitialReady(function(isReady){
           if(isReady){
               admob.showInterstitial();
           }
       });
 }



