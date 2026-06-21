---------------------------------------------------------
-- 1. DROP TABLES (Xóa bảng theo thứ tự từ con đến cha)
---------------------------------------------------------
IF OBJECT_ID('OtpVerification', 'U') IS NOT NULL DROP TABLE OtpVerification;
IF OBJECT_ID('MediaTag', 'U') IS NOT NULL DROP TABLE MediaTag;
IF OBJECT_ID('Tag', 'U') IS NOT NULL DROP TABLE Tag;
IF OBJECT_ID('PlaylistTrack', 'U') IS NOT NULL DROP TABLE PlaylistTrack;
IF OBJECT_ID('Favorite', 'U') IS NOT NULL DROP TABLE Favorite;
IF OBJECT_ID('PlayHistory', 'U') IS NOT NULL DROP TABLE PlayHistory;
IF OBJECT_ID('MediaShare', 'U') IS NOT NULL DROP TABLE MediaShare;
IF OBJECT_ID('Notification', 'U') IS NOT NULL DROP TABLE Notification;
IF OBJECT_ID('Follow', 'U') IS NOT NULL DROP TABLE Follow;
IF OBJECT_ID('Playlist', 'U') IS NOT NULL DROP TABLE Playlist;
IF OBJECT_ID('ArtistRegistrations', 'U') IS NOT NULL DROP TABLE ArtistRegistrations;
IF OBJECT_ID('MediaItem', 'U') IS NOT NULL DROP TABLE MediaItem;
IF OBJECT_ID('Album', 'U') IS NOT NULL DROP TABLE Album;
IF OBJECT_ID('Artist', 'U') IS NOT NULL DROP TABLE Artist;
IF OBJECT_ID('UserProfile', 'U') IS NOT NULL DROP TABLE UserProfile;
IF OBJECT_ID('User', 'U') IS NOT NULL DROP TABLE [User];
GO

---------------------------------------------------------
-- 2. CREATE TABLES
---------------------------------------------------------
-- Bảng lưu trữ OTP
CREATE TABLE OtpVerification
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(256) NOT NULL,
    OtpCode NVARCHAR(6) NOT NULL,
    Purpose NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpiresAt DATETIME2 NOT NULL,
    IsUsed BIT NOT NULL DEFAULT 0
);

-- Bảng chứa thông tin Đăng nhập & Phân quyền
CREATE TABLE [User]
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'User',
    -- Các quyền: 'User', 'Admin', 'Artist'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE UserProfile
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    Bio NVARCHAR(MAX) NULL,
    IsPublic BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (Id) REFERENCES [User](Id) ON DELETE CASCADE
);

-- Bảng chứa thông tin Ca sĩ / Nghệ sĩ
CREATE TABLE Artist
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    [Name] NVARCHAR(255) NOT NULL,
    Bio NVARCHAR(MAX) NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    Genres NVARCHAR(500) NULL,
    BannerUrl NVARCHAR(1000) NULL,
    VerifiedAt DATETIME2 NULL,
    FOREIGN KEY (Id) REFERENCES [User](Id) ON DELETE CASCADE
);

-- Bảng chứa thông tin Album
CREATE TABLE Album
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    CoverImageUrl NVARCHAR(1000) NULL,
    ReleaseDate DATETIME2 NOT NULL,
    ArtistId UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (ArtistId) REFERENCES Artist(Id) ON DELETE SET NULL
);

CREATE TABLE Tag
(
    Id NVARCHAR(50) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [description] NVARCHAR(255) NULL
);

-- Bảng MediaItem (MediaType: 0 = Audio, 1 = Video)
CREATE TABLE MediaItem
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    FilePath NVARCHAR(1000) NOT NULL,
    CoverUrl NVARCHAR(1000) NULL,
    DurationInSeconds INT NOT NULL DEFAULT 0,
    MediaType INT NOT NULL DEFAULT 0,
    AlbumId UNIQUEIDENTIFIER NULL,
    ArtistId UNIQUEIDENTIFIER NOT NULL,
    -- references Artist(Id) (uploader/owner)
    IsPrivate BIT NOT NULL DEFAULT 0,
    ApprovalStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- Pending, Approved, Rejected
    ViewCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (AlbumId) REFERENCES Album(Id) ON DELETE SET NULL,
    FOREIGN KEY (ArtistId) REFERENCES Artist(Id) ON DELETE CASCADE
);

