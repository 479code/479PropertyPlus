import { EmptyState } from '@479property/ui';
import { Construction } from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title="Coming soon"
        description="This screen hasn't been built yet."
      />
    </div>
  );
}
