export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'VNI': return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'O2': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    case 'CPAP': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  }
};

export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} TND`;
};

export const generateUniqueId = (baseId: string): string => {
  return `${baseId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};