/* global $, L */

$(function () {
  initTourMap();
  initConcertsTable();
});

/**
 * Leaflet map for five Asia tour cities (star markers).
 */
function initTourMap() {
  var $mapEl = $('#tour-map');
  if (!$mapEl.length || typeof L === 'undefined') {
    return;
  }

  var tourStops = [
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
    { lat: 25.033, lng: 121.5654, name: 'Taipei' },
    { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
    { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  ];

  var starIcon = L.divIcon({
    className: 'map-star-marker',
    html:
      '<span class="map-star-marker-inner"><i class="bi bi-star-fill" aria-hidden="true"></i></span>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  var map = L.map('tour-map', {
    scrollWheelZoom: true,
    worldCopyJump: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  var markers = tourStops.map(function (city, i) {
    return L.marker([city.lat, city.lng], { icon: starIcon }).bindPopup(
      '<strong>' + (i + 1) + '. ' + city.name + '</strong>'
    );
  });

  var group = L.featureGroup(markers).addTo(map);
  map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 6 });
}

/**
 * Format a concert start time in the venue's IANA time zone (local civil time + offset).
 * @param { { startsAt: string, timeZone: string } } concert
 * @returns {string}
 */
function formatConcertDateTime(concert) {
  var d = new Date(concert.startsAt);
  if (Number.isNaN(d.getTime())) {
    return concert.startsAt;
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: concert.timeZone,
  }).format(d);
}

/**
 * Build the tour schedule table from `data/concerts.json`.
 */
function initConcertsTable() {
  var $tbody = $('#tour-dates-tbody');
  if (!$tbody.length) {
    return;
  }

  $.getJSON('data/concerts.json')
    .done(function (data) {
      var list = data && data.concerts;
      if (!list || !list.length) {
        $tbody.html(
          '<tr><td colspan="3" class="text-warning">No concerts listed.</td></tr>'
        );
        return;
      }

      $tbody.empty();
      list.forEach(function (concert) {
        var $tr = $('<tr></tr>');
        $tr.append(
          $('<td></td>').text(formatConcertDateTime(concert)),
          $('<td></td>').text(concert.location),
          $('<td></td>').text(concert.venue || '—')
        );
        $tbody.append($tr);
      });
    })
    .fail(function () {
      $tbody.html(
        '<tr><td colspan="3" class="text-danger">Could not load tour dates. Please try again later.</td></tr>'
      );
    });
}
