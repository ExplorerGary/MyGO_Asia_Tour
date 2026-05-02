/**
 * Concert local-time helpers (shared by the site and Jest).
 * UMD: browser attaches globals; Node/Jest uses module.exports.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var api = factory();
    root.formatConcertDateTime = api.formatConcertDateTime;
    root.isConcertRegistrationClosed = api.isConcertRegistrationClosed;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Format a concert start time in the venue's IANA time zone (local civil time).
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
   * Whether the concert's start instant is in the past (registration closed for that show).
   * @param { { startsAt: string } } concert
   * @returns {boolean}
   */
  function isConcertRegistrationClosed(concert) {
    if (!concert || !concert.startsAt) {
      return true;
    }
    var startMs = new Date(concert.startsAt).getTime();
    if (Number.isNaN(startMs)) {
      return true;
    }
    return Date.now() >= startMs;
  }

  return {
    formatConcertDateTime: formatConcertDateTime,
    isConcertRegistrationClosed: isConcertRegistrationClosed,
  };
});
