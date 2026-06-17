import { useState } from "react";
import { Sidebar } from "./components/common/Sidebar";
import { TopBar } from "./components/common/TopBar";
import { AddExpenseModal } from "./components/common/AddExpenseModal";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Transactions } from "./components/trackers/Transactions";
import { BudgetTracker } from "./components/trackers/BudgetTracker";
import { RecurringBills } from "./components/trackers/RecurringBills";
import { CreditCardTracker } from "./components/trackers/CreditCardTracker";
import { HomeExpenses } from "./components/trackers/HomeExpenses";
import { AnnualExpenses } from "./components/trackers/AnnualExpenses";
import type { TabId } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} />;
      case "transactions":
        return <Transactions />;
      case "budget":
        return <BudgetTracker />;
      case "bills":
        return <RecurringBills />;
      case "cards":
        return <CreditCardTracker />;
      case "home":
        return <HomeExpenses />;
      case "annual":
        return <AnnualExpenses />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          active={activeTab}
          onMenuClick={() => setSidebarOpen(true)}
          onAddExpense={() => setAddOpen(true)}
          onNavigate={setActiveTab}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div key={activeTab} className="mx-auto max-w-6xl animate-fade-in">
            {renderTab()}
          </div>
        </main>
      </div>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
