---------------------------------------------------------
-- 1. DROP TABLES (Xóa bảng theo thứ tự từ con đến cha)
---------------------------------------------------------
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
IF OBJECT_ID('Album', 'U') IS NOT NULL DROP TABLE Album;
IF OBJECT_ID('Artist', 'U') IS NOT NULL DROP TABLE Artist;
IF OBJECT_ID('UserProfile', 'U') IS NOT NULL DROP TABLE UserProfile;
IF OBJECT_ID('User', 'U') IS NOT NULL DROP TABLE [User];

---------------------------------------------------------
-- 2. CREATE TABLES
---------------------------------------------------------
-- Bảng chứa thông tin Đăng nhập & Phân quyền
CREATE TABLE [User] (
    Id NVARCHAR(450) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'User', -- Các quyền: 'User', 'Admin', 'Artist'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE UserProfile (
    Id NVARCHAR(450) PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    AvatarUrl NVARCHAR(1000) NULL,
    Bio NVARCHAR(MAX) NULL,
    FOREIGN KEY (Id) REFERENCES [User](Id) ON DELETE CASCADE
);

CREATE TABLE Artist (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Name] NVARCHAR(255) NOT NULL,
    Bio NVARCHAR(MAX) NULL,
    AvatarUrl NVARCHAR(1000) NULL
);

CREATE TABLE Album (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    CoverImageUrl NVARCHAR(1000) NULL,
    ReleaseDate DATETIME2 NOT NULL,
    ArtistId UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (ArtistId) REFERENCES Artist(Id) ON DELETE SET NULL
);

CREATE TABLE Tag (
    Id NVARCHAR(50) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL UNIQUE,
    [description] NVARCHAR(255) NULL
);

-- Bảng MediaItem (MediaType: 0 = Audio, 1 = Video)
CREATE TABLE MediaItem (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    FilePath NVARCHAR(1000) NOT NULL,
    DurationInSeconds INT NOT NULL DEFAULT 0,
    MediaType INT NOT NULL DEFAULT 0, 
    OwnerId NVARCHAR(450) NOT NULL,
    AlbumId UNIQUEIDENTIFIER NULL,
    ArtistId UNIQUEIDENTIFIER NULL,
    IsPrivate BIT NOT NULL DEFAULT 0,
    ViewCount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (OwnerId) REFERENCES UserProfile(Id) ON DELETE CASCADE,
    FOREIGN KEY (AlbumId) REFERENCES Album(Id) ON DELETE SET NULL,
    FOREIGN KEY (ArtistId) REFERENCES Artist(Id) ON DELETE SET NULL
);

