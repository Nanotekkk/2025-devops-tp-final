import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleApi } from '../lib/api';
import { PersonCard } from '../components/PersonCard';
import { AddPersonForm } from '../components/AddPersonForm';
import type { CreatePersonInput } from '../types';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const queryClient = useQueryClient();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: peopleApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: peopleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: peopleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });

  const handleAddPerson = (data: CreatePersonInput) => {
    createMutation.mutate(data);
  };

  const handleDeletePerson = (id: string) => {
    if (confirm('Are you sure you want to delete this person and all their gift ideas?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-4xl font-christmas text-christmas-gold">Loading... 🎅</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AddPersonForm onSubmit={handleAddPerson} />

      {people.length === 0 ? (
        <div className="christmas-card p-12 text-center">
          <p className="text-2xl font-christmas text-christmas-gold">
            No people added yet! Add someone to start planning gifts. 🎁
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} onDelete={handleDeletePerson} />
          ))}
        </div>
      )}
    </div>
  );
}
