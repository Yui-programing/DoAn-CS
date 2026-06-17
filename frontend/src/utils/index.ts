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
