"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { FiArrowRight, FiLock } from "react-icons/fi";
import "./login.css";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 401
          ? "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى."
          : response.status === 503
            ? "تسجيل الدخول غير مُعدّ حالياً. يرجى التواصل مع المسؤول."
            : "تعذّر تسجيل الدخول. يرجى المحاولة مرة أخرى.");
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("تعذّر الاتصال بخدمة تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <div className="login-card">
        <a className="login-brand" href="/" aria-label="العودة إلى DÉCOR.MA">
          <Image src="/images/logo.jpg" alt="شعار DÉCOR.MA" width={76} height={76} priority />
        </a>
        <p className="login-eyebrow">دخول خاص بالاستوديو</p>
        <h1>مرحباً بعودتكم</h1>
        <p className="login-intro">سجّلوا الدخول لإدارة الطلبات وطلبات الأقمشة والاستوديو.</p>
        <form onSubmit={submitLogin}>
          <label htmlFor="admin-password">كلمة مرور المسؤول</label>
          <div className="login-password">
            <FiLock aria-hidden="true" />
            <input
              id="admin-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="أدخلوا كلمة المرور"
              maxLength={256}
              required
              autoFocus
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"} <FiArrowRight aria-hidden="true" />
          </button>
        </form>
        <p className="login-footnote">البيت الأنيق يبدأ من عناية التفاصيل.</p>
      </div>
    </main>
  );
}
