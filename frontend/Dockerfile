# 1. Build React App
FROM node:24-alpine AS build
WORKDIR /app

# Đi từ thư mục gốc vào frontend để lấy file package.json
COPY frontend/package*.json ./
RUN npm install

# Đi từ thư mục gốc copy toàn bộ code frontend vào
COPY frontend/ ./
RUN npm run build

# 2. Serve bằng Nginx
FROM nginx:alpine
# Lưu ý: Thay "dist" bằng "build" nếu bạn dùng Create React App thay vì Vite
COPY --from=build /app/dist /usr/share/nginx/html 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]