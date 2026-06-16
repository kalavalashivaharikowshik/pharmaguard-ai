import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-[#0F4C81] mb-8">
        PharmaGuard AI Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <h2 className="font-semibold mb-2">
            Active Batches
          </h2>

          <p className="text-4xl font-bold text-[#0F4C81]">
            124
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">
            Recall Status
          </h2>

          <Badge status="safe" />
        </Card>

        <Card>
          <h2 className="font-semibold mb-2">
            Compliance Score
          </h2>

          <p className="text-4xl font-bold text-green-600">
            98%
          </p>
        </Card>
      </div>
    </div>
  );
}