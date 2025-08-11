import CONSTANTS from '@/constants'
import { expect, test } from '@playwright/test'

test('homepage has expected title', async ({ page }) => {
  await page.goto('http://localhost:3000') // Your running Next.js app URL

  await expect(page).toHaveTitle(CONSTANTS.TITLE)
})
