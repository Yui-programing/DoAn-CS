export const formatDuration = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatTime = formatDuration;

export const formatViewCount = (count?: number) => {
  if (!count) return '0 lượt nghe';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M lượt nghe`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K lượt nghe`;
  return `${count} lượt nghe`;
};

export interface ParsedArtist {
  name: string;
  id?: string;
  isLinkable: boolean;
}

const artistIdMap: Record<string, string> = {
  "justatee": "77777777-7777-7777-7777-777777777777",
  "phương ly": "77777777-7777-7777-7777-777777777777",
  "sơn tùng m-tp": "44444444-4444-4444-4444-444444444444",
  "mã dã": "88888888-8888-8888-8888-888888888889",
  "ngọt band": "55555555-5555-5555-5555-555555555555",
  "riot games music": "66666666-6666-6666-6666-666666666666",
  "justatee x phương ly": "77777777-7777-7777-7777-777777777777"
};

export const parseArtists = (artistName?: string, defaultArtistId?: string): ParsedArtist[] => {
  if (!artistName) return [];
  
  // Tách tên các nghệ sĩ bằng các dấu phân tách " x ", " & ", ", "
  const splitRegex = /\s+(?:x|&)\s+|,\s*/i;
  const names = artistName.split(splitRegex).map(n => n.trim()).filter(Boolean);
  
  return names.map((name, index) => {
    const lowerName = name.toLowerCase();
    let artistId = artistIdMap[lowerName];
    if (!artistId && index === 0 && defaultArtistId) {
      artistId = defaultArtistId;
    }
    
    return {
      name,
      id: artistId,
      isLinkable: !!artistId
    };
  });
};

