function toggleSpinner(id) {
  var $btn = $('#' + id);
  var $a = $btn.find('a');
  $btn.toggleClass('loading'); 
  if ($a.text() != '') {
    $a.text('');
  } else {
    $a.text(id);
  }
}

function reset() {
  if (confirm('Etes vous sûr de vouloir réinitialiser la base de données?')) {
    toggleSpinner('reset');
    now = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log('Initializing database...');
    window.db.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS songs;');
      tx.executeSql('CREATE TABLE songs(id, name, image, file, duration, user_id, created_at, updated_at, artist_id);');
      tx.executeSql('DROP TABLE IF EXISTS playlists;');
      tx.executeSql('CREATE TABLE playlists(id, name, image, user_id, created_at, updated_at, description, published);');
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
      tx.executeSql('DROP TABLE IF EXISTS parameters;');
      tx.executeSql('CREATE TABLE parameters(id, name, value, created_at, updated_at);');
      tx.executeSql("INSERT INTO parameters (name, value) VALUES ('last_synchronization_date', '" + now + "');");
    }, errorCB);
    console.log('Database initialized.');
    getSqlData('');
    getFiles('', 'reset');
  }
}

function synchronize() {
  toggleSpinner('synchronize');
  getSynchronizationDate(function(last_sync_date) {
    console.log('Last sync was: ' + last_sync_date);
    getSqlData('?date=' + last_sync_date);
    getFiles(last_sync_date, 'synchronize');
  }); 
}

function getSynchronizationDate(callBack) {
  sql = "SELECT value from parameters where name= 'last_synchronization_date';";
  window.db.transaction(function(tx) {
    tx.executeSql(sql, [], function(tx, result) { callBack(result.rows.item(0).value); }, errorCB);
  }, errorCB);
}

function getSqlData(dateParam) {
  var url = current_server + dateParam;
  console.log('Retrieving SQL data from ' + url + '...');
  $.getJSON(url, function(data) {
    _.each(data.keys, function(key) { 
      removeDuplicates(key, data[key]);
      populate(key, data[key]);
    });
  });
  console.log('SQL data retrieved.');
}

function getFiles(date, id) {
  var url = 'http://10.1.2.123:8082/files';
  if (date != '') { url += '?date=' + date; } 

  console.log('Downloading files (images and music) from ' + url + '...');

  var ft = new FileTransfer();

  ft.download(
    encodeURI(url),
    window.appDirURL + '/files.zip',
    function(file) {
      url = file.toURL();
      file.file(function(fileObj) {
        if (fileObj.size > 1) {
          zip.unzip(url, url.replace('/files.zip', ''), function() {
            console.log('Files downloaded and unzipped.');
            updateLastSyncDate(date);
            toggleSpinner(id);
          });
        } else {
          console.log('No files to download!');
        }
      });
    },
    function(error) {
      console.log('Download failed: ' + error + ' (code: ' + error.code + ')');
      toggleSpinner(id);
    }
  );
}

function updateLastSyncDate(date) {
  if (date == '') { date = moment().format('YYYY-MM-DD HH:mm:ss'); }
  window.db.transaction(function(tx) {
    tx.executeSql("UPDATE parameters SET value = '" + date + "' WHERE name = 'last_synchronization_date';");
  }, errorCB);
  console.log('Last sync date updated to ' + date);
}

function populate(table, rows) {
  window.db.transaction(function(tx) {
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
  delete_sql = 'DELETE FROM ' + table + ' WHERE id IN (' + ids + ');';
  window.db.transaction(function(tx) { tx.executeSql(delete_sql); }, errorCB); 
}

function normalizeSql(attributes) {
  values = '';
  _.each(attributes, function(attribute, idx) {
    if (attribute == null) { values += 'NULL'; }
    else if (typeof(attribute) == 'object') { values += "'" + attribute.url + "'"; }
    else if (attribute == parseInt(attribute)) { values += attribute; }
    else { values += "'" + attribute.toString().replace("'", "''") + "'"; }
    values += ', '; 
  });
  return values.substring(0, values.length - 2);
}

function errorCB(err, tx) {
  console.log(tx);
  console.log(err);
}

function openDB() {
  window.db = openDatabase("Jukebox", "1.0", "Jukebox", 200000)
}

