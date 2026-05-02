'use strict';

const path = require('path');
const fs = require('fs');
const {
  formatConcertDateTime,
  isConcertRegistrationClosed,
} = require('../js/concert-time.js');

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'concerts.json');

describe('formatConcertDateTime', () => {
  test('returns raw startsAt when the date is invalid', () => {
    const concert = {
      startsAt: 'not-a-real-iso-date',
      timeZone: 'Asia/Tokyo',
    };
    expect(formatConcertDateTime(concert)).toBe('not-a-real-iso-date');
  });

  test('formats Tokyo fixture in venue local civil time (en-US full + short)', () => {
    const concert = {
      startsAt: '2026-05-01T10:00:00+09:00',
      timeZone: 'Asia/Tokyo',
    };
    const out = formatConcertDateTime(concert);
    expect(out).toMatch(/Friday,\s+May\s+1,\s+2026/);
    expect(out).toMatch(/10:00/);
    expect(out).toMatch(/AM/);
  });

  test('formats Singapore finale from fixture file', () => {
    const raw = fs.readFileSync(FIXTURE_PATH, 'utf8');
    const data = JSON.parse(raw);
    const sg = data.concerts.find(function (c) {
      return c.location === 'Singapore';
    });
    const out = formatConcertDateTime(sg);
    expect(out).toMatch(/Saturday,\s+August\s+15,\s+2026/);
    expect(out).toMatch(/8:00/);
    expect(out).toMatch(/PM/);
  });

  test('shows correct local calendar day when UTC instant falls on previous date in LA', () => {
    const concert = {
      startsAt: '2026-01-15T05:00:00Z',
      timeZone: 'America/Los_Angeles',
    };
    const out = formatConcertDateTime(concert);
    expect(out).toMatch(/Wednesday,\s+January\s+14,\s+2026/);
    expect(out).toMatch(/9:00/);
    expect(out).toMatch(/PM/);
  });
});

describe('isConcertRegistrationClosed', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('treats missing concert or startsAt as closed', () => {
    jest.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    expect(isConcertRegistrationClosed(null)).toBe(true);
    expect(isConcertRegistrationClosed(undefined)).toBe(true);
    expect(isConcertRegistrationClosed({})).toBe(true);
    expect(isConcertRegistrationClosed({ startsAt: '' })).toBe(true);
  });

  test('treats invalid startsAt as closed', () => {
    jest.setSystemTime(new Date('2000-01-01T00:00:00Z'));
    expect(
      isConcertRegistrationClosed({
        startsAt: 'invalid',
        timeZone: 'Asia/Tokyo',
      })
    ).toBe(true);
  });

  test('is false strictly before start instant, true at and after start', () => {
    const concert = {
      startsAt: '2026-05-01T10:00:00+09:00',
      timeZone: 'Asia/Tokyo',
    };
    const startMs = new Date(concert.startsAt).getTime();
    expect(Number.isNaN(startMs)).toBe(false);

    jest.setSystemTime(startMs - 1);
    expect(isConcertRegistrationClosed(concert)).toBe(false);

    jest.setSystemTime(startMs);
    expect(isConcertRegistrationClosed(concert)).toBe(true);

    jest.setSystemTime(startMs + 60 * 60 * 1000);
    expect(isConcertRegistrationClosed(concert)).toBe(true);
  });

  test('with frozen "now" before tour, all fixture concerts stay open', () => {
    jest.setSystemTime(new Date('2026-04-01T00:00:00Z'));
    const data = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
    data.concerts.forEach(function (c) {
      expect(isConcertRegistrationClosed(c)).toBe(false);
    });
  });

  test('with frozen "now" after last show, every fixture concert is closed', () => {
    jest.setSystemTime(new Date('2026-12-31T23:59:59Z'));
    const data = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
    data.concerts.forEach(function (c) {
      expect(isConcertRegistrationClosed(c)).toBe(true);
    });
  });
});
