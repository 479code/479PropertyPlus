import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@479property/ui';
import { ArchiveRestore, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useArchivePerson, usePerson } from '../../features/crm/use-people';

import { AgentProfilePanel } from './AgentProfilePanel';
import { ContactTimelinePanel } from './ContactTimelinePanel';
import { EmergencyContactsPanel } from './EmergencyContactsPanel';
import { OwnerProfilePanel } from './OwnerProfilePanel';
import { PersonDocumentsPanel } from './PersonDocumentsPanel';
import { TenantProfilePanel } from './TenantProfilePanel';

function Detail({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '—'}</p>
    </div>
  );
}

export function PersonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: person, isLoading } = usePerson(id);
  const archivePerson = useArchivePerson();
  const [confirmArchive, setConfirmArchive] = useState(false);

  if (isLoading || !person) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={person.fullName}
        description={person.personCode}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'People', to: '/people' },
          { label: person.fullName },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/people/${id}/edit`)}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            {person.deletedAt ? null : (
              <Button variant="outline" onClick={() => setConfirmArchive(true)}>
                <ArchiveRestore className="mr-1.5 h-4 w-4" />
                Archive
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant={person.isActive ? 'success' : 'secondary'}>
          {person.isActive ? 'Active' : 'Inactive'}
        </Badge>
        {person.roles.map((r) => (
          <Badge key={r.id} variant="secondary">
            {r.personType.name}
          </Badge>
        ))}
        {person.tagAssignments.map((t) => (
          <Badge
            key={t.id}
            variant="outline"
            style={t.tag.color ? { borderColor: t.tag.color, color: t.tag.color } : undefined}
          >
            {t.tag.name}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Gender" value={person.gender} />
                <Detail label="Date of birth" value={person.dateOfBirth?.slice(0, 10)} />
                <Detail label="Marital status" value={person.maritalStatus} />
                <Detail label="Nationality" value={person.nationality} />
                <Detail label="Occupation" value={person.occupation} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="Email" value={person.email} />
                <Detail label="Phone" value={person.phone} />
                <Detail label="Alternate phone" value={person.alternatePhone} />
                <Detail label="Address" value={person.address} />
                <Detail label="City" value={person.city} />
                <Detail label="State" value={person.state} />
                <Detail label="Country" value={person.country} />
                <Detail label="Postal code" value={person.postalCode} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 p-6 text-sm">
                <Detail label="ID type" value={person.identificationType} />
                <Detail label="ID number" value={person.identificationNumber} />
                <Detail label="ID expiry" value={person.identificationExpiry?.slice(0, 10)} />
                <Detail label="Tax ID" value={person.taxIdentificationNumber} />
              </CardContent>
            </Card>
            {person.notes ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{person.notes}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="tenant">
          <TenantProfilePanel personId={person.id} />
        </TabsContent>
        <TabsContent value="owner">
          <OwnerProfilePanel personId={person.id} />
        </TabsContent>
        <TabsContent value="agent">
          <AgentProfilePanel personId={person.id} />
        </TabsContent>
        <TabsContent value="emergency">
          <EmergencyContactsPanel personId={person.id} />
        </TabsContent>
        <TabsContent value="documents">
          <PersonDocumentsPanel personId={person.id} />
        </TabsContent>
        <TabsContent value="timeline">
          <ContactTimelinePanel personId={person.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title={`Archive "${person.fullName}"?`}
        description="Archived people are hidden from active lists but can be restored later."
        destructive
        loading={archivePerson.isPending}
        onConfirm={async () => {
          try {
            await archivePerson.mutateAsync(person.id);
            toast.success('Person archived');
            navigate('/people');
          } catch {
            toast.error('Could not archive person');
          }
        }}
      />
    </div>
  );
}
