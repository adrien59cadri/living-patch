/**
 * Unit tests for Wikipedia scraper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractImageLink, fetchFilePageAndExtractData } from '../../lib/wikipedia-scraper.js';

// Mock HTML fixtures
const mockInforboxWithImage = `
<!DOCTYPE html>
<html>
<body>
<table class="infobox biota">
  <tr>
    <td colspan="2" style="text-align:center">
      <a href="/wiki/File:Bubo_virginianus_06.jpg" class="image">
        <img src="/wikipedia/commons/thumb/2/23/Bubo_virginianus_06.jpg/200px-Bubo_virginianus_06.jpg" />
      </a>
    </td>
  </tr>
  <tr>
    <th>Other data</th>
    <td>Some value</td>
  </tr>
</table>
</body>
</html>
`;

const mockInforboxWithoutImage = `
<!DOCTYPE html>
<html>
<body>
<table class="infobox biota">
  <tr>
    <th>Scientific name</th>
    <td><i>Some species</i></td>
  </tr>
</table>
</body>
</html>
`;

const mockNoInforbox = `
<!DOCTYPE html>
<html>
<body>
<div>Some page content without infobox</div>
</body>
</html>
`;

const mockFilePageWithAuthor = `
<!DOCTYPE html>
<html>
<body>
<table class="fileinfotpl">
  <tr>
    <td>Date</td>
    <td>2020</td>
  </tr>
  <tr>
    <td id="fileinfotpl_aut">John Doe</td>
    <td>Some other info</td>
  </tr>
</table>
<div id="file">
  <a href="https://upload.wikimedia.org/wikipedia/commons/2/23/Bubo_virginianus_06.jpg">Original file</a>
</div>
</body>
</html>
`;

const mockFilePageWithoutId = `
<!DOCTYPE html>
<html>
<body>
<table class="fileinfotpl">
  <tr>
    <td>Author</td>
    <td>Jane Smith</td>
  </tr>
</table>
<a href="https://upload.wikimedia.org/wikipedia/commons/3/33/Test_image.jpg">Original file</a>
</body>
</html>
`;

describe('Wikipedia Scraper', () => {
  describe('extractImageLink', () => {
    it('should extract image link from infobox biota', () => {
      const link = extractImageLink(mockInforboxWithImage);
      expect(link).toBe('/wiki/File:Bubo_virginianus_06.jpg');
    });

    it('should return null when infobox has no image', () => {
      const link = extractImageLink(mockInforboxWithoutImage);
      expect(link).toBeNull();
    });

    it('should return null when no infobox present', () => {
      const link = extractImageLink(mockNoInforbox);
      expect(link).toBeNull();
    });

    it('should return null for invalid HTML', () => {
      const link = extractImageLink('');
      expect(link).toBeNull();
    });
  });

  describe('fetchFilePageAndExtractData', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should extract author from fileinfotpl_aut id field', async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockFilePageWithAuthor,
      });

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result).toEqual({
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bubo_virginianus_06.jpg',
        author: 'John Doe',
      });
    });

    it('should extract author from Author row fallback', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockFilePageWithoutId,
      });

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result).toEqual({
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Test_image.jpg',
        author: 'Jane Smith',
      });
    });

    it('should return null when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result).toBeNull();
    });

    it('should return null when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result).toBeNull();
    });

    it('should set author to Unknown if not found', async () => {
      const htmlWithoutAuthor = `
        <!DOCTYPE html>
        <html>
        <body>
        <a href="https://upload.wikimedia.org/wikipedia/commons/test.jpg">Original file</a>
        </body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => htmlWithoutAuthor,
      });

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result?.author).toBe('Unknown');
    });

    it('should convert relative URLs to absolute Wikimedia URLs', async () => {
      const htmlWithRelativeUrl = `
        <!DOCTYPE html>
        <html>
        <body>
        <a href="//upload.wikimedia.org/wikipedia/commons/test.jpg">Original file</a>
        </body>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => htmlWithRelativeUrl,
      });

      const result = await fetchFilePageAndExtractData('/wiki/File:Test.jpg');

      expect(result?.url).toMatch(/^https:/);
    });
  });
});
