import TabletHeader from "@/components/layout/TabletHeader";

const Health = () => {
  const startedAt = new Date().toISOString();
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <TabletHeader title="Health" showBack={true} />
      <div className="flex-1 overflow-y-auto scrollable pt-14 p-4">
        <div className="p-4 rounded-xl border bg-card space-y-2">
          <h3 className="font-semibold">Server Health</h3>
          <p className="text-sm text-muted-foreground">Status: OK</p>
          <p className="text-xs text-muted-foreground">Started: {startedAt}</p>
        </div>
      </div>
    </div>
  );
};

export default Health;
