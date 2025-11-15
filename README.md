این یک پروژه [Next.js](https://nextjs.org) است که با [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) راه‌اندازی شده است.

## شروع کار

ابتدا سرور توسعه را اجرا کنید:

```bash
npm run dev
# یا
yarn dev
# یا
pnpm dev
# یا
bun dev
```

با مرورگر خود [http://localhost:3000](http://localhost:3000) را باز کنید تا نتیجه را مشاهده کنید.

شما می‌توانید با ویرایش `app/page.tsx` شروع به ویرایش صفحه کنید. صفحه به‌طور خودکار هنگام ویرایش فایل بروزرسانی می‌شود.

این پروژه از [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) برای بهینه‌سازی خودکار و بارگذاری [Geist](https://vercel.com/font)، یک خانواده فونت جدید برای Vercel استفاده می‌کند.

## دسترسی به دوربین در Safari iOS

برای استفاده از عملکرد دوربین در Safari iOS، باید از یک متن امن (HTTPS) به برنامه دسترسی داشته باشید. برای توسعه:

1. **برای توسعه محلی روی همان دستگاه:** برنامه روی `http://localhost:3000` کار می‌کند
2. **برای تست روی دستگاه iOS از طریق شبکه:** از [ngrok](https://ngrok.com/) برای ایجاد یک تونل امن استفاده کنید:
   - ngrok را نصب کنید: `npm install -g ngrok`
   - برنامه خود را راه‌اندازی کنید: `npm run dev`
   - در ترمینال دیگر: `ngrok http 3000`
   - از طریق iOS خود URL HTTPS ارائه شده توسط ngrok را باز کنید

## اطلاعات بیشتر

برای یادگیری بیشتر در مورد Next.js، به منابع زیر نگاه کنید:

- [مستندات Next.js](https://nextjs.org/docs) - در مورد ویژگی‌ها و API Next.js بیاموزید.
- [آموزش Next.js](https://nextjs.org/learn) - یک آموزش تعاملی Next.js.

می‌توانید [مخزن GitHub Next.js](https://github.com/vercel/next.js) را بررسی کنید - نظرات و مشارکت‌های شما استقبال می‌شود!

## استقرار در Vercel

آسان‌ترین راه برای استقرار برنامه Next.js شما استفاده از [پلتفرم Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) از سوی سازندگان Next.js است.

برای جزئیات بیشتر [مستندات استقرار Next.js](https://nextjs.org/docs/app/building-your-application/deploying) را بررسی کنید.









npm run dev -- --experimental-https