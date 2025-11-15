# Bus Ticket Booking - Client (Frontend)

Ứng dụng React TypeScript cho hệ thống đặt vé xe buýt với hai phần chính: Admin và User dashboard.

## 🛠 Tech Stack

- **React 18** với TypeScript (.tsx)
- **Vite** - Build tool nhanh và hiệu quả
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** style components với class-variance-authority
- **React Router Dom** - Routing
- **PostCSS & Autoprefixer**

## 📁 Cấu trúc Project

```
client/
├── src/
│   ├── admin/                # Admin dashboard
│   │   └── AdminDashboard.tsx
│   ├── user/                 # User interface
│   │   └── UserDashboard.tsx
│   ├── components/
│   │   └── ui/              # shadcn-style UI components
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn, etc.)
│   ├── App.tsx              # Main app với routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles với Tailwind
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies

```bash
cd client
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173

### 3. Build cho production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## 📱 Features

### Admin Dashboard (/admin)

- **Sidebar navigation** với các menu:
  - Dashboard chính
  - Quản lý xe buýt
  - Quản lý tuyến đường
  - Quản lý đặt vé
  - Quản lý người dùng
- **Dashboard metrics** hiển thị thống kê
- **Recent activities** theo dõi hoạt động gần đây

### User Dashboard (/user)

- **Header** với navigation và login button
- **Hero section** với form tìm kiếm chuyến xe
- **Popular routes** hiển thị tuyến đường phổ biến
- **Features section** giới thiệu ưu điểm
- **Footer** với thông tin liên hệ

## 🎨 UI Components

Sử dụng shadcn/ui style components:

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Card component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🔧 Configuration

### TailwindCSS

- Cấu hình với CSS variables cho theming
- Support cho dark mode
- Responsive design
- Custom component classes

### TypeScript

- Strict mode enabled
- Path mapping với `@/*` alias
- React 18 JSX transform

### Vite

- Fast HMR
- Path resolution cho `@/` imports
- TypeScript support

## 🚦 Routing

```typescript
/ → Redirect tới /dashboard
/dashboard → User Dashboard
/admin → Admin Dashboard
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

**Lưu ý:** Đây là frontend client, cần backend API để hoạt động đầy đủ.
