
import { test, expect } from '../fixture';

test.describe('Cooley people search', { tag: ['@smoke', '@people'] }, () => {
  
  test.beforeEach(async ({  peopleSearchPage }) => {
    // const peopleSearchPage = new PeopleSearchPage(page);
    await peopleSearchPage.gotoPeople();
    console.log("Pass goto")
  });

  test('searching by practice area returns results with required fields', async ({ peopleSearchPage }) => {
    
    await test.step("validate Practices section", async () => {
      await peopleSearchPage.filterByPracticeArea('Accreditation');
    });

    await test.step("validate Result Cards", async () => {
      const count = await peopleSearchPage.getResultCount();
      expect(count).toBeGreaterThan(0);
      await peopleSearchPage.assertResultCardsHaveRequiredFields();
    });


 
  });
   


  test('combining practice area and office filters narrows results', async ({ peopleSearchPage }) => {
    await peopleSearchPage.filterByPracticeArea('Artificial Intelligence');
    const broadCount = await peopleSearchPage.getResultCount();

    await peopleSearchPage.filterByOffice('New York');
    const narrowedCount = await peopleSearchPage.getResultCount();

    // Adding a filter should never increase the result count
    expect(narrowedCount).toBeLessThanOrEqual(broadCount);
  });


});



