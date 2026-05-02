/* global $, L */

/** Coordinates + labels for map markers (order matches typical tour listing). */
var TOUR_MAP_STOPS = [
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
  { lat: 25.033, lng: 121.5654, name: 'Taipei' },
  { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' },
  { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
];

/** Set by `initTourMap` — used to sync table hover/click with star markers. */
var tourMapMarkers = null;

/** Copy of `data/concerts.json` concerts array after registration select loads (submit validation). */
var registrationConcertsList = null;

var tourTableHoverStopIndex = null;
var tourTableStickyStopIndex = null;

$(function () {
  initTourMap();
  initConcertsTable();
  initMembersSection();
  initSongsPreview();
  initLotteryRegistration();
});

/**
 * @param {L.Marker} marker
 * @returns {HTMLElement|null}
 */
function tourMarkerIconEl(marker) {
  if (!marker) {
    return null;
  }
  if (typeof marker.getElement === 'function') {
    return marker.getElement();
  }
  return marker._icon || null;
}

/**
 * Toggle glow + scale on star markers from table interaction state.
 */
function syncTourMarkersTableHighlight() {
  if (!tourMapMarkers) {
    return;
  }
  tourMapMarkers.forEach(function (marker, i) {
    var root = tourMarkerIconEl(marker);
    if (!root) {
      return;
    }
    var inner = root.querySelector('.map-star-marker-inner');
    if (!inner) {
      return;
    }
    var on =
      i === tourTableHoverStopIndex || i === tourTableStickyStopIndex;
    inner.classList.toggle('map-star-marker-inner--highlight', on);
  });
}

/**
 * Map `concert.location` to marker index, or `-1` if unknown.
 * @param {string} location
 * @returns {number}
 */
function tourStopIndexFromLocation(location) {
  if (!location) {
    return -1;
  }
  for (var i = 0; i < TOUR_MAP_STOPS.length; i++) {
    if (TOUR_MAP_STOPS[i].name === location) {
      return i;
    }
  }
  return -1;
}

/**
 * Delegated hover + click on `#tour-dates-tbody` rows with `data-tour-stop-index`.
 */
function bindTourDatesToMapMarkers() {
  var $tbody = $('#tour-dates-tbody');
  if (!$tbody.length || !tourMapMarkers) {
    return;
  }

  $tbody
    .off('.tourMapLink')
    .on('mouseenter.tourMapLink', 'tr[data-tour-stop-index]', function () {
      tourTableHoverStopIndex = +$(this).attr('data-tour-stop-index');
      syncTourMarkersTableHighlight();
    })
    .on('mouseleave.tourMapLink', 'tr[data-tour-stop-index]', function () {
      tourTableHoverStopIndex = null;
      syncTourMarkersTableHighlight();
    })
    .on('click.tourMapLink', 'tr[data-tour-stop-index]', function () {
      var idx = +$(this).attr('data-tour-stop-index');
      if (Number.isNaN(idx)) {
        return;
      }
      if (tourTableStickyStopIndex === idx) {
        tourTableStickyStopIndex = null;
        $(this).removeClass('tour-date-row--active');
      } else {
        $tbody.find('tr.tour-date-row--active').removeClass('tour-date-row--active');
        tourTableStickyStopIndex = idx;
        $(this).addClass('tour-date-row--active');
      }
      syncTourMarkersTableHighlight();
    });
}

/**
 * Dashed tour legs in stop order; segment i→i+1 is animated (light blue + glow) if concert i has ended.
 * @param {L.Map} map
 * @param {Array<{ startsAt?: string }>|null} concerts same order as `TOUR_MAP_STOPS`, or null on load fail
 */
function addTourRoutePolylines(map, concerts) {
  for (var i = 0; i < TOUR_MAP_STOPS.length - 1; i++) {
    var a = TOUR_MAP_STOPS[i];
    var b = TOUR_MAP_STOPS[i + 1];
    var c = concerts && concerts[i];
    var ended = !!(c && isConcertRegistrationClosed(c));
    var animated = ended;
    var cls =
      'tour-route-line ' +
      (animated ? 'tour-route-line--animated' : 'tour-route-line--static');
    L.polyline(
      [
        [a.lat, a.lng],
        [b.lat, b.lng],
      ],
      {
        className: cls,
        interactive: false,
        weight: 2,
        opacity: 1,
      }
    ).addTo(map);
  }
}

/**
 * Leaflet map for five Asia tour cities (star markers).
 */
function initTourMap() {
  var $mapEl = $('#tour-map');
  if (!$mapEl.length || typeof L === 'undefined') {
    return;
  }

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

  var markers = TOUR_MAP_STOPS.map(function (city, i) {
    return L.marker([city.lat, city.lng], { icon: starIcon }).bindPopup(
      '<strong>' + (i + 1) + '. ' + city.name + '</strong>'
    );
  });

  tourMapMarkers = markers;

  var group = L.featureGroup(markers).addTo(map);
  map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 6 });

  $.getJSON('data/concerts.json')
    .done(function (data) {
      var list = data && data.concerts;
      addTourRoutePolylines(map, Array.isArray(list) ? list : null);
    })
    .fail(function () {
      addTourRoutePolylines(map, null);
    });
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
          '<tr class="tour-dates-status"><td colspan="3" class="text-warning">No concerts listed.</td></tr>'
        );
        return;
      }

      $tbody.empty();
      list.forEach(function (concert) {
        var $tr = $('<tr></tr>');
        var stopIdx = tourStopIndexFromLocation(concert.location);
        if (stopIdx >= 0) {
          $tr.addClass('tour-date-row');
          $tr.attr('data-tour-stop-index', String(stopIdx));
        }
        $tr.append(
          $('<td></td>').text(formatConcertDateTime(concert)),
          $('<td></td>').text(concert.location),
          $('<td></td>').text(concert.venue || '—')
        );
        $tbody.append($tr);
      });
      bindTourDatesToMapMarkers();
    })
    .fail(function () {
      $tbody.html(
        '<tr class="tour-dates-status"><td colspan="3" class="text-danger">Could not load tour dates. Please try again later.</td></tr>'
      );
    });
}

