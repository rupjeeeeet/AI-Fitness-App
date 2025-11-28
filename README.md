# Fitness App

A personalized fitness planning application that generates customized workout routines, nutrition plans, and motivational content based on your fitness profile and goals.

## 📋 Description

Fitness App is an intelligent fitness companion that helps users create personalized fitness plans tailored to their individual needs. By collecting information about your fitness level, goals, dietary preferences, and medical history, the app generates:

- **Personalized Workout Plans**: Custom exercise routines based on your fitness level and objectives
- **Nutrition Guidance**: Diet recommendations aligned with your goals
- **AI-Generated Images**: Visual representations of your fitness journey
- **Motivational Content**: Daily motivation to keep you on track
- **PDF Export**: Download your fitness plan for offline reference
- **Dark/Light Theme**: Comfortable viewing experience with theme toggle

## 🚀 Features

- **User Profile Form**: Collect detailed fitness information including:
  - Personal details (name, age, gender, height, weight)
  - Fitness goals (weight loss, muscle gain, endurance, general wellness)
  - Experience level (beginner, intermediate, advanced)
  - Location and dietary preferences
  - Medical history considerations

- **AI-Powered Generation**: Leverages Replicate API to generate personalized fitness recommendations and images

- **Results Dashboard**: Display generated fitness plans in attractive card-based layouts

- **Image Modal**: Preview and manage generated fitness images

- **PDF Export**: Convert and download your fitness plan using html2canvas and jsPDF

- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

- **Dark Mode Support**: Theme toggle for comfortable viewing

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) - React framework with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- **Animations**: [Framer Motion](https://www.framer.com/motion) - Animation library
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **AI Integration**: [Replicate](https://replicate.com) - API for AI model inference
- **Export Utilities**: 
  - [html2canvas](https://html2canvas.herokuapp.com) - Convert HTML to canvas
  - [jsPDF](https://jspdf.dev) - PDF generation
- **Linting**: [ESLint](https://eslint.org) - Code quality

## 📦 Prerequisites

- Node.js 18+ or higher
- npm, yarn, pnpm, or bun package manager
- Replicate API key (for AI features)

## ⚙️ Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/fitness-app.git
cd fitness-app
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_REPLICATE_API_KEY=your_replicate_api_key_here
```

4. **Run the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## 🎯 Usage

1. Fill out the fitness profile form with your personal details and preferences
2. Submit the form to generate your personalized fitness plan
3. View the generated recommendations on the results page
4. Explore the generated fitness images in the image modal
5. Export your plan as a PDF for offline access
6. Toggle between dark and light themes using the theme toggle

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── generate/          # Generate fitness plans
│   │   ├── image/             # Generate fitness images
│   │   └── motivation/        # Get motivational content
│   ├── components/            # Reusable React components
│   │   ├── Form.jsx           # Fitness profile form
│   │   ├── ResultCards.jsx    # Display fitness results
│   │   ├── ImageModal.jsx     # Image preview modal
│   │   └── ThemeToggle.jsx    # Dark/light theme toggle
│   ├── results/               # Results page
│   ├── layout.js              # Root layout
│   ├── page.js                # Home page
│   └── globals.css            # Global styles
```

## 🔌 API Routes

- `POST /api/generate` - Generate personalized fitness plan
- `POST /api/image/generate` - Generate AI fitness images
- `GET /api/motivation` - Get motivational messages

## 🚀 Build & Deploy

### Build for production:
```bash
npm run build
npm start
```

### Deploy on Vercel:
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js:

1. Push your repository to GitHub
2. Visit [vercel.com](https://vercel.com/new)
3. Import your repository
4. Set environment variables in Vercel dashboard
5. Deploy!

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `jsconfig.json` - JavaScript configuration

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Replicate](https://replicate.com) - AI API
- [Framer Motion](https://www.framer.com/motion) - Animation library
- [Zustand](https://github.com/pmndrs/zustand) - State management

## 📧 Support

For support, email support@fitnessapp.com or open an issue on GitHub.

---

**Version**: 0.1.0  
**Last Updated**: November 28, 2025