CREATE TABLE Playlist
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    IsPublic BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    TracksCount INT NOT NULL DEFAULT 0,
    TotalDuration INT NOT NULL DEFAULT 0,
    FOREIGN KEY (OwnerId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);

CREATE TABLE PlaylistTrack
(
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (PlaylistId, MediaItemId),
    FOREIGN KEY (PlaylistId) REFERENCES Playlist(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE NO ACTION
);

CREATE TABLE MediaTag
(
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    TagId NVARCHAR(50) NOT NULL,
    TaggedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (MediaItemId, TagId),
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES Tag(Id) ON DELETE CASCADE
);

CREATE TABLE Favorite
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE PlayHistory
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE Follow
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowingUserId UNIQUEIDENTIFIER NULL,
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (FollowerId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (FollowingUserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION
);

CREATE TABLE MediaShare
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NULL,
    PlaylistId UNIQUEIDENTIFIER NULL,
    [Message] NVARCHAR(MAX) NULL,
    SharedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (SenderId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (ReceiverId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE NO ACTION,
    FOREIGN KEY (PlaylistId) REFERENCES Playlist(Id) ON DELETE NO ACTION
);

-- Type: 0 = Shared, 1 = Followed, 2 = System
CREATE TABLE Notification
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    [Type] INT NOT NULL,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);

-- Bảng đăng ký làm Artist (Chờ Admin duyệt)
CREATE TABLE ArtistRegistrations
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    StageName NVARCHAR(255) NOT NULL,
    Genres NVARCHAR(255) NULL,
    IdCardUrl NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    -- Pending, Approved, Rejected
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ReviewedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES [User](Id) ON DELETE CASCADE
);
GO

---------------------------------------------------------
-- 3. INSERT SEED DATA (Dữ liệu mẫu)
---------------------------------------------------------
DECLARE @U1 UNIQUEIDENTIFIER = '11111111-1111-1111-1111-111111111111',
        @U2 UNIQUEIDENTIFIER = '22222222-2222-2222-2222-222222222222',
        @U3 UNIQUEIDENTIFIER = '33333333-3333-3333-3333-333333333333',
        @U4 UNIQUEIDENTIFIER = '44444444-4444-4444-4444-444444444444',
        @U5 UNIQUEIDENTIFIER = '55555555-5555-5555-5555-555555555555',
        @U6 UNIQUEIDENTIFIER = '66666666-6666-6666-6666-666666666666',
        @U7 UNIQUEIDENTIFIER = '77777777-7777-7777-7777-777777777777',
        @U8 UNIQUEIDENTIFIER = '88888888-8888-8888-8888-888888888888';

-- Insert tài khoản Đăng nhập vào bảng [User] (Mật khẩu: 123456)
INSERT INTO [User]
    (Id, Email, PasswordHash, [Role])
VALUES
    (@U1, 'hoangphuc@gmail.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'User'),
    (@U2, 'khachhang2@gmail.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'User'),
    (@U3, 'admin@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Admin'),
    (@U4, 'artist@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U5, 'ngotband@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U6, 'riotgames@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U7, 'justatee@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U8, 'freelanceartist@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist');

-- Insert UserProfile
INSERT INTO UserProfile
    (Id, FullName, AvatarUrl, Bio)
VALUES
    (@U1, N'Lê Phạm Hoàng Phúc', 'https://avatar.com/phuc.jpg', N'Sinh viên ĐH Sài Gòn. Thường đi uống cafe thư giãn lúc rảnh.'),
    (@U2, N'Khách hàng 2', 'https://avatar.com/kh2.jpg', N'Đang sống và làm việc tại TP.HCM.'),
    (@U3, N'TuneVault Administrator', 'https://avatar.com/admin.jpg', N'Quản trị viên hệ thống TuneVault.'),
    (@U4, N'Sơn Tùng M-TP', 'https://avatar.com/mtp.jpg', N'Nghệ sĩ nhạc Pop hàng đầu Việt Nam.'),
    (@U5, N'Ngọt Band', 'https://avatar.com/ngot.jpg', N'Ban nhạc Indie Việt Nam'),
    (@U6, N'Riot Games Music', 'https://avatar.com/riot.jpg', N'Nhà sản xuất âm nhạc trò chơi'),
    (@U7, N'Justatee x Phương Ly', 'https://avatar.com/justatee.jpg', N'Ca sĩ và nhà sản xuất R&B hàng đầu'),
    (@U8, N'Nghệ sĩ tự do', 'https://avatar.com/freelance.jpg', N'Nghệ sĩ tự do');

-- Insert Tags
INSERT INTO Tag
    (Id, Name)
VALUES
    ('T1', N'Indie'),
    ('T2', N'Pop'),
    ('T3', N'Gaming'),
    ('T4', N'Chill');

-- Insert Artist
INSERT INTO Artist
    (Id, Name, Bio, AvatarUrl, Genres, BannerUrl, VerifiedAt)
VALUES
    (@U5, N'Ngọt Band', N'Ban nhạc Indie Việt Nam', 'https://avatar.com/ngot.jpg', N'Indie, Rock', NULL, GETUTCDATE()),
    (@U6, N'Riot Games Music', N'Nhà sản xuất âm nhạc trò chơi', 'https://avatar.com/riot.jpg', N'EDM, Rock, Pop', NULL, GETUTCDATE()),
    (@U4, N'Sơn Tùng M-TP', N'Nghệ sĩ nhạc Pop hàng đầu Việt Nam', 'https://avatar.com/mtp.jpg', N'Pop, R&B', NULL, GETUTCDATE()),
    (@U7, N'Justatee x Phương Ly', N'Nghệ sĩ R&B', 'https://avatar.com/justatee.jpg', N'R&B, Pop', NULL, GETUTCDATE()),
    (@U8, N'Nghệ sĩ tự do', N'Nhà sản xuất tự do', 'https://avatar.com/freelance.jpg', N'Pop, Ballad', NULL, GETUTCDATE());

DECLARE @Album1Id UNIQUEIDENTIFIER = '98765432-9876-9876-9876-987654321098';

-- Insert Album
INSERT INTO Album
    (Id, Title, ReleaseDate, ArtistId)
VALUES
    (@Album1Id, N'Tuyển tập Indie', '2025-01-01', @U5);

-- Khai báo các Media Items ID thật (lưu online Cloudinary & wwwroot local)
DECLARE @M1 UNIQUEIDENTIFIER = 'E9EF9465-732D-4165-BF65-374AB7178F05', 
        @M2 UNIQUEIDENTIFIER = 'DC1C6608-72FE-4CAD-8DEC-6E0911050456',
        @M3 UNIQUEIDENTIFIER = '4A012ECD-70E7-4DDB-90F7-D51A30A88491', 
        @M4 UNIQUEIDENTIFIER = '54D1B50E-1988-41BA-9B2E-B939595D512E',
        @M5 UNIQUEIDENTIFIER = '32290D85-65EC-4E07-957A-6F605756952C',
        @M6 UNIQUEIDENTIFIER = '455972D7-D1DC-4483-9794-6D809679C8E1',
        @M7 UNIQUEIDENTIFIER = 'F1A8C3BD-E29B-4D82-A3D9-58D4F7C118A4',
        @M8 UNIQUEIDENTIFIER = '6C2D9B3E-74AF-4C11-9A3F-2B8E5D6C78F0',
        @M9 UNIQUEIDENTIFIER = 'B19B93F2-E96F-44DF-863F-1710E55F6164',
        @M10 UNIQUEIDENTIFIER = 'A7B3D5E1-2C9F-4B8A-8D6E-3F1C4A5B6D7C';

-- Insert MediaItem (Chỉ lưu các bài hát/MV thực tế có file thật, mặc định đã được duyệt - 'Approved')
INSERT INTO MediaItem
    (Id, Title, FilePath, CoverUrl, DurationInSeconds, MediaType, AlbumId, ArtistId, IsPrivate, ApprovalStatus, ViewCount)
VALUES
    (@M1, N'Lần Cuối', '/media/Lan-Cuoi.mp3', '/images/lan-cuoi.png', 221, 0, @Album1Id, @U5, 0, 'Approved', 1200000),
    (@M2, N'Em Dạo Này', '/media/Em-Dao-Nay.mp3', '/images/emdaonay.png', 252, 0, @Album1Id, @U5, 0, 'Approved', 850000),
    (@M3, N'Ticking Away', '/media/Ticking Away.mp3', '/images/ticking-away.png', 204, 0, NULL, @U6, 0, 'Approved', 620000),
    (@M4, N'To Ashes and Blood', '/media/to-ashes-and-blood.mp3', '/images/to ashe and blood.png', 245, 0, NULL, @U6, 0, 'Approved', 430000),
    (@M5, N'Billy Mode', '/media/Billy-mode.mp3', '/images/billy-mode.png', 192, 0, NULL, @U6, 0, 'Approved', 280000),
    (@M6, N'Come Alive', '/media/Come-Alive.mp3', '/images/come-alive.png', 243, 0, NULL, @U6, 0, 'Approved', 280000),
    (@M7, N'Come My Way', '/media/CMW.mp3', '/images/cmw.png', 258, 0, NULL, @U5, 0, 'Approved', 150000),
    (@M8, N'Biển,Đảo và Em', '/media/Bien-dao-va-em.mp3', '/images/biendaovaem.png', 296, 0, NULL, @U8, 0, 'Approved', 150000),
    (@M9, N'Thằng Điên', '/media/thangdien.mp4', '/images/Thang-dien.png', 286, 1, NULL, @U7, 0, 'Approved', 950000),
    (@M10, N'MV Đừng làm trái tim anh đau', '/media/dunglamtraitimanhdau.mp4', '/images/dunglamtraitimanhdau.png', 325, 1, NULL, @U4, 0, 'Approved', 950000);

-- Map Tags to MediaItems
INSERT INTO MediaTag
    (MediaItemId, TagId)
VALUES
    (@M1, 'T1'),
    (@M2, 'T1'),
    (@M3, 'T3'),
    (@M4, 'T3'),
    (@M5, 'T3'),
    (@M6, 'T4'),
    (@M9, 'T3');

-- Khai báo Playlist
DECLARE @P1 UNIQUEIDENTIFIER = NEWID();
DECLARE @P2 UNIQUEIDENTIFIER = NEWID();

-- Insert Playlist
INSERT INTO Playlist
    (Id, Title, OwnerId, TracksCount, TotalDuration)
VALUES
    (@P1, N'Giai điệu thư giãn cuối tuần', @U1, 3, 663),
    (@P2, N'Playlist chiến Valorant', @U1, 3, 600);

-- Insert PlaylistTrack
INSERT INTO PlaylistTrack
    (PlaylistId, MediaItemId)
VALUES
    (@P1, @M1),
    (@P1, @M2),
    (@P1, @M6),
    (@P2, @M3),
    (@P2, @M4),
    (@P2, @M5);

-- Insert MediaShare (U1 share Playlist cho U2)
INSERT INTO MediaShare
    (SenderId, ReceiverId, PlaylistId, Message)
VALUES
    (@U1, @U2, @P1, N'Nhạc này nghe lúc rảnh hay lắm nè!');

-- Insert Notification (Thông báo cho U2)
INSERT INTO Notification
    (UserId, Type, PayloadJson)
VALUES
    (@U2, 0, N'{"SenderId": "U1", "Message": "Lê Phạm Hoàng Phúc đã chia sẻ một playlist cho bạn."}');
GO
