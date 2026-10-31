import React, { useState } from 'react';
import { ExpenseItem } from '../../types';
import {
  Calculator as CalcIcon,
  Coins,
  ArrowRightLeft,
  Plus,
  Trash2,
  DollarSign,
  Download,
  Search,
  Filter,
  CreditCard,
  Wallet,
  TrendingDown,
  PieChart,
} from 'lucide-react';
import { AdMobBanner } from '../ads/AdMobBanner';
import { playButtonTap, playCoinSound } from '../../utils/audio';

interface FinancialSuiteProps {
  expenses: ExpenseItem[];
  onExpensesChange: (expenses: ExpenseItem[]) => void;
}

const EXCHANGE_RATES: Record<string, { name: string; rateToUSD: number; symbol: string }> = {
  USD: { name: 'US Dollar', rateToUSD: 1.0, symbol: '$' },
  EUR: { name: 'Euro', rateToUSD: 1.08, symbol: '€' },
  GBP: { name: 'British Pound', rateToUSD: 1.28, symbol: '£' },
  JPY: { name: 'Japanese Yen', rateToUSD: 0.0065, symbol: '¥' },
  CAD: { name: 'Canadian Dollar', rateToUSD: 0.73, symbol: 'CA$' },
  AUD: { name: 'Australian Dollar', rateToUSD: 0.65, symbol: 'AU$' },
  CHF: { name: 'Swiss Franc', rateToUSD: 1.13, symbol: 'CHF' },
  SGD: { name: 'Singapore Dollar', rateToUSD: 0.76, symbol: 'SG$' },
  INR: { name: 'Indian Rupee', rateToUSD: 0.012, symbol: '₹' },
  PHP: { name: 'Philippine Peso', rateToUSD: 0.017, symbol: '₱' },
};

