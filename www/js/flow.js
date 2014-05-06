function renderFlow(playlists) {
  if (playlists.rows.length != 0) {
    for (i = 0; i < playlists.rows.length; i++) {
      p = playlists.rows.item(i);
      if (p.image.indexOf("default") != -1) {
        image = current_url + '/default.jpg';
      } else {
        image = current_url + p.image.replace('/uploads','');
      }
      var img = document.createElement("img");
      img.setAttribute('class', 'item');
      img.setAttribute('src', image);
      img.setAttribute('id', p.id);
      window.currentFlow.addItem(img, 'last');
    }
  }
}

function moveFlow(id) {
  window.currentFlow.moveTo(id - 1);
}