/**
 * Allow only `#RGB` / `#RRGGBB` for inline accent (from JSON).
 * @param {string} value
 * @returns {string}
 */
function sanitizeHexColor(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  var v = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
    return v;
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    return (
      '#' +
      v
        .slice(1)
        .split('')
        .map(function (c) {
          return c + c;
        })
        .join('')
    );
  }
  return '';
}

/**
 * Build member cards from `data/characters.json` (front / back flip).
 */
function initMembersSection() {
  var $root = $('#members-root');
  if (!$root.length) {
    return;
  }

  $.getJSON('data/characters.json')
    .done(function (data) {
      var list = data && data.characters;
      $root.empty();
      $('#members-mobile-picker').remove();

      if (!list || !list.length) {
        $root.append(
          '<div class="col-12 text-center text-warning">No members listed.</div>'
        );
        return;
      }

      var defaultMobileIdx = 0;
      for (var di = 0; di < list.length; di++) {
        var nm = list[di] && list[di].name;
        if (nm && String(nm).indexOf('Tomori') !== -1) {
          defaultMobileIdx = di;
          break;
        }
      }

      var $picker = $('<div/>', {
        id: 'members-mobile-picker',
        class: 'members-mobile-picker d-md-none',
        role: 'tablist',
        'aria-label': 'Select a member',
      });

      list.forEach(function (ch, index) {
        var esc = function (s) {
          return $('<div/>').text(s || '').html();
        };

        var name = esc(ch.name);
        var role = esc(ch.position);
        var altFront = esc(ch.name + ' — front');
        var altEnd = esc(ch.name + ' — back');

        var $col = $('<div class="col members-card-col"/>').attr(
          'id',
          'members-slot-' + index
        );
        var $article = $('<article class="card character-card character-card--themed h-100"/>');
        var accent = sanitizeHexColor(ch.color);
        if (accent) {
          $article.css('--character-accent', accent);
        }

        var $flipWrap = $(
          '<div class="character-flip-wrap character-flip-aspect" tabindex="0" role="button" aria-label="' +
            esc('Flip card: ' + ch.name) +
            '"/>'
        );

        var $inner = $('<div class="character-flip-inner"/>');
        var $front = $('<div class="character-face character-face-front"/>');
        var $back = $('<div class="character-face character-face-back"/>');

        $front.append(
          $('<img/>', {
            src: ch.img_front,
            alt: altFront,
            loading: 'lazy',
            decoding: 'async',
          })
        );
        $back.append(
          $('<img/>', {
            src: ch.img_end,
            alt: altEnd,
            loading: 'lazy',
            decoding: 'async',
          })
        );

        $inner.append($front, $back);
        $flipWrap.append($inner);

        var $body = $('<div class="card-body text-center pt-3 pb-3"/>');
        $body.append(
          $('<p class="small text-muted text-uppercase mb-1 fw-semibold"/>').html(role),
          $('<h3 class="h5 card-title mb-0"/>').html(name)
        );

        $article.append($flipWrap, $body);
        $col.append($article);

        if (window.matchMedia('(hover: none)').matches) {
          $flipWrap.on('click', function () {
            $(this).toggleClass('is-flipped');
          });
        }

        $flipWrap.on('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') {
            return;
          }
          e.preventDefault();
          $(this).toggleClass('is-flipped');
        });

        $root.append($col);

        var $pickBtn = $('<button type="button" class="btn btn-sm members-mobile-pick-btn"/>')
          .text(ch.name || 'Member')
          .attr('data-member-index', String(index))
          .attr('role', 'tab')
          .attr('aria-controls', 'members-slot-' + index)
          .attr('aria-selected', index === defaultMobileIdx ? 'true' : 'false');
        if (index === defaultMobileIdx) {
          $pickBtn.addClass('active');
        }
        $picker.append($pickBtn);
      });

      $root.before($picker);

      $root.children('.members-card-col').removeClass('is-members-mobile-active');
      $root
        .children('.members-card-col')
        .eq(defaultMobileIdx)
        .addClass('is-members-mobile-active');

      $picker.on('click', 'button.members-mobile-pick-btn', function () {
        var idx = parseInt($(this).attr('data-member-index'), 10);
        if (Number.isNaN(idx)) {
          return;
        }
        $picker.find('button').removeClass('active').attr('aria-selected', 'false');
        $(this).addClass('active').attr('aria-selected', 'true');
        $root.find('.members-card-col').removeClass('is-members-mobile-active');
        $root.children('.members-card-col').eq(idx).addClass('is-members-mobile-active');
        $root.find('.character-flip-wrap.is-flipped').removeClass('is-flipped');
      });
    })
    .fail(function () {
      $('#members-mobile-picker').remove();
      $root.html(
        '<div class="col-12 text-center text-danger">Could not load members. Please try again later.</div>'
      );
    });
}

