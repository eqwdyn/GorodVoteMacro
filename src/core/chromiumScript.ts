import { ElementHandle, launch, Page } from "puppeteer";
import { generatePhoneNumber } from "../utils/generatePhoneNumber.js";
import { ageMapper } from "../utils/ageMap.js";
import { config } from "dotenv";
config();

const initUrl = process.env.BRAND_URL as string;

async function typeInput(
  element: ElementHandle,
  selector: string,
  value: string,
) {
  const input = await element.$(selector);
  if (!input) throw new Error(`${selector} не найден`);

  //   await input.type(value, { delay: 350 });
  await input.evaluate((el, val) => {
    el.value = val;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);

  const currentValue = await input.evaluate((el) => el.value);
  console.log("Typed to input: ", value);
  console.log("Current input value: ", currentValue);
}

async function choseDropdownValue(
  element: ElementHandle,
  selector: string,
  arrayIndex: number,
) {
  const dropdownTrigger = await element.$(selector);
  if (!dropdownTrigger) throw new Error("Dropdown не найден");

  await dropdownTrigger.click();

  const ul = await element.$(".chosen-results");
  if (!ul) throw new Error("Список элементов не найден");

  const targetSelector = `li[data-option-array-index="${arrayIndex}"]`;
  let target = await ul.$(targetSelector);
  if (target) {
    await target.click();
    return;
  }

  const maxScrollAttempts = 20;
  for (let i = 0; i < maxScrollAttempts; i++) {
    await ul.evaluate((el) => {
      el.scrollTop += el.clientHeight;
    });

    await new Promise((r) => setTimeout(r, 150));

    target = await ul.$(targetSelector);
    if (target) break;
  }

  if (!target) {
    throw new Error(
      `Опция с data-option-array-index="${arrayIndex}" не найдена после ${maxScrollAttempts} попыток скролла`,
    );
  }

  await target.click();
  console.log(`Выбрана опция с индексом ${arrayIndex}`);
}

async function choseCheckBox(element: ElementHandle, selector: string) {
  const checkbox = await element.$(selector);
  if (!checkbox) throw new Error("Чекбокс не найден");

  const isChecked = await checkbox.evaluate((el) => !!el.checked);
  if (!isChecked) {
    await checkbox.click();
    console.log("Галочка поставлена");
  } else {
    console.log("Галочка уже стояла");
  }
}

async function initPage(page: Page, cuttedPhone: string) {
  const form = await page.$("#add-form-1");
  if (!form) throw new Error("Форма не найдена");

  await typeInput(form, "input[name=phone]", cuttedPhone);
  await choseCheckBox(form, ".check-filter");

  await page.waitForSelector("#submit-form-1", {
    visible: true,
    timeout: 10000,
  });
  await page.click("#submit-form-1");
  console.log("Кнопка «Далее» нажата");
}

async function authPage(
  page: Page,
  { email, password }: { email: string; password: string },
) {
  const form = await page.$(".adsaddform-2");
  if (!form) throw new Error("Форма не найдена");

  await typeInput(form, "input[name=email]", email);
  await typeInput(form, "input[name=password]", password);

  const submitButton = await form.$('button[type="submit"]');
  if (!submitButton) throw new Error("Кнопка отправки не найдена");

  await submitButton.click();
  console.log("Первичная авторизация прошла успешно");
}

// async function questionnairePage(
//   page: Page,
//   {
//     cuttedPhone,
//     ageGroupIndex,
//   }: { cuttedPhone: string; ageGroupIndex: number },
// ) {
//   const form = await page.$("#add-form-1");
//   if (!form) throw new Error("Форма не найдена");

//   await choseDropdownValue(form, ".chosen-single", ageGroupIndex);
//   await typeInput(form, "input[name=phone]", cuttedPhone);
//   await choseCheckBox(form, ".check-filter");

//   const submitButton = await form.$('button[type="submit"]');
//   if (!submitButton) throw new Error("Кнопка отправки не найдена");

//   await submitButton.click();

//   try {
//     const errorAlert = await page.waitForSelector(".alert-danger");
//     if (!errorAlert) {
//       console.log("Авторизация прошла успешно");
//       return;
//     }
//     console.log("Alert: ", JSON.stringify(errorAlert));

//     const genPhone = generatePhoneNumber();
//     const genCuttedPhone = genPhone.slice(2);
//     await typeInput(form, "input[name=phone]", genCuttedPhone);

//     await submitButton.click();
//     console.log("Авторизация прошла успешно");
//   } catch (e: any) {
//     if (e.message.includes("alert-danger")) {
//       console.log("Авторизация прошла успешно");
//     }
//   }
//   // <input type="text" name="phone" placeholder="Ваш мобильный телефон" value="">
//   //   console.log("Авторизация наверное прошла успешно");
// }
async function questionnairePage(
  page: Page,
  {
    cuttedPhone,
    ageGroupIndex,
  }: { cuttedPhone: string; ageGroupIndex: number },
) {
  const form = await page.$("#add-form-1");
  if (!form) throw new Error("Форма не найдена");

  await choseDropdownValue(form, ".chosen-single", ageGroupIndex);
  await typeInput(form, "input[name=phone]", cuttedPhone);
  await choseCheckBox(form, ".check-filter");

  const submitButton = await form.$('button[type="submit"]');
  if (!submitButton) throw new Error("Кнопка отправки не найдена");

  await submitButton.click();

  try {
    // В Puppeteer именно так ждут появления элемента
    const alertElement = await page.waitForSelector(".alert-danger", {
      timeout: 3000,
      visible: true, // ждёт, пока элемент станет видимым
    });
    if (!alertElement) {
      console.log("Авторизация прошла успешно");
      return;
    }

    const alertText = await alertElement.evaluate(
      (el) => el.textContent?.trim() || "",
    );
    console.log("Alert:", alertText);

    // Логика повторной попытки
    const genPhone = generatePhoneNumber();
    const genCuttedPhone = genPhone.slice(2);

    // Важно: после клика DOM мог обновиться, ищем форму заново
    const newForm = await page.$("#add-form-1");
    if (!newForm) throw new Error("Форма исчезла после отправки");

    await typeInput(newForm, "input[name=phone]", genCuttedPhone);
    await choseCheckBox(newForm, ".check-filter");

    const newSubmitButton = await newForm.$('button[type="submit"]');
    if (!newSubmitButton) throw new Error("Кнопка исчезла после отправки");

    await newSubmitButton.click();
    console.log("Попытка повторной отправки выполнена");
  } catch (e) {
    // Сюда попадаем, если waitForSelector не дождался элемента (таймаут)
    // Это значит, что алерта нет — скорее всего, авторизация прошла успешно
    if (e instanceof Error && e.message.includes("TimeoutError")) {
      console.log("Алерт не появился — авторизация, вероятно, прошла успешно");
      return;
    }
    throw e; // пробрасываем другие ошибки
  }
}

async function questionnairePageBackFall(page: Page) {
  const genPhone = generatePhoneNumber();
  const genCuttedPhone = genPhone.slice(2);

  const form = await page.$("#add-form-1");
  if (!form) throw new Error("Форма не найдена");

  await typeInput(form, "input[name=phone]", genCuttedPhone);

  const submitButton = await form.$('button[type="submit"]');
  if (!submitButton) throw new Error("Кнопка отправки не найдена");

  await submitButton.click();
  console.log("Авторизация прошла успешно");
}

async function lastPage(page: Page) {
  const form = await page.$("#form");
  if (!form) throw new Error("Форма не найдена");

  const submitButton = await form.$('button[type="submit"]');
  if (!submitButton) throw new Error("Кнопка отправки не найдена");

  await submitButton.click();
  console.log("Голос был отправлен!");
}

async function proccessVote(
  page: Page,
  cuttedPhone: string,
  ageGroupIndex: number,
  email: string,
  password: string,
) {
  const mockPhone =
    cuttedPhone.slice(0, -1) === "5"
      ? cuttedPhone.slice(0, -1) + "2"
      : cuttedPhone.slice(0, -1) + "5";

  console.log("Real Phone: ", cuttedPhone);
  console.log("Mock Phone: ", mockPhone);
  await page.goto(initUrl, { waitUntil: "networkidle2" });

  await initPage(page, cuttedPhone);

  await page.waitForSelector(".adsaddform-2");

  await authPage(page, { email, password });

  //   while (
  //     page.url() ===
  //     "https://gorod24.online/feodosiya/narodniy-brand/anketa-login"
  //   ) {
  //     await authPageBackFall(page);
  //   }

  //   if (
  //     page.url() !==
  //     "https://gorod24.online/feodosiya/narodniy-brand/anketa-shag-1"
  //   ) {

  //   }

  try {
    await page.waitForSelector("#add-form-1");
    // console.log("Page url: ", page.url());

    await questionnairePage(page, { cuttedPhone: mockPhone, ageGroupIndex });

    await page.waitForSelector("#form");

    await lastPage(page);
  } catch (e: any) {
    console.log(`WARN: ${e.message}`);

    if (e.message.includes("Execution context was destroyed")) {
      console.log("Trying to generate random number");

      await questionnairePageBackFall(page);
      return;
    }

    if (e.message.includes("#add-form-1")) {
      console.log("Trying to handle last page");

      await page.waitForSelector("#form");

      await lastPage(page);
      return;
    }

    throw e;
  }
}

export async function proccessChromium({
  phone,
  year,
  email,
  password,
  debugMode,
}: {
  phone: string;
  year: number;
  email: string;
  password: string;
  debugMode?: boolean;
}) {
  const browser = await launch(
    debugMode
      ? {
          headless: false,
          slowMo: 150,
        }
      : {},
  );

  const cuttedPhone = phone.slice(2);
  const ageGroupIndex = ageMapper(2026 - year);

  try {
    const page = await browser.newPage();
    await proccessVote(page, cuttedPhone, ageGroupIndex, email, password);
  } catch (e: any) {
    console.error("Ошибка в proccessChromium:", e.message);
    throw e;
  } finally {
    await browser.close();
  }
}
