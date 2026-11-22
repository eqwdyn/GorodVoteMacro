import { generateNumbers } from "./generateNumbers.js";

export function generatePhoneNumber() {
  // const initPhone = "+7978 675 50 13"
  let phone = "+7978";

  for (let i = 0; i < 7; i++) {
    const randNumb = generateNumbers(0, 9);
    phone += randNumb;
  }

  console.log("Random phone number was generated \nPhone: ", phone);
  return phone;
}
