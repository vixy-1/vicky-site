// Firebaseモジュール読み込み
import { app } from "./firebase-config.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase Auth 初期化
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.error("Failed to set persistence", e);
});

// DOM要素取得
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const loginSubmit = document.getElementById("loginSubmit");
const signupLink = document.getElementById("signupLink");
const loginMsg = document.getElementById("loginMsg");
const pageSpinner = document.getElementById("pageSpinner");
const loginCaptchaEl = document.getElementById("login-captcha");

function showSpinner(active = true) {
  if (!pageSpinner) return;
  if (active) pageSpinner.classList.add("active");
  else pageSpinner.classList.remove("active");
}

function fadeShow(el) {
  if (!el) return;
  el.classList.remove("fade-exit", "fade-exit-active");
  el.classList.add("fade-enter");
  el.style.display = el.id === "loginPage" ? "flex" : "block";
  requestAnimationFrame(() => el.classList.add("fade-enter-active"));
  setTimeout(() => el.classList.remove("fade-enter", "fade-enter-active"), 250);
}

function fadeHide(el) {
  if (!el || getComputedStyle(el).display === "none") return;
  el.classList.remove("fade-enter", "fade-enter-active");
  el.classList.add("fade-exit");
  requestAnimationFrame(() => el.classList.add("fade-exit-active"));
  setTimeout(() => {
    el.style.display = "none";
    el.classList.remove("fade-exit", "fade-exit-active");
  }, 200);
}

// ユーザー向けエラーメッセージ簡易マッピング
function mapAuthError(code) {
  const m = {
    "auth/invalid-credential": "メールまたはパスワードが違います",
    "auth/invalid-email": "メールアドレスの形式が正しくありません",
    "auth/user-disabled": "このアカウントは無効化されています",
    "auth/user-not-found": "ユーザーが見つかりません",
    "auth/wrong-password": "メールまたはパスワードが違います",
    "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってからお試しください"
  };
  return m[code] || "エラーが発生しました。時間をおいて再度お試しください";
}

// パスワード強度チェック（最低8文字・英字と数字を含む）
function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
}

// 認証状態監視でUI制御
onAuthStateChanged(auth, (user) => {
  if (!loginBtn || !logoutBtn || !loginPage || !homePage) return;
  if (user) {
    if (!user.emailVerified) {
      // 未確認の場合は案内してサインアウト
      if (loginMsg) loginMsg.textContent = "メールアドレス確認が必要です。受信トレイをご確認ください。";
      fadeShow(loginPage);
      fadeHide(homePage);
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
      signOut(auth);
      return;
    }
    // 認証済み
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    fadeHide(loginPage);
    fadeShow(homePage);
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// 🔹 ログインページを開く
loginBtn.addEventListener("click", () => {
  fadeHide(homePage);
  fadeShow(loginPage);
});

// 🔹 ログイン処理
loginSubmit.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    if (loginSubmit) loginSubmit.disabled = true;
    showSpinner(true);
    // hCaptcha チェック
    if (loginCaptchaEl && window.hcaptcha) {
      const token = window.hcaptcha.getResponse(loginCaptchaEl);
      if (!token) {
        if (loginMsg) loginMsg.textContent = "セキュリティ確認（hCaptcha）を実施してください";
        return;
      }
    }
    await signInWithEmailAndPassword(auth, email, password);
    if (loginMsg) loginMsg.textContent = "ログイン成功！";
  } catch (err) {
    console.error("signIn error", err);
    if (loginMsg) loginMsg.textContent = "ログイン失敗：" + mapAuthError(err.code);
  }
  finally {
    if (loginSubmit) setTimeout(() => (loginSubmit.disabled = false), 400);
    showSpinner(false);
    // hCaptcha リセット
    if (loginCaptchaEl && window.hcaptcha) {
      try { window.hcaptcha.reset(loginCaptchaEl); } catch (_) {}
    }
  }
});

// 🔹 新規登録（このページでは登録を行わず、register.htmlへ遷移）
if (signupLink && signupLink.getAttribute("href") === "#") {
  signupLink.addEventListener("click", (e) => {
    e.preventDefault();
    location.href = "register.html";
  });
}

// 🔹 ログアウト処理
logoutBtn.addEventListener("click", async () => {
  // 先にUIを切り替えて体感を速くする
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  fadeShow(loginPage);
  fadeHide(homePage);
  showSpinner(true);
  try {
    await signOut(auth);
    if (loginMsg) loginMsg.textContent = "ログアウトしました";
  } finally {
    showSpinner(false);
  }
});
