type TabType = "expenses" | "settle" | "summary";

type TripTabsProps = {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
};

export default function TripTabs({ activeTab, onChange }: TripTabsProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: "expenses", label: "Expenses" },
    { key: "settle", label: "Settle Up" },
    { key: "summary", label: "Summary" },
  ];

  return (
    <div className="mb-3 flex border-b border-[#E8E6E1]">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex-1 cursor-pointer border-0 bg-transparent p-3 text-center text-sm ${
              active
                ? "border-b-2 border-[#ff6fa5] text-[#ff6fa5]"
                : "text-[#71767A]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export type { TabType };