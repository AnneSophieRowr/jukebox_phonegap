function renderFlow(playlists) {
  if (playlists.rows.length != 0) {
    flow = '';
    for (i = 0; i < playlists.rows.length; i++) {
      p = playlists.rows.item(i);
      if (p.image.indexOf("default") != -1) {
        image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox/default.jpg';
      } else {
        image = 'file:///storage/emulated/0/android/data/com.bpi.jukebox' + p.image.replace('/uploads','');
      }
      //image = 'http://127.0.0.1:3000' + p.image;
      flow += '<img class="item" src="' + image + '" id="'+ i + '"/>';
    }
    current_view.find('.imageflow').html(flow);
    imageflow();
  }
}

function imageflow() {
  //if (typeof window.instanceOne === 'undefined') {
  window.instanceOne = new ImageFlow();
  window.instanceOne.init({ aspectRatio: 2.333, xStep: 100, imagesHeight: 0.50, circular: true, ImageFlowID: window.current_flow, reflections: false, reflectionP: 0.0, slider: false, captions: false});
  //}
}

function moveFlow(id) {
  window.instanceOne = new ImageFlow();
  window.instanceOne.init({ aspectRatio: 2.333, xStep: 100, imagesHeight: 0.50, circular: true, ImageFlowID: window.current_flow, reflections: false, reflectionP: 0.0, slider: false, captions: false, startID: id});
}

