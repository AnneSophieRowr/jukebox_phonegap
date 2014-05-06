function renderFlow2(playlists) {
  if (playlists.rows.length != 0) {
    flow = '';
    for (i = 0; i < playlists.rows.length; i++) {
      p = playlists.rows.item(i);
      if (p.image.indexOf("default") != -1) {
        image = current_url + '/default.jpg';
      } else {
        image = current_url + p.image.replace('/uploads','');
      }
      flow += '<img class="item" src="' + image + '" id="playlist_'+ i + '"/>';
    }
    current_view.find('.imageflow').html(flow);
    imageflow();
  }
}

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

function imageflow() {
  window.instanceOne = new ImageFlow();
  window.instanceOne.init({ aspectRatio: 2.333, xStep: 100, imagesHeight: 0.50, circular: true, ImageFlowID: window.current_flow, reflections: false, reflectionP: 0.0, slider: false, captions: false});
}

function moveFlow(id) {
  window.currentFlow.moveTo(id - 1);
}

function moveFlow2(id) {
  window.instanceOne = new ImageFlow();
  window.instanceOne.init({ aspectRatio: 2.333, xStep: 100, imagesHeight: 0.50, circular: true, ImageFlowID: window.current_flow, reflections: false, reflectionP: 0.0, slider: false, captions: false, startID: id});
}

