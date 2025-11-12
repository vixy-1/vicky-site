// register.js
import { app } from "./firebase-config.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((e) => console.error("persistence", e));

// DOM
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regPassword2 = document.getElementById("regPassword2");
const registerSubmit = document.getElementById("registerSubmit");
const registerMsg = document.getElementById("registerMsg");
const pageSpinner = document.getElementById("pageSpinner");
const registerCaptchaEl = document.getElementById("register-captcha");

function showSpinner(active = true) {
  if (!pageSpinner) return;
  if (active) pageSpinner.classList.add("active");
  else pageSpinner.classList.remove("active");
}

function mapAuthError(code) {
  const m = {
    "auth/email-already-in-use": "このメールアドレスは既に使用されています",
    "auth/invalid-email": "メールアドレスの形式が正しくありません",
    "auth/weak-password": "パスワードが弱すぎます",
    "auth/operation-not-allowed": "現在この操作は許可されていません",
    "auth/network-request-failed": "ネットワークエラーが発生しました",
    "auth/internal-error": "内部エラーが発生しました。時間をおいてお試しください"
  };
  return m[code] || "エラーが発生しました。時間をおいて再度お試しください";
}

function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
}

registerSubmit.addEventListener("click", async () => {
  const email = regEmail.value.trim();
  const pw = regPassword.value;
  const pw2 = regPassword2.value;
  try {
    if (registerSubmit) registerSubmit.disabled = true;
    showSpinner(true);

    if (!email || !pw || !pw2) {
      registerMsg.textContent = "未入力の項目があります";
      return;
    }
    if (pw !== pw2) {
      registerMsg.textContent = "パスワードが一致しません";
      return;
    }
    if (!isStrongPassword(pw)) {
      registerMsg.textContent = "パスワードは8文字以上で英字と数字を含めてください";
      return;
    }

    // hCaptcha token check (client-side presence)
    if (registerCaptchaEl && window.hcaptcha) {
      const token = window.hcaptcha.getResponse();
      if (!token) {
        registerMsg.textContent = "セキュリティ確認（hCaptcha）を実施してください";
        return;
      }
    }

    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await sendEmailVerification(cred.user);
    registerMsg.textContent = "登録完了！確認メールを送信しました。メール認証後にログインしてください。";
  } catch (err) {
    console.error("register error", err);
    registerMsg.textContent = "登録失敗：" + mapAuthError(err.code) + (err.code ? `（${err.code}）` : "");
  } finally {
    if (registerSubmit) setTimeout(() => (registerSubmit.disabled = false), 400);
    showSpinner(false);
    if (registerCaptchaEl && window.hcaptcha) {
      try { window.hcaptcha.reset(); } catch(_) {}
    }
  }
});
