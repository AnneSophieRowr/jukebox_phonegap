function getKinds() {
  sql =   "SELECT DISTINCT(k.id), k.name ";
  sql +=  "FROM kinds k ";
  sql +=  "JOIN kinds_playlists kp ON k.id = kp.kind_id ";
  sql +=  "JOIN playlists p ON kp.playlist_id = p.id ";
  sql +=  "WHERE visible = 'true' ";
  sql +=  "ORDER BY k.name ";
  sql +=  "LIMIT 12;";
  console.log(sql);
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderKinds, errorCB);
  }, errorCB);
}

function renderKinds(tx, kinds) {
  if (kinds.rows.length == 0) {
    list = 'Aucun genre musical';
  } else {
    list = '';
    for (i = 0; i < kinds.rows.length; i++) {
      kind = kinds.rows.item(i);
      list += '<li><a class="kind" href="#" id="' + kind.id + '">' + kind.name + '</li></a>';
    }
    $('ul.kinds').html(list);
  }
}

function getKindPlaylists(kind) {
  sql =   "SELECT p.id, p.image, p.name, COALESCE(k.name, '-') as kind_name, k.image AS kind_image, COALESCE(k.description, '-') AS description, STRFTIME('%d/%m/%Y', p.created_at) as date ";
  sql +=  "FROM playlists p ";
  sql +=  "JOIN kinds_playlists kp ON p.id = kp.playlist_id ";
  sql +=  "JOIN kinds k ON k.id = kp.kind_id ";
  sql +=  "WHERE k.id = " + kind + " ";
  //sql +=  "GROUP BY p_id ";
  sql +=  "ORDER BY date DESC ";
  sql +=  "LIMIT 20";
  db.transaction(function(tx) {
    tx.executeSql(sql, [], renderKindPlaylists, errorCB);
  }, errorCB);
}

function renderKindPlaylists(tx, playlists) {
  $('#kinds').hide();
  $('#kind').show();
  current_view = $('.ajax_content:visible');
  $('h1:visible').html(playlists.rows.item(0).kind_name);
  $('.kind_description:visible').html(playlists.rows.item(0).description);
  if (p.image.indexOf("default") != -1) {
    image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox/default.jpg';
  } else {
    image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox' + playlists.rows.item(0).kind_image.replace('/uploads','');
  }
  $('.kind_image:visible').css("background-image", "url(" + image + ")");  
  renderPlaylists(tx, playlists, 'false');
}

