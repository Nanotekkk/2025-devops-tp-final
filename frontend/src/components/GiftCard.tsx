import type { Gift } from '../types';

interface GiftCardProps {
  gift: Gift;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export function GiftCard({ gift, onDelete, onSelect }: GiftCardProps) {
  return (
    <div
      className={`christmas-card p-6 ${
        gift.is_selected ? 'ring-4 ring-christmas-gold' : ''
      } transition-all`}
    >
      {gift.is_selected && <div className="absolute top-2 right-2 text-4xl">⭐</div>}
      <h3 className="text-xl font-christmas font-bold mb-2 text-christmas-gold">{gift.title}</h3>
      <p className="text-white/90 mb-4">{gift.description}</p>
      <div className="flex gap-2">
        {!gift.is_selected && (
          <button onClick={() => onSelect(gift.id)} className="christmas-button flex-1">
            ⭐ Select as Final Gift
          </button>
        )}
        <button
          onClick={() => onDelete(gift.id)}
          className="bg-christmas-red/60 hover:bg-christmas-red text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
          aria-label={`Delete ${gift.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
