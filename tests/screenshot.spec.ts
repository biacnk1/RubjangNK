import { test } from '@playwright/test';
import path from 'path';

test('capture screenshots', async ({ page }) => {
  const artifactDir = 'C:\\Users\\jakra\\.gemini\\antigravity\\brain\\3fe75e0a-4aa3-415d-ac55-12e9d44a0038';
  
  console.log('Navigating to http://localhost:3001/chat...');
  await page.goto('http://localhost:3001/chat', { waitUntil: 'networkidle' });
  
  // Desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: path.join(artifactDir, 'chat_desktop.png') });
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(artifactDir, 'chat_mobile.png') });
});
