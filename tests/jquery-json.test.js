/**
 * @jest-environment jsdom
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FIX = path.join(__dirname, 'fixtures');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(FIX, name), 'utf8'));
}

const PAGE_HTML = `
<table><tbody id="tour-dates-tbody"></tbody></table>
<div id="members-root" class="row g-3"></div>
<ul id="preview-song-list" class="list-unstyled"></ul>
<div id="preview-mv-wrap">
  <div id="preview-mv-host" class="ratio ratio-16x9"></div>
</div>
<audio id="works-preview-audio" controls></audio>
<ul id="js-nav-song-list" class="dropdown-menu"></ul>
<button type="button" id="works-float-control" class="d-none"><i></i></button>
<form id="lottery-register-form" novalidate>
  <select id="reg-concert" name="concert"></select>
  <input type="hidden" id="reg-payment-method" value="paypal" />
  <button type="button" class="reg-payment-btn active" data-payment="paypal">PayPal</button>
  <button type="button" class="reg-payment-btn" data-payment="card">Card</button>
  <input type="text" name="tier" value="A" required />
  <button type="submit" id="reg-submit-test">Submit</button>
</form>
`;

function installMediaAndMatchMedia() {
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function () {
    return Promise.resolve();
  });
  jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function () {});
  jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(function () {});

  window.matchMedia = jest.fn().mockImplementation(function () {
    return {
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });
}

/**
 * @param {object} opts
 * @param {object} [opts.concertsPayload]
 * @param {boolean} [opts.failConcerts]
 * @param {object} [opts.charactersPayload]
 * @param {boolean} [opts.failCharacters]
 * @param {object} [opts.songsPayload]
 * @param {boolean} [opts.failSongs]
 */