/**
 * Parse stored iframe HTML; return embed URL only for youtube.com/embed/…
 * @param {string} iframeHtml
 * @returns {string}
 */
function extractYouTubeEmbedSrc(iframeHtml) {
  if (!iframeHtml || typeof iframeHtml !== 'string') {
    return '';
  }
  var m = iframeHtml.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  if (!m) {
    return '';
  }
  var src = m[1];
  if (!/^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/i.test(src)) {
    return '';
  }
  return src;
}

/**
 * @param {string} embedSrc
 * @param {string} songName
 * @returns {JQuery<HTMLIFrameElement>}
 */
function buildPreviewIframe(embedSrc, songName) {
  return $('<iframe/>', {
    class: 'w-100 h-100 border-0',
    src: embedSrc,
    title: songName ? 'MV — ' + songName : 'YouTube video player',
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowfullscreen: true,
    referrerpolicy: 'strict-origin-when-cross-origin',
  });
}

/**
 * Show a transparent layer over the MV only while the MP3 is playing, so clicks pause the song
 * without blocking YouTube when audio is paused.
 */
function syncSongPauseOverlay() {
  var el = document.getElementById('works-preview-audio');
  var $overlay = $('#preview-mv-host .preview-mv-song-pause-overlay');
  if (!$overlay.length) {
    return;
  }
  if (el && !el.paused) {
    $overlay.removeClass('d-none');
  } else {
    $overlay.addClass('d-none');
  }
}

/**
 * @param { { name: string, embedSrc: string } } song
 */
