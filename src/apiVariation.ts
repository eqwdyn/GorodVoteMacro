import axios from "axios";
import { RegisterProps } from "./types/registerProps.js";
import { readFileAsync } from "./utils/readFileAsync.js";

const registerUrl = "https://gorod24.online/feodosiya/profile/register/1";
const registerApi = axios.create({
  baseURL: registerUrl,
});

const loginWithEmailUrl =
  "https://gorod24.online/feodosiya/narodniy-brand/anketa-login/2";
const loginWithEmailMethod = "POST";

const stepsApi = axios.create();

interface IRegisterSubmit {
  login: string;
  pass1: string;
  pass2: string;
  email: string;
  name: string;
  lastname: string;
  day: number;
  month: number;
  year: number;
  // accept: "on"
  gRecaptchaResponse: string;
  action: "submit_form_1";
}

export async function register(props: RegisterProps) {
  const formData = new FormData();
  formData.append("login", props.login);
  formData.append("pass1", props.password);
  formData.append("pass2", props.password);
  formData.append("email", props.email);
  formData.append("name", props.name);
  formData.append("lastname", props.lastname);
  formData.append("day", props.day);
  formData.append("month", props.month);
  formData.append("year", props.year);
  formData.append("accept", "on");
  formData.append(
    "g-recaptcha-response",
    "0cAFcWeA5k53OZXbcBcKxdrRksUfxCQ4g8rkJTzylfuUFTC7HRnM3aI8ooaPLOnkr216IlC_D1GRL9Tz1Yq5RwDDaUzawVFl_hMJNMQTAZvWOxaiSmQ09iXVdJyz1SczZq0tlkGdKPBxnTXVLeod8v5QsulhXeX6w_xOdqu-RncoRFuIT9vAgngBzQ8aX9zSJT0Z_ok0yO_pnDZdd73NrHHvPf6jxj5iwVO2WoLVbZHAlHW6U1Yo-Ocykg_mVq4FB_-67WcSOw6dMMZpgGyOp4Oyr9CDUi8Q1e4BcQ3QVtEu_BwA0L3NUB5RlBGgQVwhrl9Csenmy82Lpv7DHbX_5R89SEu6880qIRz4BQgv3cfjztqaX4VQq6eBF-IpzHf-E3AoulILdGohqNqi63cUd7qEVld2o8kzlese0D9xOIUirA3baUXmS9Y83kS97PWrqMrnBCdrkQQ9dYji6N4K3Zllvkswt9JiRQEN6j5-3vN4zJVLLA69Pd0fZLtGyGYv41nzmcoUj59zUeWQMFw3lssB3QR1RG1myPwXfge1xI3Hfvhn6jCBTDjzDWZc6Bg_ScnS2mPTT9ptbjTPLf9-ngXpGR7ZQZDs0LmPechTNY5ZhtXEweXMiBDE5ZAuxiQW9i9QHbMPg7UxVS1O636FexEee7Aebji0owdZ2Betk4t3UVya-lL4nFOyDoY6aNFMwFpaGVnbVGuehNU4jO7z5eBRuhvT4PIVJlB8etBS5rIKemhvSP2LiL2f7LyKq0b25f1Dpte2kNIE3jOTyFg_M-cap1WlVKHq7_uCr-8V1s_vcjlplbPiMNhn-1CnCOa4aphj92QIQP-sT0dzkuNQcXobr4YRttaWFGcEHXrtUm2HrXB5ZTwevoqAKhUCeK4HGK0KL1k1aXeEE4VgKuXBdIx3yRi9sA90CGu175JlhFZwZFeXeWk0A5cXb6L-paZEvJ4gL2rEGT2f88AvQiJH2ONBgC1vN_qUgD-gFoMx9HFEiEtUXkSY1bNVtHpMzI4ffN878xtIf4-v609EXZFc7c10qmBBnw4a23oyqtL23DDEYobbLvky9vb07V-WIh6bdqt9NC4S3lkYLtC2CfDXOJpONd-FSO3cwotwGWB0ACfl6wNNkrwgQufO41WZL7shFizvbvanHeCs6tDBhRQmDt7xwvpQfbIXKBK3ptTbMVRQ3UtSkfYfJdAIoBtgTVs2vMLUwQZLQWmhzvAabS_oz8EnDbbBGBAge0uUuf4L5YHIIDKYCyuMuTM4TfJbBo4dePDKY9-xjvF42anViO_qSxd87CvjzDf-fQDiI9G6qhNRa6wdCa8Hp9C0TDz-QpcjfxCdsvU4Ry1lTmDGfyaAkVsntKxqdR2o9QDXDxqBP6BS8UuYE28xUafxmKtahmDiMw90IaAnU6NDHajHCAgKq262DNbZKr0ojYgGJE2i9I7JgiDvEslYqYdx7fGYiIT3d_s4KT_-f9Vfa9Ud1rlQFjSTq1UYWNs69V-k15IcgLXhKhFk1shgnTfE5690g9W1VCVlP5XJlD0dj_pObYuYRF8MzWYF1E7km2CZSMW11EMfFv3n5Yk5AzeHua7qVvxMEjBeDp8YcuZfj4AyQd-zDEa5tDu1XKu5U7nmjzfmEs4c8fJwGv2-SzNgypSBbb7whlHygNFSCtffUADYxCAPuNPfw9WfnesNUASGVUheqCMNshtplkot7MW3nSXs-7znlKwnKftVdTmr0VVwk1muZ4VJZ0_09-qigz2vCbjl8nXg6wYkdEAMWbXuwABlTCKeNWNK8WX393Kh3E910hb5Gxf8GNyRa9I3VYyn0lNxVlK2xl4uEok9Wtic8wHUuaOkKQQtVwISfuTYUXHFem9eA_7yKr0suFke1v-MWUkgMzjeNKRnVGyE0U0a1TgAKfTN80I6RpSe2d8G8c88olTRFuNuZaca0fGPZG4XjYQky1wAk_nOT9DodB0Wei_rh94XzjzlZ9WEuxX4Sdml6aER5ji58M9DgwtrePpt07WWudZQWFBsMWki00QAqwuK9RZg_CohUO3vovSsTtzVp8-CXogs22Bz_e3u61kZ06fO9vk8Nv4EmaWYe4CJNRKJAciQZkGK-jPXDihUqFBMTwMyJ0o0cDm0DpZU6K9tXz33Ixss6UxY_LHuDbFdlhqb0LTsiCe_3TV6NypgpnHesb_OJkFXDkEWIpF2xQM3HtKTQUUsUugjE2z-OYTnlcoM8gY6muEdDnIJHQj6K_PBkcsJImQJ9BSWX_mZEnJ2vWEnxRB_n4XLjGOc_wKnlPX9IZLDCelM-7cRsx7EADgpuXtIgepEH8p1IHXDEFPW76C0CMICW8IZyHUaEqgdxKf2iY1V_xkdce-BJ0eu0dHgdBR3IbZjXVu_hRs-yaOMlOaA3azosCP73TMo-FwNnQ1WQ48EWkF6k6ERpkfEi28JikeirdrzUmAK-VDIuWJpJRjic1MOFXIcQYQeGwlhACrf4QntAjtWMq5z9GWgll",
  );

  try {
    const resp = await registerApi.post("", formData);
    // console.log("Response from register: ", resp);
  } catch (e) {
    console.warn(
      "WARN: Error while register user: ",
      JSON.stringify(props, null, 2),
    );
  }
}
