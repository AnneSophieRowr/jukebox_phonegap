function loadPlaylist(urls, playlist_id) {
  var cssSelector = { jPlayer: "#jquery_jplayer_1", cssSelectorAncestor: "#jp_container_1" };
  var options = { swfPath: "/flash", supplied: "mp3", autoPlay: false };
  window[playlist_id] = new jPlayerPlaylist(cssSelector, urls, options);
}

