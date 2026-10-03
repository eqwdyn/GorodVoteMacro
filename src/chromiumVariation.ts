import { ElementHandle, launch, Page } from "puppeteer";
import { ageMapper } from "./utils/ageMap.js";

const initUrl =
  "https://gorod24.online/feodosiya/narodniy-brand?nb_client=2322&nb_brend=162&con=46";
const registerUrl = "https://gorod24.online/feodosiya/profile/register";

async function typeInput(
  element: ElementHandle,
  selector: string,
  value: string,
) {
  const input = await element.$(selector);
  if (!input) throw new Error(`${selector} не найден`);

  await input.type(value, { delay: 150 });
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
  console.log("Авторизация прошла успешно");
}

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

  await page.waitForSelector("#add-form-1");

  await questionnairePage(page, { cuttedPhone: mockPhone, ageGroupIndex });

  await page.waitForSelector("#form");

  await lastPage(page);
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
          slowMo: 50,
        }
      : {},
  );

  const cuttedPhone = phone.slice(2);
  const ageGroupIndex = ageMapper(2026 - year);

  try {
    const page = await browser.newPage();
    await proccessVote(page, cuttedPhone, ageGroupIndex, email, password);
  } catch (err) {
    console.error("Ошибка в proccessChromium:", err);
    // await browser.close();
    throw err;
  }
  await browser.close();
}
