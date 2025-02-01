export function formatNumber(value: number): string {
  if (value === undefined || value === null) return '0';
  
  if (value === 0) return '0';

  if (Math.abs(value) < 0.000001) {
    return value.toExponential(2);
  }

  if (Math.abs(value) < 1) {
    return value.toFixed(6);
  }

  if (Math.abs(value) < 1000) {
    return value.toFixed(2);
  }

  if (Math.abs(value) < 1000000) {
    return (value / 1000).toFixed(2) + 'K';
  }

  if (Math.abs(value) < 1000000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }

  return (value / 1000000000).toFixed(2) + 'B';
}

export function formatPercentage(value: number): string {
  if (value === undefined || value === null) return '0';
  
  return value.toFixed(2);
}

export function formatSupply(supply: string, decimals: number): string {
  const value = parseFloat(supply) / Math.pow(10, decimals);
  return formatNumber(value);
}

export function formatPrice(price: number): string {
  if (price === undefined || price === null) return '$0';
  
  if (price === 0) return '$0';

  if (price < 0.000001) {
    return '$' + price.toExponential(2);
  }

  if (price < 1) {
    return '$' + price.toFixed(6);
  }

  return '$' + price.toFixed(2);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatCompactNumber(value: number): string {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' });
  return formatter.format(value);
} 