function renderSongPreview(song) {
  var $mvHost = $('#preview-mv-host');
  if (!$mvHost.length || !song || !song.embedSrc) {
    return;
  }
  var $iframe = buildPreviewIframe(song.embedSrc, song.name);
  var $overlay = $('<div/>', {
    class: 'preview-mv-song-pause-overlay position-absolute top-0 start-0 w-100 h-100 d-none',
    'aria-hidden': 'true',
    title: 'Click to pause song preview',
  });
  $mvHost.empty().append($iframe, $overlay);
  syncSongPauseOverlay();
}

/**
 * MV + MP3 preview: same indices for `#js-nav-song-list` and `#preview-song-list`.
 * @param { { name: string, embedSrc: string, audioSrc: string } } song
 * @param {number} index
 * @param {boolean} playAudio only true after explicit user activation (click).
 */
function applyWorkSelection(song, index, playAudio) {
  if (!song) {
    return;
  }
  renderSongPreview(song);

  var $audio = $('#works-preview-audio');
  if ($audio.length && song.audioSrc) {
    var el = $audio[0];
    el.src = song.audioSrc;
    el.load();
    if (playAudio) {
      el.play().catch(function () {});
    }
  }

  var $btns = $('#preview-song-list button[data-song-index]');
  $btns.removeClass('active');
  $btns.filter('[data-song-index="' + index + '"]').addClass('active');

  syncSongPauseOverlay();
}

/**
 * Load `data/songs.json`, fill navbar dropdown + preview list, wire MV + audio.
 */
function initSongsPreview() {
  var $navList = $('#js-nav-song-list');
  var $songList = $('#preview-song-list');
  var $mvHost = $('#preview-mv-host');
  if (!$songList.length || !$mvHost.length) {
    return;
  }

  $('#preview-mv-wrap')
    .off('click.previewSongPause')
    .on('click.previewSongPause', '.preview-mv-song-pause-overlay', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var el = document.getElementById('works-preview-audio');
      if (el && !el.paused) {
        el.pause();
      }
    });

  $.getJSON('data/songs.json')
    .done(function (data) {
      var songs = (data && data.songs) || [];
      var normalized = [];

      songs.forEach(function (raw) {
        if (!raw) {
          return;
        }
        var name = raw.name || raw.title || 'Track';
        var embedSrc = extractYouTubeEmbedSrc(raw.iframe);
        var audioSrc = raw.audio && String(raw.audio).trim();
        if (!embedSrc || !audioSrc) {
          return;
        }
        normalized.push({ name: name, embedSrc: embedSrc, audioSrc: audioSrc });
      });

      if (!normalized.length) {
        $songList.html('<li class="text-warning small">No playable works (need MV + audio paths).</li>');
        if ($navList.length) {
          $navList.html(
            '<li><span class="dropdown-item-text text-muted small">No tracks</span></li>'
          );
        }
        return;
      }

      function selectByIndex(idx, playAudio) {
        if (Number.isNaN(idx) || !normalized[idx]) {
          return;
        }
        applyWorkSelection(normalized[idx], idx, playAudio);
      }

      var userExplicitChoice = false;

      if ($navList.length) {
        $navList.empty();
        $navList.append('<li><h6 class="dropdown-header">Preview works</h6></li>');
        normalized.forEach(function (s, i) {
          var $btn = $('<button type="button" class="dropdown-item"></button>')
            .text(s.name)
            .attr('data-song-index', String(i));
          $navList.append($('<li></li>').append($btn));
        });
        $navList.append('<li><hr class="dropdown-divider" /></li>');
        $navList.append(
          $('<li></li>').append(
            $('<a class="dropdown-item" href="#row-preview">Open preview player</a>')
          )
        );

        $navList.on('click', 'button[data-song-index]', function () {
          userExplicitChoice = true;
          var idx = parseInt($(this).attr('data-song-index'), 10);
          selectByIndex(idx, true);
          updateWorksFloatControl();
        });
      }

      $songList.empty();
      normalized.forEach(function (s, i) {
        var $btn = $(
          '<button type="button" class="btn btn-sm works-preview-track-btn"></button>'
        )
          .text(s.name)
          .attr('data-song-index', String(i));
        $songList.append($('<li></li>').append($btn));
      });

      $songList.on('click', 'button[data-song-index]', function () {
        userExplicitChoice = true;
        var idx = parseInt($(this).attr('data-song-index'), 10);
        selectByIndex(idx, true);
        updateWorksFloatControl();
      });

      var $float = $('#works-float-control');
      var $audio = $('#works-preview-audio');

      function updateWorksFloatControl() {
        if (!$float.length) {
          return;
        }
        var el = $audio.length ? $audio[0] : null;
        var paused = !el || el.paused;
        $float
          .find('i')
          .attr('class', paused ? 'bi bi-play-fill fs-4' : 'bi bi-pause-fill fs-4');
        $float.attr(
          'aria-label',
          paused
            ? 'Play preview, or pick a random work if none chosen yet'
            : 'Pause work preview'
        );
      }

      if ($audio.length) {
        $audio.on('play pause ended', function () {
          updateWorksFloatControl();
          syncSongPauseOverlay();
        });
      }

      if ($float.length) {
        $float.removeClass('d-none');
        $float.on('click', function () {
          var el = $audio.length ? $audio[0] : null;
          if (!el || !normalized.length) {
            return;
          }
          if (!userExplicitChoice) {
            var ri = Math.floor(Math.random() * normalized.length);
            userExplicitChoice = true;
            selectByIndex(ri, true);
            updateWorksFloatControl();
            return;
          }
          if (el.paused) {
            el.play().catch(function () {});
          } else {
            el.pause();
          }
          updateWorksFloatControl();
        });
      }

      selectByIndex(0, false);
      updateWorksFloatControl();
    })
    .fail(function () {
      $('#works-float-control').addClass('d-none');
      $songList.html(
        '<li class="text-danger small">Could not load songs. Serve the site over HTTP (e.g. Live Server).</li>'
      );
      if ($navList.length) {
        $navList.html(
          '<li><span class="dropdown-item-text text-danger small">Could not load tracks</span></li>'
        );
      }
    });
}

