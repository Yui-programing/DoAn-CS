# ==========================================
# TẦNG 1: BIÊN DỊCH VÀ BUILD ỨNG DỤNG REACT (VITE)
# ==========================================
FROM node:24-alpine AS build
WORKDIR /app

# ĐÃ SỬA: Bỏ chữ 'frontend/' vì Docker đã đứng sẵn trong folder này rồi
# Sao chép file quản lý thư viện trước để tận dụng Docker Cache
COPY package*.json ./
RUN npm install

# ĐÃ SỬA: Sửa 'COPY frontend/ ./' thành 'COPY . .' để copy toàn bộ source code React vào container
COPY . .

# --- Cấu hình nhận các biến môi trường từ docker-compose.yml truyền sang ---
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_SIGNALR_HUB_URL
ENV VITE_SIGNALR_HUB_URL=$VITE_SIGNALR_HUB_URL

# Thực hiện biên dịch mã nguồn React sang thư mục tĩnh /app/dist
RUN npm run build


# ==========================================
# TẦNG 2: KHỞI TẠO WEB SERVER NGINX ĐỂ PHỤC VỤ FILE TĨNH
# ==========================================
FROM nginx:alpine

# Sao chép toàn bộ thư mục sản phẩm tĩnh 'dist' từ tầng build sang thư mục phân phối của Nginx
COPY --from=build /app/dist /usr/share/nginx/html 

# Mở cổng 80 nội bộ của container Nginx
EXPOSE 80

# Chạy Nginx ở chế độ ngầm để giữ container luôn sống
CMD ["nginx", "-g", "daemon off;"]