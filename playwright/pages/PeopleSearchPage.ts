import { Page, Locator, expect } from '@playwright/test';


export class PeopleSearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly practiceAreaFilter: Locator;
  readonly officeFilter: Locator;
  readonly resultCards: Locator;
  readonly resultCount: Locator;
  readonly clearFiltersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/search by name/i);
    this.practiceAreaFilter = page.getByRole('button', { name: /Practices/i });
    this.officeFilter = page.getByRole('button', { name: /office/i });
   
    this.resultCards = page.locator('.CoveoResult');
    this.resultCount = page.locator('[data-testid="people-result-count"]');
    this.clearFiltersButton = page.getByRole('button', { name: /clear all/i });
  }

async closeBannerIfVisible() {
  const closeButton = this.page.locator('.onetrust-close-btn-handler').first();

  try {
    await closeButton.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    console.log('not visible closeButton');
    return;
  }

  console.log('visible closeButton, closing it');
  await closeButton.click({ force: true });
  await expect(closeButton).toBeHidden();
}

  async gotoPeople() {
    // await this.page.goto('https://www.cooley.com/people');
    await this.page.goto('/people');
     await this.closeBannerIfVisible();
    // await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.getByRole('heading', { level: 1, name: 'People' })).toBeVisible();
    console.log('visible people page')
  }

  async searchByName(name: string) {
    await this.searchInput.fill(name);
    await this.searchInput.press('Enter');
  }



async filterByPracticeArea(practiceArea: string) {
  await this.practiceAreaFilter.click(); // expand the Practices facet

  const checkbox = this.page.getByRole('checkbox', {
    name: new RegExp(`^${practiceArea}\\s+\\d+\\s+results?$`, 'i'),
  });

  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await this.page.waitForLoadState('networkidle'); // Coveo re-queries async on selection
}


  async filterByOffice(office: string) {
    await this.officeFilter.click();
    await this.page.getByRole('option', { name: office }).click();
    await this.page.keyboard.press('Escape');
  }

  async getResultCount(): Promise<number> {
    return this.resultCards.count();
  }

 async assertResultCardsHaveRequiredFields() {
  const count = await this.resultCards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = this.resultCards.nth(i);

    await expect(
      card.locator('.teaser-title'),
      `Result card ${i} is missing a name`
    ).not.toBeEmpty();

    await expect(
      card.locator('.teaser-position').first(),
      `Result card ${i} is missing a job title`
    ).not.toBeEmpty();

    await expect(
      card.locator('.teaser-position').nth(1),
      `Result card ${i} is missing an office/location`
    ).not.toBeEmpty();

    const profileLink = card.locator('a.CoveoResultLink').first();
    await expect(
      profileLink,
      `Result card ${i} is missing a valid profile link`
    ).toHaveAttribute('href', /\/people\//);
  }
}

  async clearFilters() {
    await this.clearFiltersButton.click();
  }
}
