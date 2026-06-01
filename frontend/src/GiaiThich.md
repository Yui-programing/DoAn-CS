src/
├── assets/             # Hình ảnh, icons, fonts, svg...
├── components/         # Các component dùng chung cho toàn dự án (Button, Input, Modal...)
│   ├── CommonButton/
│   │   ├── CommonButton.tsx
│   │   └── CommonButton.css (nếu có)
│   └── index.ts        # Export nhanh các component
├── contexts/           # Quản lý Global State bằng React Context (Theme, Auth...)
├── hooks/              # Các Custom Hooks dùng chung tên (useAuth, useDebounce...)
├── layouts/            # Giao diện sài chung khung (Header, Footer, Sidebar, MainLayout...)
├── pages/              # Các trang chính của ứng dụng (Home, Login, ProductDetail...)
│   ├── Home/
│   │   ├── Home.tsx # UI chính của home
        ├── useHome.ts # phần sử lí logic của home
│   │   └── components/ # Component chỉ dùng riêng cho trang Home này
│   └── Login/
├── routes/             # Cấu hình định tuyến (AppRoutes.tsx)
├── services/           # Quản lý các hàm gọi API (axios client, api endpoints)
├── types/              # Định nghĩa các TypeScript interface/type dùng chung
├── utils/              # Các hàm helper bổ trợ (format ngày tháng, validate dữ liệu...)
├── App.css
├── App.tsx
├── index.css
└── main.tsx