CREATE TABLE Playlist (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    IsPublic BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    OwnerId NVARCHAR(450) NOT NULL,
    TracksCount INT NOT NULL DEFAULT 0,
    TotalDuration INT NOT NULL DEFAULT 0,
    FOREIGN KEY (OwnerId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);

CREATE TABLE PlaylistTrack (
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (PlaylistId, MediaItemId),
    FOREIGN KEY (PlaylistId) REFERENCES Playlist(Id) ON DELETE CASCADE, 
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE NO ACTION 
);

CREATE TABLE MediaTag (
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    TagId NVARCHAR(50) NOT NULL,
    TaggedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (MediaItemId, TagId),
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES Tag(Id) ON DELETE CASCADE
);

CREATE TABLE Favorite (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE PlayHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE CASCADE
);

CREATE TABLE Follow (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FollowerId NVARCHAR(450) NOT NULL,
    FollowingUserId NVARCHAR(450) NULL,
    FollowingArtistId UNIQUEIDENTIFIER NULL,
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (FollowerId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (FollowingUserId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (FollowingArtistId) REFERENCES Artist(Id) ON DELETE CASCADE
);

CREATE TABLE MediaShare (
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
CREATE TABLE Notification (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId NVARCHAR(450) NOT NULL,
    [Type] INT NOT NULL,
    PayloadJson NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES UserProfile(Id) ON DELETE CASCADE
);

---------------------------------------------------------
-- 3. INSERT SEED DATA (Dữ liệu mẫu)
---------------------------------------------------------
--  Insert tài khoản Đăng nhập vào bảng [User] (Mật khẩu giả định đã hash)
INSERT INTO [User] (Id, Email, PasswordHash, [Role]) VALUES 
('U1', 'hoangphuc@gmail.com', '$2a$11$abcdefghijklmnopqrstuv...', 'User'),
('U2', 'khachhang2@gmail.com', '$2a$11$abcdefghijklmnopqrstuv...', 'User');

-- Insert UserProfile
INSERT INTO UserProfile (Id, FullName, AvatarUrl, Bio) VALUES 
('U1', N'Lê Phạm Hoàng Phúc', 'https://avatar.com/phuc.jpg', N'Sinh viên ĐH Sài Gòn. Thường đi uống cafe thư giãn lúc rảnh.'),
('U2', N'Khách hàng 2', 'https://avatar.com/kh2.jpg', N'Đang sống và làm việc tại TP.HCM.');

-- Khai báo biến để tái sử dụng Id
DECLARE @Artist1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Artist2Id UNIQUEIDENTIFIER = NEWID();

-- Insert Artist
INSERT INTO Artist (Id, Name, Bio) VALUES 
(@Artist1Id, N'Ngọt Band', N'Ban nhạc Indie Việt Nam'),
(@Artist2Id, N'Riot Games Music', N'Nhà sản xuất âm nhạc trò chơi');

DECLARE @Album1Id UNIQUEIDENTIFIER = NEWID();

-- Insert Album
INSERT INTO Album (Id, Title, ReleaseDate, ArtistId) VALUES 
(@Album1Id, N'Tuyển tập Indie', '2025-01-01', @Artist1Id);

-- Insert Tags
INSERT INTO Tag (Id, Name) VALUES 
('T1', N'Indie'), ('T2', N'Pop'), ('T3', N'Gaming'), ('T4', N'Chill');

-- Khai báo 10 Media Items ID
DECLARE @M1 UNIQUEIDENTIFIER = NEWID(), @M2 UNIQUEIDENTIFIER = NEWID(),
        @M3 UNIQUEIDENTIFIER = NEWID(), @M4 UNIQUEIDENTIFIER = NEWID(),
        @M5 UNIQUEIDENTIFIER = NEWID(), @M6 UNIQUEIDENTIFIER = NEWID(),
        @M7 UNIQUEIDENTIFIER = NEWID(), @M8 UNIQUEIDENTIFIER = NEWID(),
        @M9 UNIQUEIDENTIFIER = NEWID(), @M10 UNIQUEIDENTIFIER = NEWID();

-- Insert MediaItem (8 Audio, 2 Video)
INSERT INTO MediaItem (Id, Title, FilePath, DurationInSeconds, MediaType, OwnerId, ArtistId, AlbumId) VALUES 
(@M1, N'Lần Cuối', '/media/lancuoi.mp3', 210, 0, 'U1', @Artist1Id, @Album1Id),
(@M2, N'Em Dạo Này', '/media/emdaonay.mp3', 195, 0, 'U1', @Artist1Id, @Album1Id),
(@M3, N'Die For You', '/media/dieforyou.mp3', 205, 0, 'U1', @Artist2Id, NULL),
(@M4, N'Ignite', '/media/ignite.mp3', 180, 0, 'U1', @Artist2Id, NULL),
(@M5, N'Ticking Away', '/media/tickingaway.mp3', 215, 0, 'U2', @Artist2Id, NULL),
(@M6, N'Lofi Cafe Sài Gòn', '/media/lofi1.mp3', 3600, 0, 'U1', NULL, NULL),
(@M7, N'Nhạc tập trung Code', '/media/focus.mp3', 1800, 0, 'U2', NULL, NULL),
(@M8, N'Guitar Acoustic Không Lời', '/media/guitar.mp3', 240, 0, 'U2', NULL, NULL),
-- Video
(@M9, N'Valorant Champions Tour Highlights', '/media/vct_highlight.mp4', 600, 1, 'U1', @Artist2Id, NULL),
(@M10, N'Hướng dẫn ReactJS cơ bản', '/media/react.mp4', 1200, 1, 'U2', NULL, NULL);

-- Map Tags to MediaItems
INSERT INTO MediaTag (MediaItemId, TagId) VALUES 
(@M1, 'T1'), (@M2, 'T1'), (@M3, 'T3'), (@M4, 'T3'), (@M5, 'T3'), 
(@M6, 'T4'), (@M7, 'T4'), (@M9, 'T3');

-- Khai báo Playlist
DECLARE @P1 UNIQUEIDENTIFIER = NEWID();
DECLARE @P2 UNIQUEIDENTIFIER = NEWID();

-- Insert Playlist
INSERT INTO Playlist (Id, Title, OwnerId, TracksCount, TotalDuration) VALUES 
(@P1, N'Giai điệu thư giãn cuối tuần', 'U1', 3, 4205),
(@P2, N'Playlist chiến Valorant', 'U1', 3, 600);

-- Insert PlaylistTrack
INSERT INTO PlaylistTrack (PlaylistId, MediaItemId) VALUES 
(@P1, @M1), (@P1, @M2), (@P1, @M6),
(@P2, @M3), (@P2, @M4), (@P2, @M5);

-- Insert MediaShare (U1 share Playlist cho U2)
INSERT INTO MediaShare (SenderId, ReceiverId, PlaylistId, Message) VALUES 
('U1', 'U2', @P1, N'Nhạc này nghe lúc rảnh hay lắm nè!');

-- Insert Notification (Thông báo cho U2)
INSERT INTO Notification (UserId, Type, PayloadJson) VALUES 
('U2', 0, N'{"SenderId": "U1", "Message": "Lê Phạm Hoàng Phúc đã chia sẻ một playlist cho bạn."}');