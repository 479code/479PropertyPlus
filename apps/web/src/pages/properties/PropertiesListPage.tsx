import { Card, CardContent, EmptyState, Skeleton } from '@479property/ui';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader';
import { usePropertiesList } from '../../features/property/use-properties';

export function PropertiesListPage() {
  const { data, isLoading } = usePropertiesList();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Select a property to view its inventory dashboard."
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Properties' }]}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties yet"
          description="Properties are created outside this screen."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((property) => (
            <Card
              key={property.id}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => navigate(`/properties/${property.id}/inventory`)}
            >
              <CardContent className="p-6">
                <p className="font-medium">{property.name}</p>
                <p className="text-sm text-muted-foreground">{property.propertyCode}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
