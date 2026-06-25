
---

TÀI LIỆU HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG 

Tài liệu này hướng dẫn chi tiết từng bước cấu hình, quản trị cơ sở dữ liệu, triển khai Backend lên Azure và Frontend lên Vercel.

---

PHẦN 1: CHUẨN BỊ VÀ ĐIỀU KIỆN 

* Tài khoản Azure (đã kích hoạt subscription cho sinh viên hoặc free trial).


* Tài khoản Vercel (liên kết với GitHub).


* Repository chứa mã nguồn (Backend và Frontend) đã được đẩy lên GitHub.


* Công cụ quản lý DB: SQL Server Management Studio (SSMS) hoặc Azure Data Studio.



---

PHẦN 2: TRIỂN KHAI CƠ SỞ DỮ LIỆU (AZURE SQL DATABASE) 

Bước 1: Tạo Azure SQL Database trên Portal 

1. Truy cập Azure Portal và chọn **Create a resource** $\rightarrow$ Chọn **SQL Database**.


2. Cấu hình các thông tin cơ bản: 


* 
**Resource Group:** Tạo mới hoặc chọn nhóm có sẵn.


* 
**Database name:** Đặt tên cho DB (ví dụ: `DuAnDb`).


* 
**Server:** Chọn *Create new* nếu chưa có. Đặt tên server, chọn vùng (Region) gần Việt Nam (như `Southeast Asia`), sử dụng phương thức xác thực `SQL authentication`, tạo tài khoản `Admin Login` và `Password`.


* 
**Compute + storage:** Để tiết kiệm chi phí chọn **Looking for production** $\rightarrow$ Đổi thành **Serverless** hoặc gói **DTU-based (Basic)** để tránh phát sinh chi phí lớn.




3. Nhấn **Review + create** $\rightarrow$ **Create**.



Bước 2: Cấu hình Tường lửa (Firewall) cho SQL Server 

Để Backend và máy cá nhân của bạn có thể kết nối vào DB: 

1. Vào tài nguyên SQL Server vừa tạo $\rightarrow$ ngay tại tab **Overview** nhìn lên menu trên cùng $\rightarrow$ chọn **Set server firewall**.


2. Tại tab **Public access**: 


* Tích chọn mục **“Allow Azure services and resources to access this server”** (Bắt buộc để Azure App Service kết nối được vào đây).


* Tại mục **Firewall rules**, nhấn **Add your client IPv4 address** để chính máy tính của bạn có thể truy cập vào DB nhằm nạp dữ liệu.




3. Nhấn **Save**.



Bước 3: Khởi tạo Cấu trúc Dữ liệu (Dapper Workflow) 

1. Di chuyển vào **Query editor** và đăng nhập tại khoản vừa mới tạo.


2. Chọn **New query** và copy toàn bộ nội dung file script (`.sql`) khởi tạo table, dữ liệu mẫu của dự án và chạy **Execute** để hoàn tất cấu trúc DB trên đám mây.



---

PHẦN 3: TRIỂN KHAI BACKEND (.NET) LÊN AZURE APP SERVICE 

Bước 1: Tạo App Service trên Azure 

1. Trên Azure Portal, chọn **Create a resource** $\rightarrow$ Chọn **Web App (App Service)**.


2. Cấu hình thông tin: 


* 
**Publish:** Chọn `Code`.


* 
**Runtime stack:** Chọn phiên bản .NET tương ứng với dự án (`.NET 10 (LTS)`).


* 
**Operating System:** `Linux` (thường tối ưu chi phí hơn) hoặc `Windows`.


* 
**Pricing Plan:** Chọn gói **Free (F1)** hoặc **Basic (B1)** dành cho mục đích học tập/thử nghiệm.


* 
**Location:** `East Asia` (gần với Việt Nam để tối ưu đường truyền).




3. Nhấn **Review + create** $\rightarrow$ **Create**.



Bước 2: Cấu hình Biến môi trường (Environment Variables) 

Ta sẽ cấu hình trực tiếp trên Azure để đảm bảo bảo mật.

1. Vào Web App vừa tạo $\rightarrow$ Menu trái chọn **Environment variables**.


2. Tại tab **App settings**, nhấn **Add** để tạo biến mới: 


* 
*Tuỳ vào số lượng biến trong file cấu hình (appsetting.json)* 


* 
**Name:** `ConnectionStrings__DefaultConnection` (hoặc tên tương ứng trong file cấu hình của bạn).


* 
**Value:** Điền chuỗi kết nối ADO.NET của Azure SQL (quay lại trang Azure SQL và ấn vào DB tại menu bên trái chọn **Setting** $\rightarrow$ **Connection strings** $\rightarrow$ copy chuỗi kết nối).




