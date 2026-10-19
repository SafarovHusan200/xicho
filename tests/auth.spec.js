// tests/auth.spec.js
import { test, expect } from '@playwright/test';

const invalidCases = [
  { login: '', password: '', error: 'Login kiriting' },
  { login: 'test@mail.uz', password: '123', error: 'Parol juda qisqa' },
  { login: 'yoq@mail.uz', password: 'Parol123!', error: 'Login yoki parol xato' },
];

for (const c of invalidCases) {
  test(`login xato: "${c.login}"`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=login]', c.login);
    await page.fill('[name=password]', c.password);
    await page.click('button[type=submit]');

    const err = page.getByRole('alert');
    await expect(err).toBeVisible();
    await expect(err).toHaveText(c.error); // aniq matn
    await expect(err).not.toContainText('undefined');
    await expect(page).toHaveURL(/login/); // ichkariga o'tkazmadi
  });
}

test('login qilmasdan dashboardga kirish', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});

test('server 500 qaytarsa', async ({ page }) => {
  await page.route('**/api/auth/login', (r) => r.fulfill({ status: 500, body: '{}' }));
  await page.goto('/login');
  await page.fill('[name=login]', 'test@mail.uz');
  await page.fill('[name=password]', 'Parol123!');
  await page.click('button[type=submit]');
  await expect(page.getByRole('alert')).toContainText('Xatolik yuz berdi');
});
// Ishga tushirish: npm init playwright@latest → npx playwright test.
