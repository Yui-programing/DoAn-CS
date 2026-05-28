
## Tổng Quan
**Chức năng riêng biệt của từng folder**
---

## 📂 Các Thư Mục Chính

### 1. 📦 **components/**
**Mục đích:** Lưu trữ các React Component(thành phần react) tái sử dụng (Reusable Components)

**Chứa:**
- UI Components (nút bấm, input, modal, card, v.v.)
- Features Components (các component có logic riêng)
- Layout Components (header, sidebar, footer)

**Ví dụ:**
```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── Button.test.tsx
├── Modal/
├── Card/
├── Header/
└── Sidebar/
```

**Ví dụ sử dụng:**
```tsx
import Button from '@/components/Button';
import Modal from '@/components/Modal';
```

---

### 2. 🎨 **styles/**
**Mục đích:** Lưu trữ toàn bộ file styling toàn cục và theme

**Chứa:**
- Global CSS / SCSS
- Theme configuration
- Variables (màu sắc, kích thước, font)
- Utilities classes

**Ví dụ cấu trúc:**
```
styles/
├── globals.css
├── variables.css
├── theme.css
├── animations.css
└── utilities.css
```

**Ví dụ nội dung:**
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 8px;
}
```

---

### 3. 🎯 **pages/**
**Mục đích:** Chứa các trang chính của ứng dụng (Page Components)

**Chứa:**
- Trang chủ (Home)
- Trang chi tiết sản phẩm
- Trang đăng nhập / đăng ký
- Trang 404 Not Found
- v.v.

**Cấu trúc thường gặp:**
```
pages/
├── Home.tsx
├── Dashboard.tsx
├── ProductDetail.tsx
├── Login.tsx
├── Register.tsx
└── NotFound.tsx
```

**Đặc điểm:**
- Mỗi file tương ứng với một route
- Thường là container component
- Kết nối với Context, API calls

---

### 4. 🪝 **hooks/**
**Mục đích:** Chứa các custom React Hook (Logic tái sử dụng)

**Chứa:**
- Custom hooks cho state management
- Custom hooks cho API calls
- Custom hooks cho form handling
- Custom hooks cho validation

**Ví dụ cấu trúc:**
```
hooks/
├── useAuth.ts
├── useFetch.ts
├── useForm.ts
├── useLocalStorage.ts
├── usePagination.ts
└── useTheme.ts
```

**Ví dụ sử dụng:**
```tsx
const { user, login } = useAuth();
const { data, loading, error } = useFetch('/api/products');
```

---

### 5. 🔌 **context/**
**Mục đích:** Quản lý Global State sử dụng React Context API

**Chứa:**
- AuthContext (quản lý thông tin người dùng)
- ThemeContext (quản lý theme sáng/tối)
- NotificationContext (notification toàn cục)
- AppContext (các trạng thái chung)

**Cấu trúc thường gặp:**
```
context/
├── AuthContext.tsx
├── ThemeContext.tsx
├── NotificationContext.tsx
└── AppProvider.tsx (Provider wrapper)
```

**Ví dụ sử dụng:**
```tsx
import { useAuth } from '@/context/AuthContext';

const { user, logout } = useAuth();
```

---

### 6. 🔗 **services/**
**Mục đích:** Quản lý API calls và các service logic

**Chứa:**
- API client configuration
- API service functions
- External API integrations
- Utility services

**Cấu trúc thường gặp:**
```
services/
├── api.ts (Axios/Fetch configuration)
├── authService.ts
├── userService.ts
├── productService.ts
├── uploadService.ts
└── notificationService.ts
```

**Ví dụ:**
```tsx
// services/userService.ts
export const getUserProfile = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// pages/Profile.tsx
import { getUserProfile } from '@/services/userService';
```

---

### 7. 📝 **types/**
**Mục đích:** Định nghĩa TypeScript interfaces và types

**Chứa:**
- Interfaces cho models (User, Product, Order, v.v.)
- Types cho API responses
- Enums cho constants
- Global types

**Cấu trúc thường gặp:**
```
types/
├── index.ts (exports chính)
├── models.ts
├── api.ts
├── common.ts
└── enums.ts
```

**Ví dụ:**
```tsx
// types/models.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
}
```

**Sử dụng trong code:**
```tsx
import { User, Product } from '@/types/models';

const user: User = { id: '1', name: 'John', email: 'john@example.com', role: 'user' };
```

---

## 🔄 Quy Trình Import Thông Dụng

```
User Action (pages/Home.tsx)
    ↓
useHook/useContext (hooks/, context/)
    ↓
Call API (services/)
    ↓
Update State
    ↓
Render Components (components/)
    ↓
Apply Styles (styles/)
```

---

## 💡 Best Practices

| Quy Tắc | Chi Tiết |
|---------|---------|
| **Single Responsibility** | Mỗi folder chỉ làm một việc duy nhất |
| **DRY Principle** | Tái sử dụng components và hooks, tránh lặp code |
| **Type Safety** | Luôn định nghĩa types/interfaces rõ ràng |
| **Organized Imports** | Sử dụng path aliases (`@/`) để import dễ hơn |
| **Separation of Concerns** | Logic (services) tách riêng với UI (components) |
| **Naming Convention** | Components bắt đầu chữ hoa (PascalCase), files khác dùng camelCase |

---


---

## 📌 Tóm Tắt Nhanh

| Folder | Vai Trò | Ví Dụ |
|--------|---------|-------|
| **components/** | UI & Features tái sử dụng | Button, Card, Header |
| **pages/** | Các trang chính | Home, Product, Profile |
| **services/** | API & Business Logic | userService, productService |
| **hooks/** | Custom Logic | useAuth, useFetch |
| **context/** | Global State | AuthContext, ThemeContext |
| **types/** | TypeScript Definitions | User, Product interfaces |
| **styles/** | Global Styling | CSS variables, themes |

---

**Ngày tạo:** May 27, 2026  
**Phiên bản:** 1.0