/**
 * Lottery registration UI: payment toggles + simulated submit (nothing stored).
 */
function initLotteryRegistration() {
  var $form = $('#lottery-register-form');
  if (!$form.length) {
    return;
  }

  var $concert = $('#reg-concert');
  var $hiddenPay = $('#reg-payment-method');
  var $payBtns = $('.reg-payment-btn');

  function concertAtRegistrationIndex(i) {
    if (!registrationConcertsList || i < 0 || i >= registrationConcertsList.length) {
      return null;
    }
    return registrationConcertsList[i];
  }

  if ($concert.length) {
    $.getJSON('data/concerts.json')
      .done(function (data) {
        var list = data && data.concerts;
        registrationConcertsList = Array.isArray(list) ? list : [];
        $concert.empty();
        $concert.append(
          $('<option>', {
            value: '',
            text: 'Choose a concert…',
            disabled: true,
            selected: true,
          })
        );
        registrationConcertsList.forEach(function (concert, i) {
          var ended = isConcertRegistrationClosed(concert);
          var label =
            concert.location +
            ' — ' +
            formatConcertDateTime(concert) +
            (ended ? ' -- ended' : '');
          $concert.append(
            $('<option>', {
              value: String(i),
              text: label,
              disabled: ended,
            })
          );
        });
        if (!registrationConcertsList.length) {
          $concert.empty().append(
            $('<option>', {
              value: '',
              text: 'No concerts listed',
              disabled: true,
              selected: true,
            })
          );
        }
      })
      .fail(function () {
        registrationConcertsList = null;
        $concert.empty().append(
          $('<option>', {
            value: '',
            text: 'Could not load concerts',
            disabled: true,
            selected: true,
          })
        );
      });

    $concert.on('change', function () {
      $(this).removeClass('is-invalid');
    });
  }

  $payBtns.on('click', function () {
    var $btn = $(this);
    $payBtns.removeClass('active');
    $btn.addClass('active');
    $hiddenPay.val(String($btn.data('payment') || 'paypal'));
  });

  $form.on('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if ($concert.length) {
      var raw = $concert.val();
      var idx = parseInt(raw, 10);
      var picked = concertAtRegistrationIndex(idx);
      if (!picked || isConcertRegistrationClosed(picked)) {
        $concert.addClass('is-invalid');
        $form.addClass('was-validated');
        return;
      }
      $concert.removeClass('is-invalid');
    }

    if (!$form[0].checkValidity()) {
      $form.addClass('was-validated');
      return;
    }

    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank', 'noopener,noreferrer');
  });
}
