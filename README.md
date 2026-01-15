# QN Office Management System

Hệ thống quản lý vận hành văn phòng Quy Nhơn (QN Office), tích hợp Web Portal và Mezon Bot để quản lý các hoạt động nội bộ.

---

## 📋 Chi tiết Chức năng & Nghiệp vụ

### 1. 🍱 Pantry & Transactions
- **Menu Pantry**: Hiển thị danh sách các món ăn/uống hiện có tại văn phòng.
- **Transactions**:
    - Tích hợp **Blockchain Dong.mezon** để theo dõi minh bạch các giao dịch chuyển tiền pantry.
    - Lưu trữ immutable log các giao dịch, cho phép tra cứu lịch sử đóng góp và chi tiêu.

### 2. 📅 Lịch Vận hành Văn phòng
Hệ thống cung cấp lịch tổng hợp hiển thị: **Lịch Dọn dẹp**, **Lịch Open Talk**, và **Các ngày nghỉ lễ**.

#### A. Quản lý Ngày nghỉ (Holidays)
- Xem và thêm các ngày nghỉ lễ của văn phòng.
- Các ngày nghỉ sẽ tự động được bỏ qua khi hệ thống sinh lịch làm việc.

#### B. Lịch Trực nhật (Cleaning Schedule)
- **Thời gian**: Diễn ra hàng ngày từ **Thứ 2 đến Thứ 6**.
- **Cơ chế**: Xếp lịch xoay vòng cho tất cả nhân viên Active.
- **Logic Đổi lịch (Swap)**:
    - Staff có thể xem lịch và đổi lịch trực nhật.
    - **Quy tắc**:
        - Chỉ đổi lịch trong **tương lai**.
        - Chỉ đổi trong **cùng 1 chu kỳ**.
        - Không được tạo request mới nếu đang có request `PENDING`.
        - Yêu cầu đổi lịch hiển thị công khai cho toàn VP.

#### C. Lịch Open Talk
- **Thời gian**: Mặc định **Thứ 7 hàng tuần** (tối đa 1 buổi/tuần).
- **Cơ chế**: Xếp lịch xoay vòng.
- **Quy trình Slide**:
    - Speaker (Host) cần submit link slide/timesheet trước buổi Open Talk.
    - **Submit hộ**: HR, GDVP, hoặc Participants khác trong event có thể submit thay.
    - Mọi người có thể xem danh sách slide đã submit.
- **Logic Đổi lịch**: Tương tự lịch trực nhật.

### 3. @ Quản lý Nhân sự (Staff)
- Đồng bộ danh sách nhân viên tại VP Quy Nhơn.
- Quản lý trạng thái Active/Inactive để xếp lịch.

### 4. ⚠️ Quản lý Vi phạm (Penalty)
- Xem danh sách các loại vi phạm và mức phạt quy định.
- Theo dõi lịch sử vi phạm của cá nhân và toàn văn phòng.

---

## 🛡️ Phân quyền & Roles

Hệ thống phân quyền theo 3 vai trò chính: **STAFF**, **HR**, **GDVP**.

### 👤 STAFF (Nhân viên)
**Quyền hạn**:
- **Xem**: Tất cả các lịch (Cleaning, OpenTalk, Holiday), Menu, Vi phạm, Slide của người khác.
- **Thao tác**:
    - Yêu cầu đổi lịch (bắt buộc phải tạo request trên hệ thống).
    - Submit slide Open Talk (cho mình hoặc team).

### 👥 HR (Nhân sự)
**Quyền hạn**:
- Gồm toàn bộ quyền của **STAFF**.
- **Quản lý Request**:
    - Review và Approve/Reject các yêu cầu đổi lịch.
    - **Lưu ý**: Không được phép Approve request của **chính bản thân mình**.
- **Quản lý Lịch**: Có quyền đổi lịch trực tiếp (Force Swap) trên Calendar.
- **Cấu hình**: Config Channel ID để Bot gửi thông báo.

### 👤 GDVP (Giám đốc Văn phòng)
**Quyền hạn**:
- Gồm toàn bộ quyền của **HR**.
- **Quyền cao cấp**:
    - Approve các request do HR tạo.
    - Approve request của **chính mình**.
    - Quản lý tất cả hoạt động cấp cao.

---

## 🤖 Tự động hóa & Bot Automation

### 1. Automation Rules (Backend)
- **Sinh lịch tự động**: Trước **1 tuần** khi kết thúc chu kỳ hiện tại, hệ thống tự động tạo lịch Dọn dẹp & Open Talk cho chu kỳ mới.
- **Cập nhật trạng thái**: Hàng ngày tự động set các sự kiện dọn dẹp đã qua thành `COMPLETED`.

### 2. Bot Notification Schedule
Bot gửi thông báo tự động theo múi giờ làm việc (GMT+7):

- **Lịch Trực nhật**:
    - **08:00 Sáng**: Ping channel + Tag nhân viên có lịch trực nhật hôm nay (Check-in).
    - **17:00 Chiều**: Check-list + Nhắc nhở Team trực nhật của **ngày mai**.

- **Lịch Open Talk (Slide Reminder)**:
    - Nếu Participant chưa submit slide, Bot ping vào **09:00 Sáng** các ngày:
        - 7 ngày trước sự kiện.
        - 5 ngày trước sự kiện.
        - 3 ngày trước sự kiện.
        - 1 ngày trước sự kiện (Gấp).
 qua Bot.

---

## 🛠️ Dành cho Developer (Onboarding)

Chào mừng bạn đến với project! Dưới đây là những thông tin cần thiết để bắt đầu.

### Kiến trúc Hệ thống (Architecture)
Dự án sử dụng **Nx Monorepo** để quản lý mã nguồn tập trung:

- **`apps/web`**: Frontend Portal (Next.js, ShadCN UI).
- **`apps/api`**: Backend Server (NestJS, TypeORM, PostgreSQL).
- **`apps/bot`**: Mezon Bot Service (NestJS).
- **`libs`**: Thư viện dùng chung (Types, Utilities, UI Components).

### Công nghệ sử dụng (Tech Stack)
- **Frontend**: React, Next.js, TailwindCSS, TypeScript.
- **Backend**: Node.js, NestJS, TypeORM.
- **Database**: PostgreSQL.
- **Auth**: Mezon OAuth 2.0.
- **Blockchain**: Dong.mezon (EVM compatible).

### Tài liệu Kỹ thuật
Các tài liệu chi tiết nằm trong thư mục `/docs`:
- [System Overview & Architecture](./docs/SYSTEM_OVERVIEW.md)
- [Authentication Flow](./docs/AUTHENTICATION.md)
- [Cron & Automation System](./docs/CRON_SYSTEM.md)
- [Bot Features Spec](./docs/BOT_FEATURES.md)
- [Coding Standards](./docs/CODING_STANDARDS.md)

### ⚡ Quick Start

1.  **Cài đặt Environment**:
    Cần có Node.js (v18+), Yarn, và Docker (cho DB).

2.  **Cài đặt Dependencies**:
    ```bash
    yarn install
    ```

3.  **Khởi chạy Database (Local)**:
    ```bash
    docker-compose up -d db
    ```

4.  **Chạy ứng dụng**:
    ```bash
    # Chạy Backend API
    yarn dev:api
    
    # Chạy Frontend Web
    yarn dev:web
    
    # Chạy toàn bộ (Dev mode)
    yarn start:dev
    ```

5.  **Truy cập**:
    - Web: `http://localhost:4200`
    - API Swagger: `http://localhost:3000/api`

---
Copyright © 2024 QN Office Management. Built with ❤️ by QN Tech Team.
