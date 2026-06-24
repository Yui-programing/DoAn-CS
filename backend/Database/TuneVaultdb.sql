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
    AlbumId UNIQUEIDENTIFIER NULL,
    [Message] NVARCHAR(MAX) NULL,
    SharedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsAccepted BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (SenderId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (ReceiverId) REFERENCES UserProfile(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItem(Id) ON DELETE NO ACTION,
    FOREIGN KEY (PlaylistId) REFERENCES Playlist(Id) ON DELETE NO ACTION,
    FOREIGN KEY (AlbumId) REFERENCES Album(Id) ON DELETE NO ACTION
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
        
        @U8 UNIQUEIDENTIFIER = '88888888-8888-8888-8888-888888888888',
        @U9 UNIQUEIDENTIFIER = '99999999-9999-9999-9999-999999999999',
        @U10 UNIQUEIDENTIFIER = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        @U11 UNIQUEIDENTIFIER = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        @U12 UNIQUEIDENTIFIER = 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        @U13 UNIQUEIDENTIFIER = 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        @U14 UNIQUEIDENTIFIER = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        @U15 UNIQUEIDENTIFIER = 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        @U16 UNIQUEIDENTIFIER = '8a8a8a8a-8a8a-8a8a-8a8a-8a8a8a8a8a8a',
        @U17 UNIQUEIDENTIFIER = '88888888-8888-8888-8888-888888888889';

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
    (@U8, 'freelanceartist@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U9, 'uxnlabel@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U10, 'brunomars@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U11, 'buckowens@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U12, 'dinhmanhninh@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U13, 'longcao@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U14, 'honeyworks@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U15, 'hoyomix@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U16, 'michaeljackson@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist'),
    (@U17, 'mada@tunevault.com', '$2a$11$vHzlViMHJXe6nT3OS6q.0O82CEKdUak5pUTArV3bgkOwe8CAGBNrq', 'Artist');

-- Insert UserProfile
INSERT INTO UserProfile
    (Id, FullName, AvatarUrl, Bio)
VALUES
    (@U1, N'Lê Phạm Hoàng Phúc', '/images/user1.jpg', N'Sinh viên ĐH Sài Gòn. Thường đi uống cafe thư giãn lúc rảnh.'),
    (@U2, N'Khách hàng 2', '/images/user2.jpg', N'Đang sống và làm việc tại TP.HCM.'),
    (@U3, N'TuneVault Administrator', '/images/user3.jpg', N'Quản trị viên hệ thống TuneVault.'),

    (@U4, N'Sơn Tùng M-TP', '/images/sontung.jpg', N'Nghệ sĩ nhạc Pop hàng đầu Việt Nam.'),
    (@U5, N'Ngọt Band', '/images/ngot.jpg', N'Ban nhạc Indie Việt Nam'),
    (@U6, N'Riot Games Music', '/images/riot.jpg', N'Nhà sản xuất âm nhạc trò chơi'),
    (@U7, N'Justatee x Phương Ly', '/images/justatee.jpg', N'Ca sĩ và nhà sản xuất R&B hàng đầu'),
    (@U8, N'Nghệ sĩ tự do', '/images/user8.jpg', N'Nghệ sĩ tự do'),
    (@U9, N'UXN Label', '/images/label.jpg', N'Edm number one'),
    (@U10, N'Bruno Mars', '/images/brunomars.jpg', N'I love Music'),
    (@U11, N'Buck Owens', '/images/buckowens.jpg', N'Country Music'),
    (@U12, N'Đinh Mạnh Ninh', '/images/dinhmanhninh.jpg', N'Có một bí mật giữa 2 ta'),
    (@U13, N'Long Cao', '/images/longcao.jpg', N'Ngày mai rồi cũng sẽ đến'),
    (@U14, N'Honey Works', '/images/honeyworks.jpg', N'HoneyWorks(通称: ハニワ)は、動画投稿サイトで活動するクリエイターユニット。'),
    (@U15, N'HOYO-MiX', '/images/hoyomix.jpg', N'MiHoYo''s in-house music producer team.'),
    (@U16, N'Michael Jackson', '/images/michaeljackson.jpg', N'The King of Pop.'),
    (@U17, N'Mã Dã', '/images/user8.jpg', N'Ca sĩ Mã Dã');

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
    (@U5, N'Ngọt Band', N'Ban nhạc Indie Việt Nam', '/images/ngot.jpg', N'Indie, Rock', '/images/banner/ngot-banner.jpg', GETUTCDATE()),
    (@U6, N'Riot Games Music', N'Nhà sản xuất âm nhạc trò chơi', '/images/riot.jpg', N'EDM, Rock, Pop', '/images/banner/riot-banner.jpg', GETUTCDATE()),
    (@U4, N'Sơn Tùng M-TP', N'Nghệ sĩ nhạc Pop hàng đầu Việt Nam', '/images/sontung.jpg', N'Pop, R&B', '/images/banner/sontung-banner.jpg', GETUTCDATE()),
    (@U7, N'Justatee x Phương Ly', N'Nghệ sĩ R&B', '/images/justatee.jpg', N'R&B, Pop', '/images/banner/jutee-banner.jpg', GETUTCDATE()),
    (@U8, N'Nghệ sĩ tự do', N'Nhà sản xuất tự do', '/images/user8.jpg', N'Pop, Ballad', NULL, GETUTCDATE()),
    
    (@U9, N'UXN Label', N'Edm number one', '/images/label.jpg', N'Pop, Ballad', '/images/banner/label-banner.jpg', GETUTCDATE()),
    (@U10, N'Bruno Mars', N'I love Music', '/images/brunomars.jpg', N'Pop, Ballad', '/images/banner/bruno-banner.jpg', GETUTCDATE()),
    (@U11, N'Buck Owens', N'Country Music', '/images/buckowens.jpg', N'Pop, Ballad', '/images/banner/buckowens-banner.jpg', GETUTCDATE()),
    (@U12, N'Đinh Mạnh Ninh', N'Có một bí mật giữa 2 ta', '/images/dinhmanhninh.jpg', N'Pop, Ballad', '/images/banner/dinhmanhninh-banner.jpg', GETUTCDATE()),
    (@U13, N'Long Cao', N'Ngày mai rồi cũng sẽ đến', '/images/longcao.jpg', N'Pop, Ballad', '/images/banner/longcao-banner.jpg', GETUTCDATE()),
    (@U14, N'Honey Works', N'HoneyWorks(通称: ハニワ)は、動画投稿サイトで活動するクリエイターユニット。', '/images/honeyworks.jpg', N'Pop, Ballad', '/images/banner/honeyworks-banner.jpg', GETUTCDATE()),
    (@U15, N'HOYO-MiX', N'MiHoYo''s in-house music producer team.', '/images/hoyomix.jpg', N'Gaming, EDM, Orchestral', '/images/banner/hoyomix-banner.jpg', GETUTCDATE()),
    (@U16, N'Michael Jackson', N'The King of Pop.', '/images/michael-jackson.jpg', N'Pop, Dance, Soul', '/images/banner/michael-banner.jpg', GETUTCDATE()),
    (@U17, N'Mã Dã', N'Ca sĩ Mã Dã', '/images/user8.jpg', N'Pop, Ballad', NULL, GETUTCDATE());

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
        @M10 UNIQUEIDENTIFIER = 'A7B3D5E1-2C9F-4B8A-8D6E-3F1C4A5B6D7C',

        @M11 UNIQUEIDENTIFIER = 'B2C4D6E8-F0A2-4C6E-9A8F-2E4D6C8B0F1A',
        @M12 UNIQUEIDENTIFIER = 'C3D5E7F9-A1B3-4D8F-8B6E-4C6D8B0F2A3B',
        @M13 UNIQUEIDENTIFIER = 'D4E6F8A0-B2C4-4E9F-7C5E-5D7F9B1A2C3D',
        @M14 UNIQUEIDENTIFIER = 'E5F7A9B1-C3D5-4FA0-6B4E-6D8F0A2C4D5E',
        @M15 UNIQUEIDENTIFIER = 'F6A8B0C2-D4E6-4FB1-5C3E-7D9F1A3C5D6E',
        @M16 UNIQUEIDENTIFIER = '123e4567-e89b-12d3-a456-426614174000',
        @M17 UNIQUEIDENTIFIER = '7c2d9b3e-74af-4c11-9a3f-2b8e5d6c78f1',
        @M18 UNIQUEIDENTIFIER = '7c2d9b3e-74af-4c11-9a3f-2b8e5d6c78f2',
        @M19 UNIQUEIDENTIFIER = '7c2d9b3e-74af-4c11-9a3f-2b8e5d6c78f3',
        @M20 UNIQUEIDENTIFIER = '7c2d9b3e-74af-4c11-9a3f-2b8e5d6c78f4';

-- Insert MediaItem (Chỉ lưu các bài hát/MV thực tế có file thật, mặc định đã được duyệt - 'Approved')
INSERT INTO MediaItem
    (Id, Title, FilePath, CoverUrl, DurationInSeconds, MediaType, AlbumId, ArtistId, IsPrivate, ApprovalStatus, ViewCount)
VALUES
    (@M1, N'Lần Cuối', '/media/Lan-Cuoi.mp3', '/images/lan-cuoi.png', 221, 0, @Album1Id, @U5, 0, 'Approved', 1200000),
    (@M2, N'Em Dạo Này', '/media/Em-Dao-Nay.mp3', '/images/emdaonay.png', 252, 0, @Album1Id, @U5, 0, 'Approved', 850000),
    (@M3, N'Ticking Away', '/media/Ticking Away.mp3', '/images/ticking-away.png', 204, 0, NULL, @U6, 0, 'Approved', 620000),
    (@M4, N'To Ashes and Blood', '/media/to-ashes-and-blood.mp3', '/images/to ashe and blood.png', 245, 0, NULL, @U6, 0, 'Approved', 430000),
    (@M5, N'Billy Mode', '/media/Billy-mode.mp3', '/images/billy-mode.png', 192, 0, NULL, @U15, 0, 'Approved', 280000),
    (@M6, N'Come Alive', '/media/Come-Alive.mp3', '/images/come-alive.png', 243, 0, NULL, @U15, 0, 'Approved', 280000),
    (@M7, N'Come My Way', '/media/CMW.mp3', '/images/cmw.png', 258, 0, NULL, @U4, 0, 'Approved', 150000),
    (@M8, N'Biển, Đảo và Em', '/media/Bien-dao-va-em.mp3', '/images/biendaovaem.png', 296, 0, NULL, @U17, 0, 'Approved', 150000),
    (@M9, N'Thằng Điên', '/media/thangdien.mp4', '/images/Thang-dien.png', 286, 1, NULL, @U7, 0, 'Approved', 950000),
    (@M10, N'MV Đừng làm trái tim anh đau', '/media/dunglamtraitimanhdau.mp4', '/images/dunglamtraitimanhdau.png', 325, 1, NULL, @U4, 0, 'Approved', 950000),
    (@M11, N'Rise', '/media/rise.mp3', '/images/rise.png', 180, 0, NULL, @U9, 0, 'Approved', 200000),
    (@M12, N'Risk It All', '/media/Risk-it-all.mp3', '/images/risk-at-all.png', 182, 0, NULL, @U10, 0, 'Approved', 500000),
    (@M13, N'Made In Japan', '/media/made-in-japan.mp3', '/images/madeinjapan.png', 160, 0, NULL, @U11, 0, 'Approved', 150000),
    (@M14, N'Dù Có Cách Xa', '/media/du-co-cach-xa.mp3', '/images/ducocachxa.png', 250, 0, NULL, @U12, 0, 'Approved', 450000),
    (@M15, N'Hẹn Ngày Mai Yêu', '/media/hen-ngay-mai-yeu.mp3', '/images/henngaymaiyeu.png', 225, 0, NULL, @U13, 0, 'Approved', 300000),
    (@M16, N'可愛くてごめん feat. ちゅーたん（CV：早見沙織）', '/media/kawaiikute-gomen.mp3', '/images/meo.jpg', 220, 0, NULL, @U14, 0, 'Approved', 800000),
    (@M17, N'I Will Survive', '/media/-will-survive.mp3', '/images/i-will-survive.png', 200, 0, NULL, @U8, 0, 'Approved', 150000),
    (@M18, N'Judas', '/media/judas.mp3', '/images/judas.png', 220, 0, NULL, @U8, 0, 'Approved', 150000),
    (@M19, N'Thiên Hoàng Địa Lão', '/media/thien-hoang-dia-lao.mp3', '/images/thien-hoang-dia-lao.png', 240, 0, NULL, @U8, 0, 'Approved', 150000),
    (@M20, N'Beat It', '/media/beat-it.mp3', '/images/beat-it.png', 294, 0, NULL, @U16, 0, 'Approved', 2000000);
    
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
    (SenderId, ReceiverId, PlaylistId, Message, IsAccepted)
VALUES
    (@U1, @U2, @P1, N'Nhạc này nghe lúc rảnh hay lắm nè!', 1);

-- Insert Notification (Thông báo cho U2)
INSERT INTO Notification
    (UserId, Type, PayloadJson)
VALUES
    (@U2, 0, N'{"SenderId": "U1", "Message": "Lê Phạm Hoàng Phúc đã chia sẻ một playlist cho bạn."}');
GO
