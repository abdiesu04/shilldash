export const formatNumber = (num: number) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

export const formatPrice = (num: number) => {
  if (num < 0.01) {
    return num.toFixed(6);
  }
  if (num < 1) {
    return num.toFixed(4);
  }
  if (num < 10) {
    return num.toFixed(3);
  }
  return num.toFixed(2);
};

export const formatPercentage = (num: number) => {
  return num.toFixed(2);
}; 