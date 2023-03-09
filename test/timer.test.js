const { parseTimeFormat } = require('../utils/timer.js');

test('parse invalid time format no colons', () => {
    expect(parseTimeFormat('blah')).toBe(-1);
});

test('parse invalid time format with colons', () => {
    expect(parseTimeFormat('blah:boo')).toBe(-1);
});

test('parse valid time format only seconds', () => {
    expect(parseTimeFormat('34')).toBe(34);
});

test('parse valid time format zero seconds', () => {
    expect(parseTimeFormat('0')).toBe(0);
});

test('parse valid time format minutes + seconds', () => {
    expect(parseTimeFormat('2:34')).toBe(154);
});

test('parse valid time format hours, minutes, seconds', () => {
    expect(parseTimeFormat('2:5:34')).toBe(7534);
});

test('parse invalid time format too many colons', () => {
    expect(parseTimeFormat('1:2:3:4')).toBe(-1);
});