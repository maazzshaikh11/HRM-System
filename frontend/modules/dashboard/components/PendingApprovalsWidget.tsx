import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePendingApprovals } from '../hooks/useDashboardStats';
import { Spinner } from '@/components/common/Spinner';

export const PendingApprovalsWidget = () => {
  const { data: approvals, isLoading, isError } = usePendingApprovals();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Leave Approvals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <div className="p-6 text-red-500">Failed to load approvals.</div>
        ) : !approvals || approvals.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">No pending approvals.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.employee_id}</TableCell>
                  <TableCell className="capitalize">{approval.type}</TableCell>
                  <TableCell>{approval.days}</TableCell>
                  <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                  <TableCell>
                    <button className="text-primary hover:underline text-sm font-medium mr-3">Approve</button>
                    <button className="text-red-600 hover:underline text-sm font-medium">Reject</button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