async function loadAppWithMockedGetJSON(opts) {
  jest.resetModules();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-04-01T12:00:00Z'));

  document.body.innerHTML = PAGE_HTML;
  var $ = require('jquery')(window);
  global.window = window;
  global.jQuery = global.$ = window.jQuery = window.$ = $;

  const ct = require('../js/concert-time.js');
  global.formatConcertDateTime = ct.formatConcertDateTime;
  global.isConcertRegistrationClosed = ct.isConcertRegistrationClosed;

  const concertsPayload =
    opts.concertsPayload !== undefined ? opts.concertsPayload : readJson('concerts.json');
  const charactersPayload =
    opts.charactersPayload !== undefined
      ? opts.charactersPayload
      : readJson('characters.json');
  const songsPayload =
    opts.songsPayload !== undefined ? opts.songsPayload : readJson('songs.json');

  $.getJSON = jest.fn(function (url) {
    var d = $.Deferred();
    queueMicrotask(function () {
      try {
        if (String(url).indexOf('concerts.json') !== -1) {
          if (opts.failConcerts) {
            d.reject(new Error('network'));
          } else {
            d.resolve(concertsPayload);
          }
        } else if (String(url).indexOf('characters.json') !== -1) {
          if (opts.failCharacters) {
            d.reject(new Error('network'));
          } else {
            d.resolve(charactersPayload);
          }
        } else if (String(url).indexOf('songs.json') !== -1) {
          if (opts.failSongs) {
            d.reject(new Error('network'));
          } else {
            d.resolve(songsPayload);
          }
        } else {
          d.reject(new Error('unknown url'));
        }
      } catch (e) {
        d.reject(e);
      }
    });
    return d.promise();
  });

  installMediaAndMatchMedia();
  require('../js/app.js');

  for (var i = 0; i < 30; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
  await new Promise(function (r) {
    setImmediate(r);
  });

  jest.useRealTimers();
}

afterEach(function () {
  jest.useRealTimers();
  jest.restoreAllMocks();
  document.body.innerHTML = '';
  delete global.formatConcertDateTime;
  delete global.isConcertRegistrationClosed;
  delete global.jQuery;
  delete global.$;
});

describe('Dynamic DOM from JSON ($.getJSON + jQuery)', () => {
  test('tour table: one row per concert, map-linked city gets data-tour-stop-index', async () => {
    await loadAppWithMockedGetJSON({});
    var $rows = $('#tour-dates-tbody tr');
    expect($rows.length).toBe(5);
    var $tokyo = $rows.filter(function () {
      return $(this).find('td').eq(1).text() === 'Tokyo';
    });
    expect($tokyo.length).toBe(1);
    expect($tokyo.attr('data-tour-stop-index')).toBe('0');
    expect($tokyo.hasClass('tour-date-row')).toBe(true);
    expect($tokyo.find('td').length).toBe(3);
    expect($tokyo.find('td').eq(2).text()).toContain('Tokyo Dome');
  });

  test('tour table: empty concerts list shows status row', async () => {
    await loadAppWithMockedGetJSON({ concertsPayload: { concerts: [] } });
    var $status = $('#tour-dates-tbody tr.tour-dates-status');
    expect($status.length).toBe(1);
    expect($status.text()).toMatch(/No concerts listed/i);
  });

  test('tour table: failed concerts fetch shows error row', async () => {
    await loadAppWithMockedGetJSON({ failConcerts: true });
    var $err = $('#tour-dates-tbody tr.tour-dates-status');
    expect($err.length).toBe(1);
    expect($err.text()).toMatch(/Could not load tour dates/i);
  });

  test('members: one card per character, mobile picker defaults Tomori active', async () => {
    await loadAppWithMockedGetJSON({});
    expect($('#members-root .members-card-col').length).toBe(5);
    expect($('#members-root article.character-card').length).toBe(5);
    var $tomoriCol = $('#members-root .members-card-col').filter(function () {
      return $(this).find('h3').text().indexOf('Tomori') !== -1;
    });
    expect($tomoriCol.length).toBe(1);
    expect($tomoriCol.hasClass('is-members-mobile-active')).toBe(true);
    expect($('#members-mobile-picker button.members-mobile-pick-btn.active').text()).toMatch(
      /Tomori/
    );
    expect(
      $('#members-root img[alt*="Tomori"]').filter('[src*="tmr_front"]').length
    ).toBeGreaterThanOrEqual(1);
  });

  test('members: failed fetch shows error message', async () => {
    await loadAppWithMockedGetJSON({ failCharacters: true });
    expect($('#members-root .text-danger').length).toBe(1);
    expect($('#members-root').text()).toMatch(/Could not load members/i);
  });

  test('works preview: song buttons match JSON count; first track active; MV iframe uses embed URL', async () => {
    await loadAppWithMockedGetJSON({});
    expect($('#preview-song-list button[data-song-index]').length).toBe(3);
    expect($('#preview-song-list button.active').text()).toBe('Mayoiuta');
    var $iframe = $('#preview-mv-host iframe');
    expect($iframe.length).toBe(1);
    expect($iframe.attr('src')).toMatch(/^https:\/\/www\.youtube\.com\/embed\/w-Gvclnnfpc/);
    expect($iframe.attr('title')).toMatch(/Mayoiuta/);
    expect($('#works-preview-audio').attr('src')).toMatch(/Mayoiuta\.mp3/);
  });

  test('works preview: no valid playable songs shows warning in list', async () => {
    await loadAppWithMockedGetJSON({
      songsPayload: {
        songs: [{ name: 'Broken', audio: '', iframe: '<iframe src="https://evil.example/"></iframe>' }],
      },
    });
    expect($('#preview-song-list li.text-warning').length).toBe(1);
    expect($('#preview-song-list').text()).toMatch(/No playable works/i);
  });

  test('works preview: failed songs fetch shows error copy', async () => {
    await loadAppWithMockedGetJSON({ failSongs: true });
    expect($('#preview-song-list li.text-danger').length).toBe(1);
    expect($('#preview-song-list').text()).toMatch(/Could not load songs/i);
  });

  test('registration: concert select gets placeholder plus one option per concert', async () => {
    await loadAppWithMockedGetJSON({});
    var $opts = $('#reg-concert option');
    expect($opts.length).toBe(6);
    expect($opts.eq(0).text()).toMatch(/Choose a concert/i);
    expect($opts.eq(1).val()).toBe('0');
    expect($opts.eq(1).text()).toMatch(/Tokyo/);
    expect($opts.eq(1).text()).toMatch(/May 1, 2026/);
    expect($opts.eq(1).prop('disabled')).toBe(false);
  });

  test('registration: failed concerts load shows disabled status option', async () => {
    await loadAppWithMockedGetJSON({ failConcerts: true });
    var $opts = $('#reg-concert option');
    expect($opts.length).toBe(1);
    expect($opts.eq(0).text()).toMatch(/Could not load concerts/i);
    expect($opts.eq(0).prop('disabled')).toBe(true);
  });
});
