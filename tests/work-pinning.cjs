// Run against the README preview server with Playwright available to Node.
const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

(async () => {
  const engine = process.env.TEST_BROWSER === 'webkit' ? webkit : chromium;
  const browser = await engine.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
  });
  try {
    for (const [width, height] of [[1440, 900], [1280, 720], [390, 844], [375, 667], [320, 740]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/#work');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('.work-track img')].map(img => {
          img.loading = 'eager';
          return img.decode();
        }));
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(100);
      const positions = await page.evaluate(() => {
        return [...document.querySelectorAll('.work-track .project-card')].map(card => ({
          naturalTop: card.getBoundingClientRect().top + scrollY,
          stickyTop: parseFloat(getComputedStyle(card).top),
        }));
      });
      // Walk the full stack down, leave it, then walk back up through every card.
      const indices = [...positions.keys()];
      for (const index of [...indices, -1, ...indices.toReversed()]) {
        if (index === -1) {
          await page.locator('.about-section').evaluate(el => el.scrollIntoView());
          continue;
        }
        const pos = positions[index];
        // The final card leaves with the end of the track; earlier cards hold
        // their top position as subsequent cards pass over them.
        const hold = index === positions.length - 1 ? 0 : 12;
        await page.evaluate(y => window.scrollTo(0, y), pos.naturalTop - pos.stickyTop + hold);
        await page.waitForTimeout(40);
        const state = await page.locator('.work-track .project-card').nth(index).evaluate(card => ({
          active: document.documentElement.classList.contains('scroll-scenes'),
          top: card.getBoundingClientRect().top,
          position: getComputedStyle(card).position,
          opacity: getComputedStyle(card).opacity,
        }));
        assert.equal(state.active, true, `${width}x${height}: stack active`);
        assert.equal(state.position, 'sticky');
        assert.equal(state.opacity, '1');
        assert.ok(Math.abs(state.top - pos.stickyTop) < 1, `${width}x${height} card ${index}: pinned at ${state.top}`);
      }
      if (width === 390) {
        for (const viewportHeight of [640, 620, 640, 844]) {
          await page.setViewportSize({ width, height: viewportHeight });
          await page.waitForTimeout(80);
          assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), true,
            `mobile height ${viewportHeight} keeps pinning`);
        }
        // Isolate the fit check from changing browser chrome geometry. This
        // simulates innerHeight changes, not physical Safari toolbar behavior.
        assert.equal(await page.evaluate(() => {
          const original = Object.getOwnPropertyDescriptor(window, 'innerHeight');
          try {
            Object.defineProperty(window, 'innerHeight', { configurable: true, value: 590 });
            window.dispatchEvent(new Event('resize'));
            return document.documentElement.classList.contains('scroll-scenes');
          } finally {
            Object.defineProperty(window, 'innerHeight', original);
            window.dispatchEvent(new Event('resize'));
          }
        }), true);
        await page.screenshot({ path: '/tmp/portfolio-pin-mobile.png' });
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(80);
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), false,
          'short landscape viewport uses normal flow when content cannot fit');
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(80);
        assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), true);
      }
      if (width === 1440) await page.screenshot({ path: '/tmp/portfolio-pin-desktop.png' });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(80);
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), false);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForTimeout(80);
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), true);
      // Enlarged copy must remain readable instead of being clipped in a fixed panel.
      await page.addStyleTag({ content: '.work-track .project-info { font-size: 50px; } .work-track .project-info * { font-size: inherit !important; }' });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      assert.equal(await page.evaluate(() => document.documentElement.classList.contains('scroll-scenes')), false);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}x${height}: down/up, content fit, reduced motion, console${width === 390 ? ', resize/orientation' : ''}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
