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
IF OBJECT_ID('MediaItem', 'U') IS NOT NULL DROP TABLE MediaItem;

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
    Id NVARCHAR(450) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'User',
    -- Các quyền: 'User', 'Admin', 'Artist'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE UserProfile
(
    Id NVARCHAR(450) PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    Bio NVARCHAR(MAX) NULL,
    FOREIGN KEY (Id) REFERENCES [User](Id) ON DELETE CASCADE
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
    OwnerId NVARCHAR(450) NOT NULL,
    AlbumName NVARCHAR(255) NULL,
    ArtistName NVARCHAR(255) NULL,
    IsPrivate BIT NOT NULL DEFAULT 0,
    ViewCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (OwnerId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);

CREATE TABLE Playlist
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [Type] INT NOT NULL DEFAULT 0,
    IsPublic BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    OwnerId NVARCHAR(450) NOT NULL,
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
    UserId NVARCHAR(450) NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE PlayHistory
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE Follow
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FollowerId NVARCHAR(450) NOT NULL,
    FollowingUserId NVARCHAR(450) NULL,
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (FollowerId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (FollowingUserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION
);

CREATE TABLE MediaShare
(
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SenderId NVARCHAR(450) NOT NULL,
    ReceiverId NVARCHAR(450) NOT NULL,
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
    UserId NVARCHAR(450) NOT NULL,
    [Type] INT NOT NULL,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);
GO

---------------------------------------------------------
-- 3. INSERT SEED DATA (Dữ liệu mẫu)
---------------------------------------------------------
--  Insert tài khoản Đăng nhập vào bảng [User] (Mật khẩu giả định đã hash)
INSERT INTO [User]
    (Id, Email, PasswordHash, [Role])
VALUES
    ('U1', 'hoangphuc@gmail.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'User'),
    ('U2', 'khachhang2@gmail.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'User');

-- Insert UserProfile
INSERT INTO UserProfile
    (Id, FullName, AvatarUrl, Bio)
VALUES
    ('U1', N'Lê Phạm Hoàng Phúc', 'https://avatar.com/phuc.jpg', N'Sinh viên ĐH Sài Gòn. Thường đi uống cafe thư giãn lúc rảnh.'),
    ('U2', N'Khách hàng 2', 'https://avatar.com/kh2.jpg', N'Đang sống và làm việc tại TP.HCM.');


-- Insert Tags
INSERT INTO Tag
    (Id, Name)
VALUES
    ('T1', N'Indie'),
    ('T2', N'Pop'),
    ('T3', N'Gaming'),
    ('T4', N'Chill');

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

-- Insert MediaItem (Chỉ lưu các bài hát/MV thực tế có file thật)
INSERT INTO MediaItem
    (Id, Title, FilePath, CoverUrl, DurationInSeconds, MediaType, OwnerId, ArtistName, AlbumName, ViewCount)
VALUES
    (@M1, N'Lần Cuối', '/media/Lan-Cuoi.mp3', '/images/lan-cuoi.png', 221, 0, 'U1', N'Ngọt Band', N'Tuyển tập Indie', 1200000),
    (@M2, N'Em Dạo Này', '/media/Em-Dao-Nay.mp3', '/images/emdaonay.png', 252, 0, 'U1', N'Ngọt Band', N'Tuyển tập Indie', 850000),
    (@M3, N'Ticking Away', '/media/Ticking Away.mp3', '/images/ticking-away.png', 204, 0, 'U1', N'Riot Games Music', NULL, 620000),
    (@M4, N'To Ashes and Blood', '/media/to-ashes-and-blood.mp3', '/images/to ashe and blood.png', 245, 0, 'U1', N'Riot Games Music', NULL, 430000),
    (@M5, N'Billy Mode', '/media/Billy-mode.mp3', '/images/billy-mode.png', 192, 0, 'U2', N'Riot Games Music', NULL, 280000),
    (@M6, N'Come Alive', '/media/Come-Alive.mp3', '/images/come-alive.png', 243, 0, 'U2', N'Riot Games Music', NULL, 280000),
    (@M7, N'Come My Way', '/media/CMW.mp3', '/images/cmw.png', 258, 0, 'U1', N'Sơn Tùng M-TP', NULL, 150000),
    (@M8, N'Biển,Đảo và Em', '/media/Bien-dao-va-em.mp3', '/images/biendaovaem.png', 296, 0, 'U1', NULL, NULL, 150000),
    (@M9, N'Thằng Điên', '/media/thangdien.mp4', '/images/Thang-dien.png', 286, 1, 'U1', N'Justatee x Phương Ly', NULL, 950000),
    (@M10, N'MV Đừng làm trái tim anh đau', '/media/dunglamtraitimanhdau.mp4', '/images/dunglamtraitimanhdau.png', 325, 1, 'U1', N'Sơn Tùng M-TP', NULL, 950000);
    

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
    (@P1, N'Giai điệu thư giãn cuối tuần', 'U1', 3, 663),
    (@P2, N'Playlist chiến Valorant', 'U1', 3, 600);

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
    ('U1', 'U2', @P1, N'Nhạc này nghe lúc rảnh hay lắm nè!');

-- Insert Notification (Thông báo cho U2)
INSERT INTO Notification
    (UserId, Type, PayloadJson)
VALUES
    ('U2', 0, N'{"SenderId": "U1", "Message": "Lê Phạm Hoàng Phúc đã chia sẻ một playlist cho bạn."}');
GO