3. Nhấn **Apply** ở dưới và **Save** ở phía trên cùng để lưu cấu hình.



Bước 3: Deploy Code từ GitHub thông qua Deployment Center (CI/CD) 

1. Trong Web App, chọn **Deployment** $\rightarrow$ **Deployment Center** ở menu bên trái.


2. Tại mục **Source**, chọn **GitHub**. Thực hiện xác thực liên kết với tài khoản GitHub của bạn nếu là lần đầu.


3. Chọn chính xác **Organization**, **Repository**, và **Branch** (ví dụ: `main` hoặc `master`) chứa code Backend.


4. Azure sẽ tự động sinh ra một file workflow GitHub Actions trong repository của bạn.


5. Nhấn **Save**. Quá trình build và deploy sẽ tự động kích hoạt.


6. Bạn có thể theo dõi tiến độ trực tiếp tại tab **Actions** trên GitHub.


7. Sau khi thành công, truy cập vào URL do Azure cung cấp tại mục overview (ví dụ: `https://your-app.azurewebsites.net/swagger`) để kiểm tra API.



---

PHẦN 4: TRIỂN KHAI FRONTEND LÊN VERCEL 

Bước 1: Import Project từ GitHub vào Vercel 

1. Truy cập vào **vercel.com** và đăng nhập (bằng github của bạn).


2. Nhấn nút **Add New...** $\rightarrow$ Chọn **Project**.


3. Tại danh sách Repository từ GitHub, tìm đến dự án Frontend của bạn và nhấn **Import**.



Bước 2: Cấu hình Build và Biến môi trường trên Vercel 

1. 
**Framework Preset:** Vercel sẽ tự nhận diện framework bạn dùng (React, Next.js, Vite, v.v.). Nếu nhận diện đúng, giữ nguyên, nếu không thì chọn vào framework dự án đang sử dụng.


2. Tại mục **Environment Variables**, bạn cần trỏ các API call từ Frontend về Server Azure: 


* 
**Key:** Ví dụ `REACT_APP_API_URL` hoặc `VITE_API_URL` (tùy thuộc vào cách bạn đặt tên trong code).


* 
**Value:** Địa chỉ URL của Azure App Service vừa tạo ở Phần 3 (Ví dụ: `https://your-app.azurewebsites.net`).




3. Nhấn **Add**.



Bước 3: Deploy và Kiểm tra 

1. Nhấn nút **Deploy**. Vercel sẽ tiến hành cài đặt package, build ứng dụng.


2. Sau 1-2 phút, bạn sẽ nhận được thông báo thành công kèm theo đường link deploy chính thức của Frontend (dạng `https://your-project.vercel.app`).



---

PHẦN 5: CẤU HÌNH BẢO MẬT CORS TRỰC TIẾP TRÊN AZURE PORTAL 

Khi Frontend (Vercel) gọi API tới Backend (Azure), trình duyệt sẽ chặn lại do cơ chế bảo mật CORS nếu ta chưa cấu hình cho phép domain của Vercel truy cập. Thay vì cấu hình trong code .NET, ta có thể cấu hình trực tiếp trên giao diện quản trị của Azure App Service như sau: 

Bước 1: Truy cập vào mục cấu hình CORS trên Azure 

1. Quay lại **Azure Portal**.


2. Tìm và chọn dịch vụ **App Services**, sau đó nhấp vào tên Web App mà bạn đã tạo ở Phần 3.


3. Ở menu thanh bên trái, cuộn xuống mục **API** và chọn **CORS**.



Bước 2: Thêm Domain của Frontend Vercel 

1. Tích chọn vào ô **Enable Access-Control-Allow-Credentials**.


2. Tại giao diện cấu hình CORS, bạn sẽ thấy danh sách **Allowed Origins**.


3. Nhập URL chính thức của Frontend trên Vercel vào ô trống (trong mục Overview tại vercel tìm dòng Domains và copy chuỗi URL đó).


* 
*Ví dụ:* `https://your-project.vercel.app` 




4. 
**Lưu ý quan trọng từ Azure:** URL nhập vào không được chứa dấu gạch chéo ở cuối.



Bước 3: Lưu cấu hình 

1. Nhấn nút **Save** ở thanh công cụ phía trên cùng để áp dụng thay đổi.


2. Azure sẽ mất khoảng 10 - 30 giây để cập nhật lại cấu hình hệ thống. Lúc này, mọi request từ Vercel gửi tới App Service sẽ được Azure tự động chấp nhận.
