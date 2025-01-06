'use strict';

const fs     = require('fs');
const path   = require('path');
const expect = require('chai').expect;
const png    = require('../lib/index');

describe('png', () => {

  describe('detect', () => {

    it('should return true for a PNG', () => {
      const pngPath = path.resolve(__dirname, 'fixtures/png/123x456.png');
      const result = png.detect(fs.readFileSync(pngPath));
      expect(result).to.eql(true);
    });

    it('should return false for a non-PNG', () => {
      const jpegPath = path.resolve(__dirname, 'fixtures/jpeg/123x456.jpg');
      const result = png.detect(fs.readFileSync(jpegPath));
      expect(result).to.eql(false);
    });

  });

  describe('measure', () => {

    const fixtures = path.resolve(__dirname, 'fixtures/png');
    const files = fs.readdirSync(fixtures);

    files.forEach((file) => {

      const fileSplit = file.split(/x|\./);
      const width = parseInt(fileSplit[0]);
      const height = parseInt(fileSplit[1]);
      const expectedOutput = {
        type: 'png',
        pages: [{ width, height }]
      };

      it(`should return the correct dimensions for ${  file}`, async () => {
        const pngPath = path.resolve(fixtures, file);
        const fd = fs.openSync(pngPath, 'r');
        try {
          const result = await png.measure(pngPath, fd);
          expect(result).to.eql(expectedOutput);
        } finally {
          fs.closeSync(fd);
        }

      });

    });

  });

});
