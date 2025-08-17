import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewScaffold({
  title,
  chartSlot,
  tableSlot,
}: {
  title: string;
  chartSlot: React.ReactNode;
  tableSlot: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Overview (Graphs)</CardTitle>
        </CardHeader>
        <CardContent className="p-4">{chartSlot}</CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Records (Table)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">{tableSlot}</CardContent>
      </Card>
    </div>
  );
}