export const FinancialSuite: React.FC<FinancialSuiteProps> = ({
  expenses,
  onExpensesChange,
}) => {
  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<string | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [newNumberExpected, setNewNumberExpected] = useState(false);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // Currency Converter State
  const [convAmount, setConvAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');

  // Expense Tracker State
  const [dailyBudget, setDailyBudget] = useState(120);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ExpenseItem['category']>('Food & Dining');
  const [descInput, setDescInput] = useState('');
  const [paymentInput, setPaymentInput] = useState<ExpenseItem['paymentMethod']>('Card');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Calculator Logic
  const handleDigit = (digit: string) => {
    playButtonTap();
    if (newNumberExpected || calcDisplay === '0') {
      setCalcDisplay(digit);
      setNewNumberExpected(false);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleDecimal = () => {
    playButtonTap();
    if (newNumberExpected) {
      setCalcDisplay('0.');
      setNewNumberExpected(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const handleClear = () => {
    playButtonTap();
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
    setNewNumberExpected(false);
  };

  const handleBackspace = () => {
    playButtonTap();
    if (calcDisplay.length > 1) {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay('0');
    }
  };

  const handleSign = () => {
    playButtonTap();
    setCalcDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  const handlePercent = () => {
    playButtonTap();
    const val = parseFloat(calcDisplay);
    if (!isNaN(val)) {
      setCalcDisplay((val / 100).toString());
    }
  };

  const handleOperator = (op: string) => {
    playButtonTap();
    setCalcOp(op);
    setCalcPrev(calcDisplay);
    setNewNumberExpected(true);
  };

  const handleEquals = () => {
    playButtonTap();
    if (!calcOp || calcPrev === null) return;
    const a = parseFloat(calcPrev);
    const b = parseFloat(calcDisplay);
    let res = 0;

    switch (calcOp) {
      case '+':
        res = a + b;
        break;
      case '−':
      case '-':
        res = a - b;
        break;
      case '×':
      case '*':
        res = a * b;
        break;
      case '÷':
      case '/':
        res = b !== 0 ? a / b : 0;
        break;
    }

    const resStr = Math.round(res * 10000) / 10000;
    const record = `${calcPrev} ${calcOp} ${calcDisplay} = ${resStr}`;
    setCalcHistory((h) => [record, ...h.slice(0, 4)]);
    setCalcDisplay(resStr.toString());
    setCalcPrev(null);
    setCalcOp(null);
    setNewNumberExpected(true);
  };

  const handleTransferToExpense = () => {
    playButtonTap();
    const parsed = parseFloat(calcDisplay);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountInput(parsed.toFixed(2));
      setIsAddingExpense(true);
    }
  };

  // Currency Converter calculation
  const convertCurrency = () => {
    const fromRate = EXCHANGE_RATES[fromCurr]?.rateToUSD || 1;
    const toRate = EXCHANGE_RATES[toCurr]?.rateToUSD || 1;
    // Amount in USD = amount * fromRate
    // In target curr = (amount * fromRate) / toRate
    const amountInUSD = convAmount * fromRate;
    const converted = amountInUSD / toRate;
    return converted.toFixed(2);
  };

  const handleSwapCurrencies = () => {
    playButtonTap();
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  // Expense Handlers
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const totalSpentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetRemaining = Math.max(0, dailyBudget - totalSpentToday);
  const budgetPercent = Math.min(100, Math.round((totalSpentToday / dailyBudget) * 100));

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0 || !descInput.trim()) return;

    playCoinSound();
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      amount: Math.round(amt * 100) / 100,
      category: categoryInput,
      description: descInput.trim(),
      date: todayStr,
      time: new Date().toTimeString().slice(0, 5),
      paymentMethod: paymentInput,
    };

    onExpensesChange([newExp, ...expenses]);
    setAmountInput('');
    setDescInput('');
    setIsAddingExpense(false);
  };

  const handleDeleteExpense = (id: string) => {
    playButtonTap();
    onExpensesChange(expenses.filter((e) => e.id !== id));
  };

  const exportCSV = () => {
    playButtonTap();
    const headers = 'ID,Date,Time,Category,Description,Amount,PaymentMethod\n';
    const rows = expenses
      .map(
        (e) =>
          `"${e.id}","${e.date}","${e.time}","${e.category}","${e.description.replace(/"/g, '""')}",${e.amount},"${e.paymentMethod}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WhiskerPaws_Expenses_${todayStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Coins className="w-4 h-4" />
            <span>Blueprint 2 · The Financial Utility Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Calculator & Daily Expense Tracker
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tactile computation engine, multi-currency live conversions, and private daily expense logging.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl border border-neutral-800 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Financial Utility Split: Calculator + Converter (Left) vs Expense Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator & Currency Converter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Calculator */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <CalcIcon className="w-4 h-4 text-emerald-400" />
                <span>Financial Utility Calculator</span>
              </div>
              <button
                onClick={handleTransferToExpense}
                title="Send current value to Expense Tracker"
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors"
              >
                + Use as Expense
              </button>
            </div>

            {/* Calculator Display */}
            <div className="my-4 p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-right">
              <div className="h-4 text-[11px] text-neutral-500 font-mono">
                {calcPrev ? `${calcPrev} ${calcOp || ''}` : ''}
              </div>
              <div className="text-3xl font-mono font-bold text-white tabular-nums truncate tracking-tight">
                {calcDisplay}
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              <button
                onClick={handleClear}
                className="p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
              >
                AC
              </button>
              <button
                onClick={handleSign}
                className="p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                ±
              </button>
              <button
                onClick={handlePercent}
                className="p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                %
              </button>
              <button
                onClick={() => handleOperator('÷')}
                className="p-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
              >
                ÷
              </button>

              {['7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-100 transition-colors font-mono"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => handleOperator('×')}
                className="p-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
              >
                ×
              </button>

              {['4', '5', '6'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-100 transition-colors font-mono"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => handleOperator('−')}
                className="p-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
              >
                −
              </button>

              {['1', '2', '3'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-100 transition-colors font-mono"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => handleOperator('+')}
                className="p-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
              >
                +
              </button>

              <button
                onClick={handleBackspace}
                className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 transition-colors"
              >
                ⌫
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-100 transition-colors font-mono"
              >
                0
              </button>
              <button
                onClick={handleDecimal}
                className="p-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-100 transition-colors font-mono"
              >
                .
              </button>
              <button
                onClick={handleEquals}
                className="p-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-colors shadow-sm"
              >
                =
              </button>
            </div>

            {/* Recent Calculation Tape */}
            {calcHistory.length > 0 && (
              <div className="mt-3 pt-2 border-t border-neutral-800/60 text-[11px] font-mono text-neutral-500 space-y-0.5">
                <span className="text-[10px] uppercase text-neutral-600 font-sans block">History Roll:</span>
                {calcHistory.map((item, idx) => (
                  <div key={idx} className="truncate">{item}</div>
                ))}
              </div>
            )}
          </div>

          {/* Currency Converter */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>Multi-Currency Converter</span>
              </div>
              <span className="text-[10px] text-neutral-500">Live Base Matrix</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={convAmount}
                  onChange={(e) => setConvAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-5 items-center gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-neutral-500 block mb-1">From</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                  >
                    {Object.keys(EXCHANGE_RATES).map((cur) => (
                      <option key={cur} value={cur}>
                        {cur} ({EXCHANGE_RATES[cur].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 flex justify-center pt-4">
                  <button
                    onClick={handleSwapCurrencies}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                    title="Swap Currencies"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-neutral-500 block mb-1">To</label>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                  >
                    {Object.keys(EXCHANGE_RATES).map((cur) => (
                      <option key={cur} value={cur}>
                        {cur} ({EXCHANGE_RATES[cur].symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Result Box */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
                <span className="text-[11px] text-neutral-400">Equivalent Value:</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                  {EXCHANGE_RATES[toCurr]?.symbol} {convertCurrency()} {toCurr}
                </div>
                <span className="text-[10px] text-neutral-600 block mt-1">
                  1 {fromCurr} ≈ {(EXCHANGE_RATES[fromCurr]?.rateToUSD / EXCHANGE_RATES[toCurr]?.rateToUSD).toFixed(4)} {toCurr}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Expense Tracker */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Today's Budget Status Bar */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Today's Daily Spending</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      ${totalSpentToday.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      / ${dailyBudget} budget
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 uppercase block">Remaining</span>
                    <span className={`text-sm font-bold font-mono tabular-nums ${budgetRemaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${budgetRemaining.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playButtonTap();
                      setIsAddingExpense(!isAddingExpense);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Expense</span>
                  </button>
                </div>
              </div>

              {/* Progress gauge bar */}
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mt-4 border border-neutral-800/80">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Add Expense Form */}
            {isAddingExpense && (
              <form onSubmit={handleAddExpenseSubmit} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log New Expense</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Category</label>
                    <select
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value as ExpenseItem['category'])}
                      className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Transport">Transport</option>
                      <option value="Tools & Tech">Tools & Tech</option>
                      <option value="Health & Fitness">Health & Fitness</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Lunch with team, subway ticket"
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Payment Method</label>
                    <select
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(e.target.value as ExpenseItem['paymentMethod'])}
                      className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                    >
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Digital Wallet">Digital Wallet</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-lg"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            )}

            {/* Expenses List & Filters */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport</option>
                    <option value="Tools & Tech">Tools & Tech</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Utilities">Utilities</option>
                  </select>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2 mt-4 max-h-[360px] overflow-y-auto pr-1">
                {filteredExpenses.length === 0 ? (
                  <div className="py-10 text-center text-neutral-500 text-xs">
                    No matching expenses found.
                  </div>
                ) : (
                  filteredExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-950/40 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {exp.description}
                          </span>
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            {exp.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          <span>{exp.date}</span>
                          <span>·</span>
                          <span>{exp.time}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            {exp.paymentMethod === 'Card' ? (
                              <CreditCard className="w-3 h-3 text-neutral-400" />
                            ) : (
                              <Wallet className="w-3 h-3 text-neutral-400" />
                            )}
                            {exp.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold font-mono text-white tabular-nums">
                          -${exp.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ad Strategy: Persistent, non-intrusive AdMob banner sitting safely at bottom of calculator/financial interface */}
          <AdMobBanner />
        </div>
      </div>
    </div>
  );
};
