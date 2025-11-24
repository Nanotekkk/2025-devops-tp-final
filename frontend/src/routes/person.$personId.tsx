import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleApi, giftsApi } from '../lib/api';
import { GiftCard } from '../components/GiftCard';
import { AddGiftForm } from '../components/AddGiftForm';
import type { CreateGiftInput } from '../types';

export const Route = createFileRoute('/person/$personId')({
  component: PersonPage,
});

function PersonPage() {
  const { personId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: person, isLoading: personLoading } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => peopleApi.getById(personId),
  });

  const { data: gifts = [], isLoading: giftsLoading } = useQuery({
    queryKey: ['gifts', personId],
    queryFn: () => giftsApi.getByPersonId(personId),
  });

  const createMutation = useMutation({
    mutationFn: giftsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', personId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: giftsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', personId] });
    },
  });

  const selectMutation = useMutation({
    mutationFn: ({ giftId }: { giftId: string }) => giftsApi.selectGift(personId, giftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', personId] });
    },
  });

  const handleAddGift = (data: CreateGiftInput) => {
    createMutation.mutate(data);
  };

  const handleDeleteGift = (id: string) => {
    if (confirm('Are you sure you want to delete this gift idea?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectGift = (giftId: string) => {
    selectMutation.mutate({ giftId });
  };

  if (personLoading || giftsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl font-christmas text-christmas-gold">Loading... 🎅</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="christmas-card p-12 text-center">
        <p className="text-2xl font-christmas text-christmas-gold mb-4">Person not found! 🤔</p>
        <Link to="/" className="christmas-button">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const selectedGift = gifts.find((g) => g.is_selected);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="christmas-button">
          ← Back
        </Link>
        <h1 className="text-4xl font-christmas font-bold text-christmas-gold">
          🎁 Gift Ideas for {person.name}
        </h1>
      </div>

      {selectedGift && (
        <div className="christmas-card p-6 bg-christmas-gold/20">
          <h2 className="text-2xl font-christmas font-bold mb-2 text-christmas-gold">
            ⭐ Final Gift Selected!
          </h2>
          <p className="text-xl">{selectedGift.title}</p>
        </div>
      )}

      <AddGiftForm personId={personId} onSubmit={handleAddGift} />

      {gifts.length === 0 ? (
        <div className="christmas-card p-12 text-center">
          <p className="text-2xl font-christmas text-christmas-gold">
            No gift ideas yet! Add some ideas above. 💡
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onDelete={handleDeleteGift}
              onSelect={handleSelectGift}
            />
          ))}
        </div>
      )}
    </div>
  );
}
