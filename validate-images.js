#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const PACK_PATH = path.join(process.cwd(), 'pack-tools/packs/0-base.json');

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const isValid = res.status >= 200 && res.status < 400;
    return { status: isValid ? 'ok' : 'broken', code: res.status };
  } catch (err) {
    return {
      status: err.name === 'AbortError' ? 'timeout' : 'error',
      code: null,
      error: err.message,
    };
  }
}

async function main() {
  const pack = JSON.parse(fs.readFileSync(PACK_PATH, 'utf-8'));
  const species = pack.data.species;

  const results = {
    missing: [],
    broken: [],
    ok: [],
  };

  console.log(`\nValidating ${species.length} species images...\n`);

  for (const sp of species) {
    if (!sp.image || !sp.image.url) {
      results.missing.push({
        id: sp.id,
        name: sp.common_name,
      });
      console.log(`❌ MISSING: ${sp.common_name} (${sp.id})`);
      continue;
    }

    const check = await checkUrl(sp.image.url);

    if (check.status === 'ok') {
      results.ok.push({
        id: sp.id,
        name: sp.common_name,
      });
      console.log(`✓ OK: ${sp.common_name}`);
    } else {
      results.broken.push({
        id: sp.id,
        name: sp.common_name,
        url: sp.image.url,
        status: check,
      });
      console.log(
        `❌ BROKEN: ${sp.common_name} (${check.status}${check.code ? ` ${check.code}` : ''})`
      );
    }

    // Rate limit: 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n=== SUMMARY ===');
  console.log(`✓ OK: ${results.ok.length}`);
  console.log(`❌ Broken: ${results.broken.length}`);
  console.log(`❌ Missing: ${results.missing.length}`);

  if (results.broken.length > 0) {
    console.log('\nBroken images:');
    results.broken.forEach((item) => {
      console.log(`  - ${item.name} (${item.id})`);
      console.log(`    URL: ${item.url}`);
      console.log(`    Status: ${item.status.status}${item.status.code ? ` (${item.status.code})` : ''}`);
    });
  }

  if (results.missing.length > 0) {
    console.log('\nMissing images:');
    results.missing.forEach((item) => {
      console.log(`  - ${item.name} (${item.id})`);
    });
  }
}

main();
