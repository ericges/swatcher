<div align="center">
  <h1>🎨 Swatcher</h1>
  <p>A comprehensive color system design tool built with React, Vite, and Tailwind CSS v4.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg)](https://tailwindcss.com/)
  [![Deploy to GitHub Pages](https://github.com/ericges/swatcher/actions/workflows/deploy.yml/badge.svg)](https://github.com/ericges/swatcher/actions)
</div>

<br />

## 📖 About The Project

> [!NOTE]
> This project is primarily built and maintained using AI coding agents.

Swatcher is a powerful and intuitive color system design tool aimed at helping developers and designers create, manage, and export accessible color palettes and design tokens. Whether you're building a design system from scratch or fine-tuning an existing one, Swatcher provides the precision tools you need.

### ✨ Key Features

- **Advanced Color Math:** Precise color calculations and manipulations across different color spaces.
- **Robust State Management:** Powered by React `useReducer` and the Context API for scalable application state.
- **Dark-Themed Interface:** A clean, user-friendly workspace optimized for focused design work.
- **Export Formats:** Easily export your color system as design tokens (CSS variables, JSON, etc.) for direct integration into your projects.
- **Accessibility Built-in:** Includes APCA contrast calculations to ensure your colors are readable and compliant with modern accessibility standards.
- **Gamut Warnings:** Get real-time alerts when colors fall outside the standard sRGB gamut, preventing display inconsistencies.
- **Customizable Curve Editing:** Fine-tune color scales and gradients with a visual curve editing system.

### 🛠️ Built With

- [React 19](https://react.dev/)
- [Vite 6](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need Node.js installed on your machine.
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ericges/swatcher.git
   ```
2. Navigate to the project directory
   ```bash
   cd swatcher
   ```
3. Install NPM dependencies
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

---

## 💻 Usage

### Development Commands

- `npm run dev` - Starts the local development server.
- `npm run build` - Creates a production-ready build in the `dist` directory.
- `npm run lint` - Runs ESLint to check for code style issues and ensure code quality.
- `npm run preview` - Locally preview the production build.

### Deployment

This project is configured for continuous deployment using GitHub Actions. Whenever a commit is pushed to the `main` branch, the application is automatically built and deployed as static files to GitHub Pages.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag `enhancement`. Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Local Development Guidelines
- Ensure your code passes the linting checks by running `npm run lint` before opening a pull request.
- Keep components focused and use the provided `Tailwind CSS v4` utility classes.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [APCA Contrast](https://github.com/Myndex/SAPC-APCA)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
