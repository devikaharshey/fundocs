# 📝 FunDocs

<img width="1919" height="823" alt="Screenshot 2025-09-12 033530" src="https://github.com/user-attachments/assets/98c0429d-edec-4562-89a9-207b5846689c" />

Turn boring documentation into **interactive quests**! FunDocs gamifies learning by transforming documentation into fun stories, explanations, flashcards, coding challenges, and step-by-step guides.

FunDocs is built with **Next.js** for the frontend, **Flask** for the backend, and **Appwrite** for user management, storage and database. It leverages **Gemini** for AI-powered content generation.

---

## 🎯 Project Goal

FunDocs aims to make reading and learning documentation **engaging, gamified, and interactive**. Users can:

* Submit a link or raw text to convert into quests.
* Track their progress with XP, badges, and streaks.
* Learn via story-mode explanations, challenges, and flashcards.
* Participate in tips/crowdsourced notes for collaborative learning.

---

## 🚀 Core Features

1. 𝗗𝗼𝗰𝘀 𝗘𝘅𝗽𝗹𝗼𝗿𝗲𝗿 – Navigate through a curated collection of various tech docs.
2. 𝗦𝘁𝗼𝗿𝘆 𝗠𝗼𝗱𝗲 & 𝗦𝘁𝗲𝗽-𝗯𝘆-𝗦𝘁𝗲𝗽 𝗘𝘅𝗽𝗹𝗮𝗶𝗻𝗲𝗿 – AI-generated analogies and step-by-step breakdowns.
3. 𝗖𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲𝘀 & 𝗙𝗹𝗮𝘀𝗵𝗰𝗮𝗿𝗱𝘀 – Interactive coding tasks and bite-sized learning cards.
4. 𝗚𝗮𝗺𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 – XP, badges, streaks, leaderboard tracking.
5. 𝗧𝗶𝗽𝘀 𝗟𝗮𝘆𝗲𝗿 – Add, upvote, downvote, or delete notes with responsive grid layouts.
6. 𝗨𝘀𝗲𝗿 𝗠𝗮𝗻𝗮𝗴𝗲𝗺𝗲𝗻𝘁 – Signup/Login, avatar upload, profile page, protected routes, storage & database, all powered by Appwrite.
7. 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱 𝗠𝗮𝗿𝗸𝗱𝗼𝘄𝗻 – Collapsible and copyable code blocks for better readability.

---

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Appwrite](https://img.shields.io/badge/Appwrite-FF2882?style=for-the-badge&logo=appwrite&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-ff69b4?style=for-the-badge)

---

## 📂 Directory Structure

```
fundocs/
├─ frontend/   → Next.js app (components, routes, lib)
└─ backend/    → Flask app (routes: fetch-clean-doc, generate_all, delete_account, delete_doc, user management)
```

---

## 🔄 Key Workflows

1. **Add Documentation:** Submit URL or raw text → Cleaned by Flask → Stored in Appwrite → View in dashboard.
2. **Learn & Play:** Explore Story, Steps, Challenges, Flashcards → Progress tracked per user.
3. **Tips:** Add, vote, delete notes → Realtime animations & responsive UI.
4. **Authentication:** Protected pages, signup/login/logout/delete account, avatar management using Appwrite.

---

## 🏅 Gamification

* Gain XP for each level completed.
* Earn badges like **Layout Sprout**, **Consistency Champ**, **Comeback Kid**.
* Leaderboard shows user rankings, avatars, and badge counts.
* Progress tracking with streaks, XP, and badge achievements.

---
