var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

function fail() {
  console.log('ERROR: failed to get filesystem');
}

function gotFS(fileSystem) {
  fileSystem.root.getDirectory("android/data/com.bpi.jukebox", {create: true}, dirReady, fail);
}

function dirReady(fileSystem) {
  window.appDirURL = fileSystem.toURL();
}

function launch(href) {
  window.location = "main.html" + href;
}
