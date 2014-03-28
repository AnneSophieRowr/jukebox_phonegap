$(document).ready(function(){

  current_view = $('.ajax_content:visible');

  $("#jquery_jplayer_1").jPlayer({
    ready: function () {
      $(this).jPlayer("setMedia", {
        mp3: "http://www.jplayer.org/audio/m4a/Miaow-07-Bubble.m4a"
      });
    },
    swfPath: "/js",
    supplied: "mp3"
  });

  $('.nav').on('click', function() {
    $('.ajax_content').hide();
    var href = $(this).attr('href');
    $(href).show();

    current_view = $('.ajax_content:visible');

    switch(href) {
      case '#search':
        getLastSearchedPlaylists();
        break;
      case '#last':
        getLastPlaylists();
        break;
      case '#kinds':
        getKinds();
        break;
      case '#readers':
        getReadersPlaylists();
        break;
      case '#news':
        getNewsPlaylists();
        break;
    }
  });

  $(document).on('click', '.kind', function() {
    getKindPlaylists($(this).attr('id'));
  });

  $(document).on('click', '.playlist', function() {
    getPlaylistSongs($(this).attr('id'));
    moveFlow($(this).attr('position'));
    foldPage();
  });

  $(document).on('click', '.song', function() {
    index = $(this).find('.index').text();
    playlist_id = $(this).find('.playlist_id').text();
    title = $(this).find('.song_artist').text() + ' - ' + $(this).find('.song_name').text();
    $('.title').html(title);
    window[playlist_id].play(index);
  });

  $(document).on('click', '.item', function() {
    getPlaylistSongs($(this).attr('id'));
    foldPage();
  });

});

function getLastSearchedPlaylists() {
  console.log('getLastSearchedPlaylists');
  db = openDB();
  sql =   "SELECT p.id, p.image, p.name, COALESCE(k.name, '-') as kind_name, STRFTIME('%d/%m/%Y', p.created_at) as date ";
  sql +=  "FROM playlists p ";
  sql +=  "LEFT JOIN kinds_playlists kp ON p.id = kp.playlist_id ";
  sql +=  "LEFT JOIN kinds k ON k.id = kp.kind_id ";
  sql +=  "GROUP BY p.id ";
  sql +=  "ORDER BY date DESC ";
  sql +=  "LIMIT 20";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderPlaylists, errorCB);
  }, errorCB);
}

function getLastPlaylists() {
  console.log('getLastPlaylists');
  db = openDB();
  window.current_flow = 'last_playlists_flow';
  sql =   "SELECT p.id, p.image, p.name, COALESCE(k.name, '-') as kind_name, STRFTIME('%d/%m/%Y', p.created_at) as date ";
  sql +=  "FROM playlists p ";
  sql +=  "LEFT JOIN kinds_playlists kp ON p.id = kp.playlist_id ";
  sql +=  "LEFT JOIN kinds k ON k.id = kp.kind_id ";
  sql +=  "GROUP BY p.id ";
  sql +=  "ORDER BY date DESC ";
  sql +=  "LIMIT 20";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderPlaylistsAndFlow, errorCB);
  }, errorCB);
}

function getReadersPlaylists() {
  console.log('getReadersPlaylists');
  db = openDB();
  sql =   "SELECT p.id, p.image, p.name, COALESCE(k.name, '-') as kind_name, STRFTIME('%d/%m/%Y', p.created_at) as date ";
  sql +=  "FROM playlists p ";
  sql +=  "LEFT JOIN kinds_playlists kp ON p.id = kp.playlist_id ";
  sql +=  "LEFT JOIN kinds k ON k.id = kp.kind_id ";
  sql +=  "JOIN playlists_types pt ON p.id = pt.playlist_id ";
  sql +=  "JOIN types t ON t.id = pt.type_id ";
  sql +=  "WHERE t.id = 1 ";
  sql +=  "GROUP BY p.id ";
  sql +=  "ORDER BY date DESC ";
  sql +=  "LIMIT 20";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderPlaylists, errorCB);
  }, errorCB);
}

function getNewsPlaylists() {
  console.log('getNewsPlaylists');
  db = openDB();
  window.current_flow = 'news_playlists_flow';
  sql =   "SELECT p.id, p.image, p.name, COALESCE(k.name, '-') as kind_name, STRFTIME('%d/%m/%Y', p.created_at) as date ";
  sql +=  "FROM playlists p ";
  sql +=  "LEFT JOIN kinds_playlists kp ON p.id = kp.playlist_id ";
  sql +=  "LEFT JOIN kinds k ON k.id = kp.kind_id ";
  sql +=  "JOIN playlists_types pt ON p.id = pt.playlist_id ";
  sql +=  "JOIN types t ON t.id = pt.type_id ";
  sql +=  "WHERE t.id = 2 ";
  sql +=  "GROUP BY p.id ";
  sql +=  "ORDER BY date DESC ";
  sql +=  "LIMIT 20";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderPlaylistsAndFlow, errorCB);
  }, errorCB);
}

