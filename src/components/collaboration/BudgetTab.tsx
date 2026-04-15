import { useState } from "react";
import { DollarSign, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { EXPENSE_CATEGORIES, type EventItem, type Expense } from "@/lib/mock-data";

interface BudgetTabProps {
  event: EventItem;
}

const BudgetTab = ({ event }: BudgetTabProps) => {
  const { user, expenses, addExpense } = useApp();
  const eventExpenses = expenses[event.id] || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<Expense["category"]>("other");

  const totalBudget = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = event.participants.length > 0 ? totalBudget / event.participants.length : 0;

  // Calculate who owes whom
  const balances: Record<string, number> = {};
  event.participants.forEach((p) => { balances[p.id] = 0; });
  eventExpenses.forEach((exp) => {
    const splitAmount = exp.amount / exp.splitAmong.length;
    if (balances[exp.paidById] !== undefined) {
      balances[exp.paidById] += exp.amount;
    }
    exp.splitAmong.forEach((uid) => {
      if (balances[uid] !== undefined) {
        balances[uid] -= splitAmount;
      }
    });
  });

  const handleAdd = () => {
    if (!newTitle || !newAmount || !user) return;
    addExpense(event.id, {
      title: newTitle,
      amount: parseFloat(newAmount),
      paidBy: user.name,
      paidById: user.id,
      splitAmong: event.participants.map((p) => p.id),
      date: new Date().toLocaleDateString("en", { month: "short", day: "numeric" }),
      category: newCategory,
    });
    setNewTitle("");
    setNewAmount("");
    setNewCategory("other");
    setShowAddForm(false);
  };

  const getCategoryEmoji = (cat: string) => {
    return EXPENSE_CATEGORIES.find((c) => c.id === cat)?.emoji || "📦";
  };

  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      {/* Summary card */}
      <div className="gradient-primary rounded-2xl p-5 text-primary-foreground">
        <p className="text-sm opacity-80">Total Budget</p>
        <p className="text-3xl font-bold mt-1">${totalBudget.toFixed(2)}</p>
        <div className="flex justify-between mt-3 text-sm opacity-80">
          <span>{eventExpenses.length} expenses</span>
          <span>~${perPerson.toFixed(2)} / person</span>
        </div>
      </div>

      {/* Balances */}
      {Object.keys(balances).length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Balances</h3>
          <div className="space-y-2">
            {event.participants.map((p) => {
              const balance = balances[p.id] || 0;
              const isPositive = balance > 0;
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                    {p.name[0]}
                  </div>
                  <span className="flex-1 text-sm text-card-foreground">{p.name}</span>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-[hsl(var(--success))]" : balance < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {isPositive ? <TrendingUp size={14} /> : balance < 0 ? <TrendingDown size={14} /> : null}
                    {isPositive ? "+" : ""}${balance.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-foreground">Expenses</h3>
          <Button variant="soft" size="sm" className="rounded-full text-xs" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? <X size={14} /> : <Plus size={14} />}
            {showAddForm ? "Cancel" : "Add"}
          </Button>
        </div>

        {showAddForm && (
          <div className="p-4 rounded-xl bg-card shadow-card mb-4 space-y-3">
            <Input
              placeholder="What did you pay for?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="h-10 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="number"
              placeholder="Amount ($)"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="h-10 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewCategory(cat.id as Expense["category"])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    newCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Split equally among all {event.participants.length} participants</p>
            <Button variant="hero" className="w-full h-10 rounded-xl text-sm font-semibold" onClick={handleAdd}>
              Add Expense
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {eventExpenses.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {getCategoryEmoji(exp.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground">{exp.title}</p>
                <p className="text-xs text-muted-foreground">Paid by {exp.paidBy} • {exp.date}</p>
              </div>
              <p className="font-semibold text-card-foreground">${exp.amount.toFixed(2)}</p>
            </div>
          ))}
          {eventExpenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No expenses yet</p>
              <p className="text-xs">Add your first expense to start tracking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetTab;
