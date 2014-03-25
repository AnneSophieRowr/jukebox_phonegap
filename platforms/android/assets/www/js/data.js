function initialize() {
  if (confirm('Etes vous sûr de vouloir réinitialiser la base de données?')) {
    db = openDB();
    console.log('Initializing database...');
    db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS songs;');
      tx.executeSql('CREATE TABLE songs(id, name, image, file, duration, user_id, created_at, updated_at, artist_id);');
      tx.executeSql('DROP TABLE IF EXISTS playlists;');
      tx.executeSql('CREATE TABLE playlists(id, name, image, user_id, created_at, updated_at, description);');
      tx.executeSql('DROP TABLE IF EXISTS playlists_songs;');
      tx.executeSql('CREATE TABLE playlists_songs(id, playlist_id, song_id, position, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS kinds;');
      tx.executeSql('CREATE TABLE kinds(id, name, created_at, updated_at, image, visible, description);');
      tx.executeSql('DROP TABLE IF EXISTS kinds_playlists;');
      tx.executeSql('CREATE TABLE kinds_playlists(id, kind_id, playlist_id, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS types;');
      tx.executeSql('CREATE TABLE types(id, name, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS playlists_types;');
      tx.executeSql('CREATE TABLE playlists_types(id, playlist_id, type_id, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS artists;');
      tx.executeSql('CREATE TABLE artists(id, name, image, description, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS albums;');
      tx.executeSql('CREATE TABLE albums(id, name, image, year, artist_id, created_at, updated_at);');
      tx.executeSql('DROP TABLE IF EXISTS albums_songs;');
      tx.executeSql('CREATE TABLE albums_songs(id, album_id, song_id, position, updated_at);');
    }, errorCB);
    console.log('Database initialized.');
  }
}

function synchronize() {
  //var url = 'http://127.0.0.1:3000/synchronize?date=2014-01-01';
  var url = 'http://10.1.2.123:8082/synchronize?date=2014-01-01';
  console.log('Synchronizing SQL data...');
  $.getJSON(url, function(data) {
    _.each(data.keys, function(key) { 
      removeDuplicates(key, data[key]);
      populate(key, data[key]);
    });
  });
  console.log('SQL data synchronized.');
}

function transfer() {
  console.log('Downloading file to: ' + window.appDir);
  var ft = new FileTransfer();
  ft.download(
    'http://10.1.2.123:8082/files?date=2014-01-01',
    window.appDirURL + '/files.zip',
    function(file) {
      url = file.toURL();
      console.log('Download complete: ' + file.fullPath);
      zip.unzip(url, url.replace('/files.zip', ''), function() {});
    },
    function(error) {
      console.log('Download failed: ' + error + ' (code: ' + error.code + ')');
    }
  );
}

function populate(table, rows) {
  db = openDB();
  db.transaction(function(tx) {
    _.each(rows, function(row) {
      insert_sql = 'INSERT INTO ' + table + ' values (';
      insert_sql += normalizeSql(row);
      insert_sql += ')';
      tx.executeSql(insert_sql);
    });
  }, errorCB);
}

function removeDuplicates(table, data) {
  ids = _.pluck(data, "id").join(', ');
  db = openDB();
  delete_sql = 'DELETE FROM ' + table + ' WHERE id IN (' + ids + ');';
  db.transaction(function(tx) { tx.executeSql(delete_sql); }, errorCB); 
}

function normalizeSql(attributes, last_attribute) {
  values = '';
  _.each(attributes, function(attribute, idx) {
    if (attribute == null) { values += 'NULL'; }
    else if (typeof(attribute) == 'object') { values += "'" + attribute.url + "'"; }
    else if (attribute == parseInt(attribute)) { values += attribute; }
    else { values += "'" + attribute + "'"; }
    values += ', '; 
  });
  return values.substring(0, values.length - 2);
}

function errorCB(tx, err) {
  console.log(tx);
  console.log(err);
}

function openDB() {
  return window.openDatabase("Jukebox", "1.0", "Jukebox", 200000)
}