function renderPlaylistsAndFlow(tx, playlists) {
  console.log('renderPlaylistsAndFlow');
  renderPlaylists(tx, playlists, true);
}

function renderPlaylists(tx, playlists, flow) {
  console.log('renderPlaylists');
  current_view.find('.playlists tbody').html('');
  if (playlists.rows.length == 0) {
    list = 'Aucune playlist';
  } else {
    list = '';
    for (i = 0; i < playlists.rows.length; i++) {
      p = playlists.rows.item(i);
      klass = (i%2 == 0) ? "dark" : "light";
      if (p.image.indexOf("default") != -1) {
        image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox/default.jpg';
      } else {
        image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox' + p.image.replace('/uploads','');
      }
      //image = 'http://127.0.0.1:3000' + p.image;
      list += '<tr class="' + klass + ' playlist" id="' + p.id + '" position="' + i + '"><td class="small"><img src="' + image  + '"/></td>';
      list += '<td class="large">' + p.name + '</td>';
      list += '<td class="large">' + p.kind_name + '</td>';
      list += '<td class="large">' + p.date + '</td></tr>';
    }
    current_view.find('.playlists tbody').html(list);
    if (flow == true) { renderFlow(playlists); }
  }
}

function getPlaylistSongs(id) {
  console.log('getPlaylistSongs');
  current_view.find('.songs tbody').html('');
  current_view.find('.loader').fadeIn();
  db = openDB();
  sql =   "SELECT p.id AS playlist_id, p.description AS description, s.id AS id, ps.position AS position, COALESCE(a.name, '-') AS artist, COALESCE(s.name, '-') AS name, COALESCE(al.name, '-') AS album, COALESCE(al.year, '-') AS year, s.file AS file ";
  sql +=  "FROM playlists p ";
  sql +=  "JOIN playlists_songs ps ON ps.playlist_id = p.id ";
  sql +=  "JOIN songs s ON ps.song_id = s.id ";
  sql +=  "LEFT JOIN albums_songs als ON als.song_id = s.id ";
  sql +=  "LEFT JOIN albums al ON als.album_id = al.id ";
  sql +=  "LEFT JOIN artists a ON s.artist_id = a.id ";
  sql +=  "WHERE p.id = " + id + " ";
  sql +=  "ORDER BY position";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderSongs, errorCB);
  }, errorCB);
  current_view.find('.loader').fadeOut();
}

function renderSongs(tx, songs) {
  console.log('renderSongs');
  current_view.find('.songs tbody').html('');
  if (songs.rows.length == 0) {
    list = 'Aucune chanson';
  } else {
    $('.comment_bar').html(songs.rows.item(0).description);
    list = '';
    urls = [];
    for (i = 0; i < songs.rows.length; i++) {
      s = songs.rows.item(i);
      url = 'file:///storage/emulated/0/android/data/com.bpi.jukebox' + s.file.replace('/uploads','');
      //url = 'http://127.0.0.1:3000' + s.file;
      urls.push({mp3: url});
      klass = (i%2 == 0) ? "dark" : "light";
      list += '<tr class="' + klass + ' song" id="' + s.id + '"><td class="small">' + s.position  + '</td>';
      list += '<td class="large song_artist">' + s.artist + '</td>';
      list += '<td class="large song_name">' + s.name + '</td>';
      list += '<td class="large">' + s.album + '</td>';
      list += '<td class="small">' + s.year + '</td>';
      list += '<td class="hide index">' + i + '</td>';
      list += '<td class="hide playlist_id">' + s.playlist_id + '</td></tr>';
    }
    current_view.find('.songs tbody').html(list);
    loadPlaylist(urls, songs.rows.item(0).playlist_id);
  }
}

function foldPage() {
  var current_view = $('.ajax_content:visible') 
  //current_view.find('.search_bar').addClass('folded');
  //current_view.find('.search_bar input').addClass('folded');
  //current_view.find('.list.playlists').addClass('folded');
  current_view.find('.search_bar').animate({
    "width": "940px"
  }, 1500);
  current_view.find('.search_bar input').animate({
    "width": "83%"
  }, 1500);
  current_view.find('.list.playlists').animate({
    "width": "940px"
  }, 1500);
  current_view.find('.unfolded').animate({
    "right": "+=940px"
  }, 1500, function() { $(this).removeClass('unfolded'); });
}













