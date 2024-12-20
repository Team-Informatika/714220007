import Map from 'https://cdn.skypack.dev/ol/Map.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import {easeIn, easeOut} from 'https://cdn.skypack.dev/ol/easing.js';
import {fromLonLat} from 'https://cdn.skypack.dev/ol/proj.js';

const ulbi = fromLonLat([-6.874454110067454, 107.57572122651061]);
const polban = fromLonLat([-6.872041751278984, 107.5737526524957]);
const upi = fromLonLat([-6.861757872258694, 107.59352682816706]);
const itb = fromLonLat([-6.890141875543031, 107.61028578153878]);
const bku = fromLonLat([-6.890141875543031, 107.61028578153878]);

const view = new View({
  center: upi,
  zoom: 6,
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      preload: 4,
      source: new OSM(),
    }),
  ],
  view: view,
});

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
function bounce(t) {
  const s = 7.5625;
  const p = 2.75;
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else {
    if (t < 2 / p) {
      t -= 1.5 / p;
      l = s * t * t + 0.75;
    } else {
      if (t < 2.5 / p) {
        t -= 2.25 / p;
        l = s * t * t + 0.9375;
      } else {
        t -= 2.625 / p;
        l = s * t * t + 0.984375;
      }
    }
  }
  return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
function elastic(t) {
  return (
    Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
  );
}

function onClick(id, callback) {
  document.getElementById(id).addEventListener('click', callback);
}

onClick('rotate-left', function () {
  view.animate({
    rotation: view.getRotation() + Math.PI / 2,
  });
});

onClick('rotate-right', function () {
  view.animate({
    rotation: view.getRotation() - Math.PI / 2,
  });
});

onClick('rotate-around-itb', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const rotation = view.getRotation();
  view.animate(
    {
      rotation: rotation + Math.PI,
      anchor: itb,
      easing: easeIn,
    },
    {
      rotation: rotation + 2 * Math.PI,
      anchor: itb,
      easing: easeOut,
    },
  );
});

onClick('pan-to-ulbi', function () {
  view.animate({
    center: ulbi,
    duration: 2000,
  });
});

onClick('elastic-to-polban', function () {
  view.animate({
    center: polban,
    duration: 2000,
    easing: elastic,
  });
});

onClick('bounce-to-upi', function () {
  view.animate({
    center: upi,
    duration: 2000,
    easing: bounce,
  });
});

onClick('spin-to-itb', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const center = view.getCenter();
  view.animate(
    {
      center: [
        center[0] + (itb[0] - center[0]) / 2,
        center[1] + (itb[1] - center[1]) / 2,
      ],
      rotation: Math.PI,
      easing: easeIn,
    },
    {
      center: itb,
      rotation: 2 * Math.PI,
      easing: easeOut,
    },
  );
});

function flyTo(location, done) {
  const duration = 2000;
  const zoom = view.getZoom();
  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback,
  );
  view.animate(
    {
      zoom: zoom - 1,
      duration: duration / 2,
    },
    {
      zoom: zoom,
      duration: duration / 2,
    },
    callback,
  );
}

onClick('fly-to-bku', function () {
  flyTo(bku, function () {});
});

function tour() {
  const locations = [ulbi, bku, itb, polban, upi];
  let index = -1;
  function next(more) {
    if (more) {
      ++index;
      if (index < locations.length) {
        const delay = index === 0 ? 0 : 750;
        setTimeout(function () {
          flyTo(locations[index], next);
        }, delay);
      } else {
        alert('Tour complete');
      }
    } else {
      alert('Tour cancelled');
    }
  }
  next(true);
}

onClick('tour', tour);
