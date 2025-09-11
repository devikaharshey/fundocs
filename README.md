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

* **Docs Explorer / Level Map** – Navigate your docs as interactive levels.
* **Story Mode & Explain Slider** – AI-generated analogies and step-by-step breakdowns.
* **Challenges & Flashcards** – Interactive coding tasks and bite-sized learning cards.
* **Gamification** – XP, badges, streaks, leaderboard tracking.
* **Tips Layer** – Add, upvote, downvote, or delete notes with responsive grid layouts.
* **User Management** – Signup/Login, avatar upload, profile page, protected routes.
* **Enhanced Markdown** – Collapsible and copyable code blocks for better readability.

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
