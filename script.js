// Firebaseモジュール読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDD6qy0pJnwhEe-ttV-ecPYg6t9hZVm6e0",
  authDomain: "vicky-site-91b51.firebaseapp.com",
  projectId: "vicky-site-91b51",
  storageBucket: "vicky-site-91b51.firebasestorage.app",
  messagingSenderId: "234294971811",
  appId: "1:234294971811:web:4eac593119b65f37769e16",
  measurementId: "G-7LETBZY4DK"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM要素取得
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const loginSubmit = document.getElementById("loginSubmit");
const signupLink = document.getElementById("signupLink");
const loginMsg = document.getElementById("loginMsg");

// 🔹 ログインページを開く
loginBtn.addEventListener("click", () => {
  homePage.style.display = "none";
  loginPage.style.display = "flex";
});

// 🔹 ログイン処理
loginSubmit.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "ログイン成功！";
    setTimeout(() => {
      loginPage.style.display = "none";
      homePage.style.display = "block";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    }, 800);
  } catch (err) {
    loginMsg.textContent = "ログイン失敗：" + err.message;
  }
});

// 🔹 新規登録
signupLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "登録完了！そのままログインできます。";
  } catch (err) {
    loginMsg.textContent = "登録失敗：" + err.message;
  }
});

// 🔹 ログアウト処理
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  alert("ログアウトしました");
});
