using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence
{
    public class TuneVaultDbContext : DbContext
    {
        public TuneVaultDbContext(DbContextOptions<TuneVaultDbContext> options) : base(options)
        {
        }

        // Khai báo các DbSet đại diện cho các bảng trong CSDL
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<Album> Albums { get; set; }
        public DbSet<MediaItem> MediaItems { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
        public DbSet<MediaShare> MediaShares { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<PlayHistory> PlayHistories { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Follow> Follows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Gọi cấu hình Fluent API (Sẽ viết chi tiết ở Bước 3)
            ConfigureFluentApi(modelBuilder);
            ConfigureSeedData(modelBuilder);
        }

        private void ConfigureFluentApi(ModelBuilder modelBuilder)
        {
            // 1. Cấu hình bảng UserProfile
            modelBuilder.Entity<UserProfile>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(150);
                entity.Property(u => u.AvatarUrl).HasMaxLength(500);
                entity.Property(u => u.Bio).HasMaxLength(1000);
            });

            // 2. Cấu hình bảng Artist
            modelBuilder.Entity<Artist>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Name).IsRequired().HasMaxLength(150);
            });

            // 3. Cấu hình bảng Album
            modelBuilder.Entity<Album>(entity =>
            {
                entity.HasKey(al => al.Id);
                entity.Property(al => al.Title).IsRequired().HasMaxLength(200);

                entity.HasOne(al => al.Artist)
                      .WithMany(a => a.Albums)
                      .HasForeignKey(al => al.ArtistId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 4. Cấu hình bảng MediaItem
            modelBuilder.Entity<MediaItem>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Title).IsRequired().HasMaxLength(250);
                entity.Property(m => m.FilePath).IsRequired().HasMaxLength(500);
                entity.Property(m => m.MediaType).HasConversion<string>().HasMaxLength(20); // Lưu Enum dưới dạng String

                entity.HasOne(m => m.Owner)
                      .WithMany(u => u.UploadedMedias)
                      .HasForeignKey(m => m.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Album)
                      .WithMany(al => al.MediaItems)
                      .HasForeignKey(m => m.AlbumId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(m => m.Artist)
                      .WithMany(a => a.MediaItems)
                      .HasForeignKey(m => m.ArtistId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // 5. Cấu hình bảng Playlist
            modelBuilder.Entity<Playlist>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Title).IsRequired().HasMaxLength(200);

                entity.HasOne(p => p.Owner)
                      .WithMany(u => u.Playlists)
                      .HasForeignKey(p => p.OwnerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 6. Cấu hình bảng trung gian PlaylistTrack (Khóa chính phức hợp nhiều-nhiều)
            modelBuilder.Entity<PlaylistTrack>(entity =>
            {
                entity.HasKey(pt => new { pt.PlaylistId, pt.MediaItemId });

                entity.HasOne(pt => pt.Playlist)
                      .WithMany(p => p.Tracks)
                      .HasForeignKey(pt => pt.PlaylistId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pt => pt.MediaItem)
                      .WithMany()
                      .HasForeignKey(pt => pt.MediaItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 7. Cấu hình bảng Follow (Tránh lỗi Multiple Cascade Paths)
            modelBuilder.Entity<Follow>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.HasOne(f => f.Follower)
                      .WithMany()
                      .HasForeignKey(f => f.FollowerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(f => f.FollowingUser)
                      .WithMany()
                      .HasForeignKey(f => f.FollowingUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(f => f.FollowingArtist)
                      .WithMany()
                      .HasForeignKey(f => f.FollowingArtistId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 8. Cấu hình bảng MediaShare (Bắt buộc cấu hình Restrict vì có 2 khóa ngoại cùng trỏ về UserProfile)
            modelBuilder.Entity<MediaShare>(entity =>
            {
                entity.HasKey(ms => ms.Id);
                entity.Property(ms => ms.Message).HasMaxLength(500);

                entity.HasOne(ms => ms.Sender)
                      .WithMany()
                      .HasForeignKey(ms => ms.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ms => ms.Receiver)
                      .WithMany()
                      .HasForeignKey(ms => ms.ReceiverId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(ms => ms.MediaItem)
                      .WithMany()
                      .HasForeignKey(ms => ms.MediaItemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ms => ms.Playlist)
                      .WithMany()
                      .HasForeignKey(ms => ms.PlaylistId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 9. Cấu hình bảng Favorite
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.HasOne(f => f.User)
                      .WithMany()
                      .HasForeignKey(f => f.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.MediaItem)
                      .WithMany()
                      .HasForeignKey(f => f.MediaItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 10. Cấu hình bảng PlayHistory
            modelBuilder.Entity<PlayHistory>(entity =>
            {
                entity.HasKey(ph => ph.Id);

                entity.HasOne(ph => ph.User)
                      .WithMany()
                      .HasForeignKey(ph => ph.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ph => ph.MediaItem)
                      .WithMany()
                      .HasForeignKey(ph => ph.MediaItemId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // 11. Cấu hình bảng Notification
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(n => n.Id);
                entity.Property(n => n.Type).HasConversion<string>().HasMaxLength(30);
                entity.Property(n => n.PayloadJson).IsRequired();

                entity.HasOne(n => n.User)
                      .WithMany()
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
        private void ConfigureSeedData(ModelBuilder modelBuilder)
        {
            // Lưu ý: Cần dùng ID tĩnh (hardcoded) để EF Core không tạo ID mới mỗi lần chạy Migration
            string userId1 = "user-phuc-1";
            string userId2 = "user-guest-2";

            // 1. Seed 2 User
            modelBuilder.Entity<UserProfile>().HasData(
                new UserProfile { Id = userId1, FullName = "Lê Phạm Hoàng Phúc", Bio = "Sinh viên CNTT Sài Gòn", AvatarUrl = "https://example.com/avatar1.jpg" },
                new UserProfile { Id = userId2, FullName = "Minh Tuấn", Bio = "Yêu âm nhạc", AvatarUrl = "https://example.com/avatar2.jpg" }
            );

            // Chuẩn bị ID tĩnh cho Media Items và Playlists
            Guid m1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
            Guid m2 = Guid.Parse("22222222-2222-2222-2222-222222222222");
            Guid m3 = Guid.Parse("33333333-3333-3333-3333-333333333333");
            Guid m4 = Guid.Parse("44444444-4444-4444-4444-444444444444");
            Guid m5 = Guid.Parse("55555555-5555-5555-5555-555555555555");
            Guid m6 = Guid.Parse("66666666-6666-6666-6666-666666666666");
            Guid m7 = Guid.Parse("77777777-7777-7777-7777-777777777777");
            Guid m8 = Guid.Parse("88888888-8888-8888-8888-888888888888");
            Guid m9 = Guid.Parse("99999999-9999-9999-9999-999999999999");
            Guid m10 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

            // 2. Seed 10 Media Items (Mix Audio & Video)
            modelBuilder.Entity<MediaItem>().HasData(
                new MediaItem { Id = m1, Title = "Lofi Chill Quán Cà Phê", FilePath = "/media/audio1.mp3", DurationInSeconds = 180, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId1 },
                new MediaItem { Id = m2, Title = "Acoustic Sài Gòn Mưa", FilePath = "/media/audio2.mp3", DurationInSeconds = 210, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId1 },
                new MediaItem { Id = m3, Title = "Valorant Jett Ace Highlight", FilePath = "/media/video1.mp4", DurationInSeconds = 45, MediaType = Domain.Enums.MediaType.Video, OwnerId = userId1 },
                new MediaItem { Id = m4, Title = "Valorant VCT Masters Montage", FilePath = "/media/video2.mp4", DurationInSeconds = 300, MediaType = Domain.Enums.MediaType.Video, OwnerId = userId1 },
                new MediaItem { Id = m5, Title = "EDM Cực Căng 2026", FilePath = "/media/audio3.mp3", DurationInSeconds = 195, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId2 },
                new MediaItem { Id = m6, Title = "Podcast: Code C# Dễ Hay Khó?", FilePath = "/media/audio4.mp3", DurationInSeconds = 1200, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId2 },
                new MediaItem { Id = m7, Title = "Pop Ballad Mới Nhất", FilePath = "/media/audio5.mp3", DurationInSeconds = 240, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId2 },
                new MediaItem { Id = m8, Title = "Rap Việt Nửa Đêm", FilePath = "/media/audio6.mp3", DurationInSeconds = 160, MediaType = Domain.Enums.MediaType.Audio, OwnerId = userId2 },
                new MediaItem { Id = m9, Title = "Hướng dẫn Clean Architecture", FilePath = "/media/video3.mp4", DurationInSeconds = 600, MediaType = Domain.Enums.MediaType.Video, OwnerId = userId1 },
                new MediaItem { Id = m10, Title = "Vlog Chợ Bến Thành", FilePath = "/media/video4.mp4", DurationInSeconds = 480, MediaType = Domain.Enums.MediaType.Video, OwnerId = userId2 }
            );

            // 3. Seed 2 Playlists
            Guid p1 = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
            Guid p2 = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

            modelBuilder.Entity<Playlist>().HasData(
                new Playlist { Id = p1, Title = "Nhạc Ngồi Cà Phê Cuối Tuần", Description = "List nhạc nhẹ nhàng để code hoặc thư giãn", IsPublic = true, OwnerId = userId1 },
                new Playlist { Id = p2, Title = "Clip Game & Lập Trình", Description = "Giải trí sau giờ học", IsPublic = true, OwnerId = userId2 }
            );

            // 4. Nối Track vào Playlist (PlaylistTrack)
            modelBuilder.Entity<PlaylistTrack>().HasData(
                new PlaylistTrack { PlaylistId = p1, MediaItemId = m1 },
                new PlaylistTrack { PlaylistId = p1, MediaItemId = m2 },
                new PlaylistTrack { PlaylistId = p2, MediaItemId = m3 },
                new PlaylistTrack { PlaylistId = p2, MediaItemId = m9 }
            );
        }
    }
}