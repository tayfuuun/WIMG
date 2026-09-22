import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Layers,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { FixCategory, IncomeGroup, FixItem } from '../types';
import { fmt, monthly, generateId, parseNum, getCurrencySymbol } from '../utils/formatters';
import { FormattedAmountInput } from './FormattedAmountInput';
import { FinanzenCockpit } from './FinanzenCockpit';
import { TRANSLATIONS } from '../i18n/translations';

interface FinanzenTabProps {
  categories: FixCategory[];
  incomeGroups: IncomeGroup[];
  expenseGroups: IncomeGroup[];
  onUpdateCategories: (categories: FixCategory[]) => void;
  onUpdateIncomeGroups: (groups: IncomeGroup[]) => void;
  onUpdateExpenseGroups: (groups: IncomeGroup[]) => void;
}

interface PostenItemRowProps {
  item: FixItem;
  itemActive: boolean;
  itemMonthly: number;
  type: 'expense' | 'income';
  itemIndex?: number;
  onToggleActive: () => void;
  onUpdateName: (name: string) => void;
  onUpdateBetrag: (betrag: number) => void;
  onUpdateAbbuchung: (abbuchung: number) => void;
  onDelete: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const PostenItemRow: React.FC<PostenItemRowProps> = ({
  item,
  itemActive,
  itemMonthly,
  type,
  itemIndex,
  onToggleActive,
  onUpdateName,
  onUpdateBetrag,
  onUpdateAbbuchung,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const amountLabel =
    item.abbuchung === 1
      ? 'Betrag (Jahr)'
      : item.abbuchung === 12
      ? 'Betrag (Monat)'
      : item.abbuchung === 4
      ? 'Betrag (Quartal)'
      : item.abbuchung === 2
      ? 'Betrag (Halbjahr)'
      : 'Betrag';

  const isExpense = type === 'expense';
  const pillBg = isExpense
    ? 'bg-[#ccfbf1] text-[#0f766e] border-[#99f6e4]'
    : 'bg-[#dcfce7] text-[#15803d] border-[#86efac]';

  const nameInputFontClass = 'text-sm font-normal';

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`p-3 sm:p-3.5 rounded-2xl border transition-all shadow-2xs ${
        itemActive
          ? 'bg-white border-[#e2e8e5] hover:border-[#cbd5d1]'
          : 'bg-[#f8faf9] border-[#e2e8e5] opacity-60'
      }`}
    >
      {/* Desktop Layout (sm and up) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Left: Drag handle, Checkbox, Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onDragStart && (
            <span
              className="cursor-grab active:cursor-grabbing text-[#8ea69d] hover:text-[#2d4038] p-1 rounded-lg hover:bg-[#f0f4f2] transition-colors shrink-0"
              title="Posten verschieben"
            >
              <GripVertical className="w-4 h-4" />
            </span>
          )}

          <input
            type="checkbox"
            checked={itemActive}
            onChange={onToggleActive}
            className={`w-4 h-4 rounded cursor-pointer shrink-0 transition-colors ${
              isExpense
                ? 'text-[#0f766e] focus:ring-[#0f766e] border-[#cbd5d1]'
                : 'text-[#16a34a] focus:ring-[#16a34a] border-[#cbd5d1]'
            }`}
          />

          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className={`${nameInputFontClass} bg-transparent border border-transparent hover:border-[#cbd5d1] focus:border-[#0f766e] focus:bg-white focus:ring-0 rounded-xl px-2 py-1 transition-colors flex-1 min-w-[140px] ${
              itemActive ? 'text-[#14231f]' : 'text-[#8ea69d] line-through'
            }`}
            placeholder="Posten Name..."
          />
        </div>

        {/* Right: Betrag, Intervall, Monthly Badge, Delete */}
        <div className="ml-auto flex items-end gap-3 shrink-0">
          {/* Betrag Box */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#5f7069] uppercase tracking-wider mb-0.5">
              {amountLabel}
            </label>
            <FormattedAmountInput
              value={item.betrag}
              onChange={onUpdateBetrag}
              disabled={!itemActive}
              className="w-32 h-9 px-2.5 bg-[#f8faf9] hover:bg-white focus:bg-white border border-[#cbd5d1] focus:border-[#0f766e] rounded-xl text-xs font-normal text-[#14231f] text-right transition-colors"
              decimals={2}
              showCurrencySymbol={true}
            />
          </div>

          {/* Intervall Box */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#5f7069] uppercase tracking-wider mb-0.5">
              Intervall
            </label>
            <div className="relative">
              <select
                value={item.abbuchung}
                onChange={(e) => onUpdateAbbuchung(Number(e.target.value))}
                disabled={!itemActive}
                className="w-40 h-9 px-2.5 pr-7 bg-[#f8faf9] hover:bg-white focus:bg-white border border-[#cbd5d1] focus:border-[#0f766e] rounded-xl text-xs font-normal text-[#14231f] cursor-pointer appearance-none transition-colors"
              >
                <option value={12}>Monatlich (12x)</option>
                <option value={4}>Quartal (4x)</option>
                <option value={2}>Halbjährlich (2x)</option>
                <option value={1}>Jährlich (1x)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5f7069] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Monthly Result Pill */}
          <div className={`h-9 px-3 rounded-full text-xs font-black border flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap shrink-0 ${pillBg}`}>
            <span>=</span>
            <span className="font-bold">{fmt(itemMonthly)}</span>
            <span className="text-[10px] font-semibold opacity-80">/ Mo</span>
          </div>

          {/* Trash Button */}
          <button
            type="button"
            onClick={onDelete}
            className="h-9 w-9 flex items-center justify-center p-1.5 text-[#8ea69d] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Posten löschen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Layout (< sm) */}
      <div className="flex sm:hidden flex-col gap-2.5">
        {/* Top: Drag, Checkbox, Name, Trash */}
        <div className="flex items-center gap-2">
          {onDragStart && (
            <span className="cursor-grab active:cursor-grabbing text-[#8ea69d] p-0.5 shrink-0">
              <GripVertical className="w-4 h-4" />
            </span>
          )}

          <input
            type="checkbox"
            checked={itemActive}
            onChange={onToggleActive}
            className={`w-4 h-4 rounded cursor-pointer shrink-0 ${
              isExpense
                ? 'text-[#0f766e] focus:ring-[#0f766e] border-[#cbd5d1]'
                : 'text-[#16a34a] focus:ring-[#16a34a] border-[#cbd5d1]'
            }`}
          />

          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className={`${nameInputFontClass} bg-transparent border border-transparent hover:border-[#cbd5d1] focus:border-[#0f766e] focus:bg-white rounded-lg px-2 py-1 transition-colors flex-1 min-w-0 ${
              itemActive ? 'text-[#14231f]' : 'text-[#8ea69d] line-through'
            }`}
            placeholder="Posten Name..."
          />

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-[#8ea69d] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-auto"
            title="Posten löschen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Grid for Betrag & Intervall */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0f4f2]">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7069] uppercase tracking-wider">
              {amountLabel}
            </label>
            <FormattedAmountInput
              value={item.betrag}
              onChange={onUpdateBetrag}
              disabled={!itemActive}
              className="w-full px-2.5 py-1.5 bg-[#f8faf9] border border-[#cbd5d1] rounded-xl text-xs font-normal text-[#14231f] text-center"
              decimals={2}
              showCurrencySymbol={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#5f7069] uppercase tracking-wider">
              Intervall
            </label>
            <div className="relative">
              <select
                value={item.abbuchung}
                onChange={(e) => onUpdateAbbuchung(Number(e.target.value))}
                disabled={!itemActive}
                className="w-full px-2 py-1.5 pr-6 bg-[#f8faf9] border border-[#cbd5d1] rounded-xl text-xs font-normal text-[#14231f] appearance-none"
              >
                <option value={12}>Monatlich (12x)</option>
                <option value={4}>Quartal (4x)</option>
                <option value={2}>Halbjährlich (2x)</option>
                <option value={1}>Jährlich (1x)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#5f7069] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom: Monthly Pill */}
        <div className="flex items-center justify-end pt-1">
          <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 shadow-2xs ${pillBg}`}>
            <span>=</span>
            <span className="font-bold">{fmt(itemMonthly)}</span>
            <span className="text-[10px] font-semibold opacity-80">/ Mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FinanzenTab: React.FC<FinanzenTabProps> = ({
  categories,
  incomeGroups,
  expenseGroups: _expenseGroups,
  onUpdateCategories,
  onUpdateIncomeGroups,
  onUpdateExpenseGroups: _onUpdateExpenseGroups,
}) => {
  const t = TRANSLATIONS.de;
  const currencySymbol = '€';
  const [newCatName, setNewCatName] = useState('');
  const [newIncName, setNewIncName] = useState('');
  const [deleteConfirmCatId, setDeleteConfirmCatId] = useState<string | null>(null);
  const [deleteConfirmIncGroupId, setDeleteConfirmIncGroupId] = useState<string | null>(null);
  const [distributionMode, setDistributionMode] = useState<'expense' | 'income'>('expense');

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    sourceCatId: string;
    itemId: string;
  } | null>(null);
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);
  const [draggedIncGroupId, setDraggedIncGroupId] = useState<string | null>(null);
  const [dragOverIncGroupIndex, setDragOverIncGroupIndex] = useState<number | null>(null);

  // Computations
  const activeCategories = categories.filter((c) => c.active !== false);
  const totalFixExpenses = activeCategories.reduce(
    (sum, cat) =>
      sum +
      cat.items
        .filter((it) => it.active !== false)
        .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
    0
  );

  const activeIncomeGroups = incomeGroups.filter((g) => g.active !== false);
  const totalIncome = activeIncomeGroups.reduce(
    (sum, grp) =>
      sum +
      grp.items
        .filter((it) => it.active !== false)
        .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0),
    0
  );

  const netSavings = totalIncome - totalFixExpenses;
  const totalExpenseItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const activeExpenseItems = categories.reduce(
    (sum, c) =>
      sum + (c.active !== false ? c.items.filter((it) => it.active !== false).length : 0),
    0
  );

  const categoriesForChart = categories
    .map((c) => {
      const totalPossibleVal = c.items
        .filter((it) => it.active !== false)
        .reduce((acc, it) => acc + monthly(it.betrag, it.abbuchung), 0);
      const isActive = c.active !== false && totalPossibleVal > 0;

      return {
        id: c.id,
        name: c.name,
        color: c.color || '#0f766e',
        totalPossibleVal: Math.round(totalPossibleVal * 100) / 100,
        value: isActive ? Math.round(totalPossibleVal * 100) / 100 : 0,
        isActive: c.active !== false,
      };
    })
    .filter((c) => c.totalPossibleVal > 0);

  const pieData = categoriesForChart
    .filter((c) => c.isActive && c.value > 0)
    .sort((a, b) => b.value - a.value);

  const selectedChartTotal = pieData.reduce((acc, it) => acc + it.value, 0);

  const handleToggleCatInChart = (catId: string) => {
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, active: c.active === false } : c))
    );
  };

  const incomeGroupsForChart = incomeGroups
    .map((g) => {
      const totalPossibleVal = g.items
        .filter((it) => it.active !== false)
        .reduce((acc, it) => acc + monthly(it.betrag, it.abbuchung), 0);
      const isActive = g.active !== false && totalPossibleVal > 0;

      return {
        id: g.id,
        name: g.name,
        color: g.color || '#16a34a',
        totalPossibleVal: Math.round(totalPossibleVal * 100) / 100,
        value: isActive ? Math.round(totalPossibleVal * 100) / 100 : 0,
        isActive: g.active !== false,
      };
    })
    .filter((g) => g.totalPossibleVal > 0);

  const incomePieData = incomeGroupsForChart
    .filter((g) => g.isActive && g.value > 0)
    .sort((a, b) => b.value - a.value);

  const selectedIncomeChartTotal = incomePieData.reduce((acc, it) => acc + it.value, 0);

  const handleToggleIncomeGroupInChart = (groupId: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, active: g.active === false } : g))
    );
  };

  const isExpenseMode = distributionMode === 'expense';
  const currentChartItems = isExpenseMode ? categoriesForChart : incomeGroupsForChart;
  const currentPieData = isExpenseMode ? pieData : incomePieData;
  const currentSelectedTotal = isExpenseMode ? selectedChartTotal : selectedIncomeChartTotal;
  const currentTotalBase = isExpenseMode ? totalFixExpenses : totalIncome;
  const handleToggleCurrentInChart = isExpenseMode ? handleToggleCatInChart : handleToggleIncomeGroupInChart;

  const renderCustomizedPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    if (percent < 0.035) return null;

    const isInside = percent >= 0.07;
    const radius = isInside
      ? innerRadius + (outerRadius - innerRadius) * 0.5
      : outerRadius + 16;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const formatted = fmt(value);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={isInside ? 'middle' : x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isInside ? 12 : 10.5}
        fontWeight={700}
        style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)',
        }}
      >
        {formatted}
      </text>
    );
  };

  // Actions for Categories
  const handleToggleCatActive = (catId: string) => {
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, active: !c.active } : c))
    );
  };

  const handleToggleCatCollapse = (catId: string) => {
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, collapsed: !c.collapsed } : c))
    );
  };

  const handleUpdateCatName = (catId: string, name: string) => {
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, name } : c))
    );
  };

  const handleUpdateCatColor = (catId: string, color: string) => {
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, color } : c))
    );
  };

  const handleToggleItemActive = (catId: string, itemId: string) => {
    onUpdateCategories(
      categories.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          items: c.items.map((it) =>
            it.id === itemId ? { ...it, active: it.active === false } : it
          ),
        };
      })
    );
  };

  const handleAddCatItem = (catId: string) => {
    const newItem: FixItem = {
      id: generateId('item'),
      name: 'Neuer Posten',
      betrag: 0,
      abbuchung: 12,
      active: true,
    };
    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, items: [...c.items, newItem] } : c))
    );
  };

  const handleUpdateItem = (
    catId: string,
    itemId: string,
    field: keyof FixItem,
    value: string | number
  ) => {
    onUpdateCategories(
      categories.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          items: c.items.map((it) => {
            if (it.id !== itemId) return it;
            return {
              ...it,
              [field]: field === 'name' ? value : parseNum(value),
            };
          }),
        };
      })
    );
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    onUpdateCategories(
      categories.map((c) => {
        if (c.id !== catId) return c;
        return {
          ...c,
          items: c.items.filter((it) => it.id !== itemId),
        };
      })
    );
  };

  // Drag and drop handlers
  const handleDragStart = (catId: string, itemId: string) => {
    setDraggedItem({ sourceCatId: catId, itemId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetCatId: string, targetIndex?: number) => {
    if (!draggedItem) return;
    const { sourceCatId, itemId } = draggedItem;

    const sourceCat = categories.find((c) => c.id === sourceCatId);
    const itemToMove = sourceCat?.items.find((it) => it.id === itemId);
    if (!itemToMove) return;

    const newCategories = categories.map((cat) => {
      if (cat.id === sourceCatId && cat.id === targetCatId) {
        const items = [...cat.items];
        const currentIndex = items.findIndex((it) => it.id === itemId);
        items.splice(currentIndex, 1);
        const insertAt = targetIndex !== undefined ? targetIndex : items.length;
        items.splice(insertAt, 0, itemToMove);
        return { ...cat, items };
      }

      if (cat.id === sourceCatId) {
        return {
          ...cat,
          items: cat.items.filter((it) => it.id !== itemId),
        };
      }

      if (cat.id === targetCatId) {
        const items = [...cat.items];
        const insertAt = targetIndex !== undefined ? targetIndex : items.length;
        items.splice(insertAt, 0, itemToMove);
        return { ...cat, items };
      }

      return cat;
    });

    onUpdateCategories(newCategories);
    setDraggedItem(null);
  };

  // Category drag and drop handlers
  const handleCategoryDragStart = (catId: string) => {
    setDraggedCatId(catId);
  };

  const handleCategoryDrop = (targetIndex: number) => {
    if (!draggedCatId) return;
    const sourceIndex = categories.findIndex((c) => c.id === draggedCatId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggedCatId(null);
      setDragOverCatIndex(null);
      return;
    }

    const newCategories = [...categories];
    const [movedCat] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, movedCat);

    onUpdateCategories(newCategories);
    setDraggedCatId(null);
    setDragOverCatIndex(null);
  };

  // Income Group drag and drop handlers
  const handleIncGroupDragStart = (groupId: string) => {
    setDraggedIncGroupId(groupId);
  };

  const handleIncGroupDrop = (targetIndex: number) => {
    if (!draggedIncGroupId) return;
    const sourceIndex = incomeGroups.findIndex((g) => g.id === draggedIncGroupId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      setDraggedIncGroupId(null);
      setDragOverIncGroupIndex(null);
      return;
    }

    const newGroups = [...incomeGroups];
    const [movedGroup] = newGroups.splice(sourceIndex, 1);
    newGroups.splice(targetIndex, 0, movedGroup);

    onUpdateIncomeGroups(newGroups);
    setDraggedIncGroupId(null);
    setDragOverIncGroupIndex(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const defaultColors = ['#0f766e', '#16a34a', '#2563eb', '#d97706', '#9333ea', '#e11d48', '#0284c7'];
    const assignedColor = defaultColors[categories.length % defaultColors.length];

    const newCat: FixCategory = {
      id: generateId('cat'),
      name: newCatName.trim(),
      color: assignedColor,
      type: 'expense',
      items: [],
      active: true,
      collapsed: false,
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    onUpdateCategories(categories.filter((c) => c.id !== catId));
    setDeleteConfirmCatId(null);
  };

  // Actions for Income Groups
  const handleToggleIncGroupActive = (groupId: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, active: !g.active } : g))
    );
  };

  const handleToggleIncGroupCollapse = (groupId: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))
    );
  };

  const handleUpdateIncGroupName = (groupId: string, name: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, name } : g))
    );
  };

  const handleUpdateIncGroupColor = (groupId: string, color: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, color } : g))
    );
  };

  const handleToggleIncItemActive = (groupId: string, itemId: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) =>
            it.id === itemId ? { ...it, active: it.active === false } : it
          ),
        };
      })
    );
  };

  const handleAddIncItem = (groupId: string) => {
    const newItem: FixItem = {
      id: generateId('inc_item'),
      name: 'Neue Einnahme',
      betrag: 0,
      abbuchung: 12,
      active: true,
    };
    onUpdateIncomeGroups(
      incomeGroups.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g))
    );
  };

  const handleUpdateIncItem = (
    groupId: string,
    itemId: string,
    field: keyof FixItem,
    value: string | number
  ) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) => {
            if (it.id !== itemId) return it;
            return {
              ...it,
              [field]: field === 'name' ? value : parseNum(value),
            };
          }),
        };
      })
    );
  };

  const handleDeleteIncItem = (groupId: string, itemId: string) => {
    onUpdateIncomeGroups(
      incomeGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.filter((it) => it.id !== itemId),
        };
      })
    );
  };

  const handleAddIncomeGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncName.trim()) return;

    const defaultIncomeColors = ['#16a34a', '#059669', '#0284c7', '#2563eb', '#9333ea', '#d97706'];
    const assignedIncomeColor = defaultIncomeColors[incomeGroups.length % defaultIncomeColors.length];

    const newGroup: IncomeGroup = {
      id: generateId('inc_group'),
      name: newIncName.trim(),
      color: assignedIncomeColor,
      type: 'income',
      items: [],
      active: true,
      collapsed: false,
    };
    onUpdateIncomeGroups([...incomeGroups, newGroup]);
    setNewIncName('');
  };

  const handleDeleteIncomeGroup = (groupId: string) => {
    onUpdateIncomeGroups(incomeGroups.filter((g) => g.id !== groupId));
    setDeleteConfirmIncGroupId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 0. Sticky Dark-Green Finanz-Cockpit Header */}
      <FinanzenCockpit
        totalIncome={totalIncome}
        totalExpenses={totalFixExpenses}
        netSavings={netSavings}
        activeCount={activeExpenseItems}
        totalCount={totalExpenseItems}
      />

      {/* 1. Ausgaben- & Einnahmenverteilung mit Donut-Graph und Schalter */}
      <div id="ausgaben-verteilung-section" className="bg-white rounded-3xl p-5 sm:p-6 border border-[#d8e2de] shadow-xs flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-[#f0f4f2] gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Umschalter zwischen Ausgaben- und Einnahmenverteilung */}
            <div className="inline-flex p-1 bg-[#f0f4f2] rounded-xl border border-[#e2e8e5]">
              <button
                type="button"
                onClick={() => setDistributionMode('expense')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isExpenseMode
                    ? 'bg-white text-[#0f766e] shadow-xs'
                    : 'text-[#5f7069] hover:text-[#14231f]'
                }`}
              >
                <span>{t.fixTab.expenseDistributionTitle}</span>
              </button>
              <button
                type="button"
                onClick={() => setDistributionMode('income')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isExpenseMode
                    ? 'bg-white text-[#16a34a] shadow-xs'
                    : 'text-[#5f7069] hover:text-[#14231f]'
                }`}
              >
                <span>{t.fixTab.incomeDistributionTitle}</span>
              </button>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#f0f4f2] text-[#2d4038] whitespace-nowrap border border-[#e2e8e5] shrink-0">
              {t.fixTab.activeCount(currentPieData.length, currentChartItems.length)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#5f7069] block">
              {isExpenseMode ? t.fixTab.selectedTotalExpenses : t.fixTab.selectedTotalIncome}
            </span>
            <span
              className={`text-lg font-black tabular-nums ${
                isExpenseMode ? 'text-[#0f766e]' : 'text-[#16a34a]'
              }`}
            >
              {fmt(currentSelectedTotal)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-5 h-[270px] sm:h-[300px] w-full relative flex items-center justify-center">
            {currentPieData.length > 0 ? (
              <>
                {/* Center Summary Label placed behind chart & tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4 z-0">
                  <span className="text-[11px] font-bold text-[#5f7069] uppercase tracking-wider">
                    {isExpenseMode ? 'Fixkosten' : 'Einnahmen'}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-black tabular-nums ${
                      isExpenseMode ? 'text-[#0f766e]' : 'text-[#16a34a]'
                    }`}
                  >
                    {fmt(currentSelectedTotal)}
                  </span>
                  <span className="text-[10px] text-[#8ea69d]">
                    {currentPieData.length} {t.fixTab.activeBadge}
                  </span>
                </div>

                <div className="w-full h-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={2}
                        label={renderCustomizedPieLabel}
                        labelLine={false}
                      >
                        {currentPieData.map((entry) => (
                          <Cell key={`cell-${entry.id}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const item = payload[0];
                          const data = (item.payload || {}) as { name?: string; color?: string; value?: number };
                          const categoryName = data.name || (typeof item.name === 'string' ? item.name : '') || 'Kategorie';
                          const color = data.color || (isExpenseMode ? '#0f766e' : '#16a34a');
                          const val = Number(item.value ?? data.value ?? 0);
                          const pct = currentSelectedTotal > 0 ? ((val / currentSelectedTotal) * 100).toFixed(1) : '0.0';

                          return (
                            <div className="bg-[#14231f] text-white border border-[#203932] rounded-2xl px-3.5 py-2.5 shadow-xl min-w-[170px] pointer-events-none z-50">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                                  {categoryName}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 pt-1.5 border-t border-[#233d34]">
                                <span className="text-sm font-extrabold text-[#86efac] tabular-nums">
                                  {fmt(val)}
                                </span>
                                <span className="text-xs font-semibold text-[#9eb8af] tabular-nums">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-[#5f7069]">
                <Layers className="w-10 h-10 mb-2 opacity-30 text-[#0f766e]" />
                <p className="text-sm font-semibold">{t.fixTab.noActiveCategories}</p>
                <p className="text-xs text-[#8ea69d] mt-1">{t.fixTab.activateCategoriesHint}</p>
              </div>
            )}
          </div>

          {/* Interactive Categories Checklist */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5f7069]">
                {t.fixTab.categoryDistributionShare}
              </span>
              <span className="text-[11px] text-[#8ea69d] italic">
                {t.fixTab.categoryClickToToggle}
              </span>
            </div>

            <div className="space-y-1.5">
              {currentChartItems.map((cat) => {
                const isSelected = cat.isActive && cat.value > 0;
                const percentage =
                  currentSelectedTotal > 0 && isSelected
                    ? (cat.value / currentSelectedTotal) * 100
                    : 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCurrentInChart(cat.id)}
                    className={`flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#f4f7f5]/80 hover:bg-[#ebf1ee]'
                        : 'opacity-40 hover:opacity-75 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#0f766e] border-[#0f766e] text-white'
                            : 'border-[#cbd5d1] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-bold text-[#14231f] truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isSelected ? (
                        <div className="w-16 bg-[#e2e8e5] h-2 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      ) : null}

                      <span className="text-xs font-bold text-[#5f7069] tabular-nums w-12 text-right">
                        {isSelected ? `${percentage.toFixed(1)}%` : '0.0%'}
                      </span>

                      <div className="text-right w-24">
                        <span
                          className={`text-xs font-bold tabular-nums block ${
                            isSelected ? 'text-[#14231f]' : 'text-[#8ea69d] line-through'
                          }`}
                        >
                          {fmt(cat.isActive ? cat.value : cat.totalPossibleVal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Fixe Ausgaben Kategorien */}
      <div id="fixe-ausgaben-section" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>FIXE AUSGABEN</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200/80">
              {categories.length} KATEGORIEN
            </span>
          </h3>
          <span
            className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/60 cursor-help"
            title="Kategorien & Posten per Drag & Drop sortieren"
            aria-label="Kategorien & Posten per Drag & Drop sortieren"
          >
            <GripVertical className="w-3.5 h-3.5 text-[#0f766e] shrink-0" />
            <span className="hidden sm:inline">Kategorien &amp; Posten per Drag &amp; Drop sortieren</span>
          </span>
        </div>

        {/* Categories List */}
        {categories.map((cat, idx) => {
          const catMonthlyTotal = cat.items
            .filter((it) => it.active !== false)
            .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0);
          const isActive = cat.active !== false;
          const isCatDragged = draggedCatId === cat.id;
          const isCatDragOver = dragOverCatIndex === idx && draggedCatId !== null && draggedCatId !== cat.id;

          return (
            <div
              key={cat.id}
              data-category-card={cat.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedCatId) {
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCatIndex !== idx) {
                    setDragOverCatIndex(idx);
                  }
                } else if (draggedItem) {
                  handleDragOver(e);
                }
              }}
              onDragLeave={(e) => {
                if (draggedCatId && dragOverCatIndex === idx) {
                  const related = e.relatedTarget as HTMLElement | null;
                  if (!related || !related.closest(`[data-category-card="${cat.id}"]`)) {
                    setDragOverCatIndex(null);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedCatId) {
                  handleCategoryDrop(idx);
                } else if (draggedItem) {
                  handleDrop(cat.id);
                }
              }}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isCatDragged
                  ? 'opacity-40 border-dashed border-[#0f766e] scale-[0.99]'
                  : isCatDragOver
                  ? 'border-[#0f766e] ring-2 ring-[#0f766e]/30 shadow-md'
                  : isActive
                  ? 'border-[#d8e2de]'
                  : 'border-[#e5ebe8] opacity-60 bg-[#f9fbf9]'
              }`}
            >
              {/* Category Header */}
              <div className="p-3.5 sm:p-4 bg-[#f8faf9] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Category Drag Handle */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', cat.id);
                      const cardEl = (e.currentTarget as HTMLElement).closest('[data-category-card]') as HTMLElement | null;
                      if (cardEl && e.dataTransfer.setDragImage) {
                        e.dataTransfer.setDragImage(cardEl, 20, 20);
                      }
                      handleCategoryDragStart(cat.id);
                    }}
                    onDragEnd={() => {
                      setDraggedCatId(null);
                      setDragOverCatIndex(null);
                    }}
                    className="cursor-grab active:cursor-grabbing text-[#8ea69d] hover:text-[#0f766e] hover:bg-[#edf2ef] p-1 -ml-1 rounded-lg transition-colors shrink-0 flex items-center justify-center select-none"
                    title="Kategorie verschieben (Drag & Drop)"
                    aria-label="Kategorie verschieben"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggleCatActive(cat.id)}
                    className="w-4 h-4 rounded text-[#0f766e] focus:ring-[#0f766e] border-[#cbd5d1] cursor-pointer shrink-0"
                    title={isActive ? 'Kategorie deaktivieren' : 'Kategorie aktivieren'}
                  />

                  {/* Color Picker */}
                  <label className="relative cursor-pointer shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full block shadow-2xs border border-black/10"
                      style={{ backgroundColor: cat.color || '#0f766e' }}
                    />
                    <input
                      type="color"
                      value={cat.color || '#0f766e'}
                      onChange={(e) => handleUpdateCatColor(cat.id, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Farbe ändern"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdateCatName(cat.id, e.target.value)}
                    className="font-bold text-sm text-[#14231f] bg-transparent border border-transparent hover:border-[#cbd5d1] focus:border-[#0f766e] focus:bg-white focus:ring-0 rounded-lg px-2.5 py-1 transition-colors flex-1 min-w-0"
                  />

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs sm:text-sm font-black tabular-nums text-[#0f766e] bg-white px-2.5 py-1 rounded-xl border border-[#d8e2de] shadow-2xs">
                      {fmt(catMonthlyTotal)} <span className="text-[10px] text-[#5f7069] font-normal">/ Mo</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Aufklappen / Zuklappen als ganze Zeile unter dem Namen */}
              <button
                type="button"
                onClick={() => handleToggleCatCollapse(cat.id)}
                className="w-full py-2 px-4 bg-[#f8faf9] hover:bg-[#edf2ef] text-xs font-semibold text-[#5f7069] hover:text-[#14231f] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-[#edf2ef] select-none"
              >
                {cat.collapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Aufklappen ({cat.items.length} {cat.items.length === 1 ? 'Posten' : 'Posten'})</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Zuklappen</span>
                  </>
                )}
              </button>

              {/* Items Table */}
              {!cat.collapsed && (
                <div className="p-3 sm:p-4 space-y-2 border-t border-[#edf2ef]">
                  {cat.items.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8ea69d] italic">
                      Keine Posten in dieser Kategorie vorhanden.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cat.items.map((item, idx) => {
                        const itemActive = item.active !== false;
                        const itemMonthly = monthly(item.betrag, item.abbuchung);

                        return (
                          <PostenItemRow
                            key={item.id}
                            item={item}
                            itemActive={itemActive}
                            itemMonthly={itemMonthly}
                            type="expense"
                            itemIndex={idx}
                            onToggleActive={() => handleToggleItemActive(cat.id, item.id)}
                            onUpdateName={(name) => handleUpdateItem(cat.id, item.id, 'name', name)}
                            onUpdateBetrag={(betrag) => handleUpdateItem(cat.id, item.id, 'betrag', betrag)}
                            onUpdateAbbuchung={(abbuchung) => handleUpdateItem(cat.id, item.id, 'abbuchung', abbuchung)}
                            onDelete={() => handleDeleteItem(cat.id, item.id)}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(cat.id, item.id);
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              e.stopPropagation();
                              handleDrop(cat.id, idx);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddCatItem(cat.id)}
                    className="w-full py-2 border border-dashed border-[#cbd5d1] hover:border-[#0f766e] rounded-xl text-xs font-bold text-[#0f766e] hover:bg-[#f0f4f2] transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Posten hinzufügen</span>
                  </button>

                  {/* Kategorie löschen als ganze Zeile unter Posten hinzufügen wenn aufgeklappt */}
                  {deleteConfirmCatId === cat.id ? (
                    <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <span className="text-red-700 font-semibold text-center sm:text-left">
                        Kategorie "{cat.name}" wirklich mit allen Einträgen löschen?
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Löschen
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmCatId(null)}
                          className="px-3 py-1.5 bg-white border border-[#cbd5d1] hover:bg-gray-100 text-[#5f7069] font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCatId(cat.id)}
                      className="w-full py-2 border border-dashed border-red-200 hover:border-red-500 hover:bg-red-50/70 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kategorie löschen</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Neue Kategorie benennen..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#cbd5d1] rounded-2xl text-xs sm:text-sm font-semibold text-[#14231f] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#0f766e] hover:bg-[#0d655e] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kategorie anlegen</span>
          </button>
        </form>
      </div>

      {/* SECTION 3: Monatliche Einnahmen */}
      <div id="monatliche-einnahmen-section" className="space-y-4 scroll-mt-6 pt-4 border-t border-[#e2e8e5]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>MONATLICHE EINNAHMEN</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200/80">
              {incomeGroups.length} GRUPPEN
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/60 cursor-help"
              title="Gruppen per Drag & Drop sortieren"
              aria-label="Gruppen per Drag & Drop sortieren"
            >
              <GripVertical className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
              <span className="hidden sm:inline">Gruppen per Drag &amp; Drop sortieren</span>
            </span>
            <span className="text-xs font-black tabular-nums text-[#16a34a] bg-[#f0fdf4] px-3 py-1 rounded-xl border border-[#bbf7d0]">
              Gesamt: {fmt(totalIncome)} <span className="text-[10px] text-[#5f7069] font-normal">/ Mo</span>
            </span>
          </div>
        </div>

        {/* Income Groups List */}
        {incomeGroups.map((group, idx) => {
          const groupMonthlyTotal = group.items
            .filter((it) => it.active !== false)
            .reduce((s, it) => s + monthly(it.betrag, it.abbuchung), 0);
          const isActive = group.active !== false;
          const isGroupDragged = draggedIncGroupId === group.id;
          const isGroupDragOver = dragOverIncGroupIndex === idx && draggedIncGroupId !== null && draggedIncGroupId !== group.id;

          return (
            <div
              key={group.id}
              data-income-card={group.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedIncGroupId) {
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIncGroupIndex !== idx) {
                    setDragOverIncGroupIndex(idx);
                  }
                }
              }}
              onDragLeave={(e) => {
                if (draggedIncGroupId && dragOverIncGroupIndex === idx) {
                  const related = e.relatedTarget as HTMLElement | null;
                  if (!related || !related.closest(`[data-income-card="${group.id}"]`)) {
                    setDragOverIncGroupIndex(null);
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedIncGroupId) {
                  handleIncGroupDrop(idx);
                }
              }}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                isGroupDragged
                  ? 'opacity-40 border-dashed border-[#16a34a] scale-[0.99]'
                  : isGroupDragOver
                  ? 'border-[#16a34a] ring-2 ring-[#16a34a]/30 shadow-md'
                  : isActive
                  ? 'border-[#d8e2de]'
                  : 'border-[#e5ebe8] opacity-60 bg-[#f9fbf9]'
              }`}
            >
              {/* Income Group Header */}
              <div className="p-3.5 sm:p-4 bg-[#f8faf9] flex flex-col gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Income Group Drag Handle */}
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', group.id);
                      const cardEl = (e.currentTarget as HTMLElement).closest('[data-income-card]') as HTMLElement | null;
                      if (cardEl && e.dataTransfer.setDragImage) {
                        e.dataTransfer.setDragImage(cardEl, 20, 20);
                      }
                      handleIncGroupDragStart(group.id);
                    }}
                    onDragEnd={() => {
                      setDraggedIncGroupId(null);
                      setDragOverIncGroupIndex(null);
                    }}
                    className="cursor-grab active:cursor-grabbing text-[#8ea69d] hover:text-[#16a34a] hover:bg-[#edf2ef] p-1 -ml-1 rounded-lg transition-colors shrink-0 flex items-center justify-center select-none"
                    title="Gruppe verschieben (Drag & Drop)"
                    aria-label="Gruppe verschieben"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleToggleIncGroupActive(group.id)}
                    className="w-4 h-4 rounded text-[#16a34a] focus:ring-[#16a34a] border-[#cbd5d1] cursor-pointer shrink-0"
                    title={isActive ? 'Einnahmengruppe deaktivieren' : 'Einnahmengruppe aktivieren'}
                  />

                  {/* Color Picker */}
                  <label className="relative cursor-pointer shrink-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full block shadow-2xs border border-black/10"
                      style={{ backgroundColor: group.color || '#16a34a' }}
                    />
                    <input
                      type="color"
                      value={group.color || '#16a34a'}
                      onChange={(e) => handleUpdateIncGroupColor(group.id, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Farbe ändern"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(e) => handleUpdateIncGroupName(group.id, e.target.value)}
                    className="font-bold text-sm text-[#14231f] bg-transparent border border-transparent hover:border-[#cbd5d1] focus:border-[#16a34a] focus:bg-white focus:ring-0 rounded-lg px-2.5 py-1 transition-colors flex-1 min-w-0"
                  />

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs sm:text-sm font-black tabular-nums text-[#16a34a] bg-white px-2.5 py-1 rounded-xl border border-[#d8e2de] shadow-2xs">
                      {fmt(groupMonthlyTotal)} <span className="text-[10px] text-[#5f7069] font-normal">/ Mo</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Aufklappen / Zuklappen als ganze Zeile unter dem Namen */}
              <button
                type="button"
                onClick={() => handleToggleIncGroupCollapse(group.id)}
                className="w-full py-2 px-4 bg-[#f8faf9] hover:bg-[#edf2ef] text-xs font-semibold text-[#5f7069] hover:text-[#14231f] flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-t border-[#edf2ef] select-none"
              >
                {group.collapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Aufklappen ({group.items.length} {group.items.length === 1 ? 'Eintrag' : 'Einträge'})</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Zuklappen</span>
                  </>
                )}
              </button>

              {/* Income Items */}
              {!group.collapsed && (
                <div className="p-3 sm:p-4 space-y-2 border-t border-[#edf2ef]">
                  {group.items.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8ea69d] italic">
                      Keine Einnahmen in dieser Gruppe vorhanden.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.items.map((item, idx) => {
                        const itemActive = item.active !== false;
                        const itemMonthly = monthly(item.betrag, item.abbuchung);

                        return (
                          <PostenItemRow
                            key={item.id}
                            item={item}
                            itemActive={itemActive}
                            itemMonthly={itemMonthly}
                            type="income"
                            itemIndex={idx}
                            onToggleActive={() => handleToggleIncItemActive(group.id, item.id)}
                            onUpdateName={(name) => handleUpdateIncItem(group.id, item.id, 'name', name)}
                            onUpdateBetrag={(betrag) => handleUpdateIncItem(group.id, item.id, 'betrag', betrag)}
                            onUpdateAbbuchung={(abbuchung) => handleUpdateIncItem(group.id, item.id, 'abbuchung', abbuchung)}
                            onDelete={() => handleDeleteIncItem(group.id, item.id)}
                          />
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddIncItem(group.id)}
                    className="w-full py-2 border border-dashed border-[#cbd5d1] hover:border-[#16a34a] rounded-xl text-xs font-bold text-[#16a34a] hover:bg-[#f0fdf4] transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Einnahme hinzufügen</span>
                  </button>

                  {/* Einnahmengruppe löschen als ganze Zeile unter Einnahme hinzufügen wenn aufgeklappt */}
                  {deleteConfirmIncGroupId === group.id ? (
                    <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                      <span className="text-red-700 font-semibold text-center sm:text-left">
                        Einnahmengruppe "{group.name}" wirklich mit allen Einträgen löschen?
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteIncomeGroup(group.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Löschen
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmIncGroupId(null)}
                          className="px-3 py-1.5 bg-white border border-[#cbd5d1] hover:bg-gray-100 text-[#5f7069] font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmIncGroupId(group.id)}
                      className="w-full py-2 border border-dashed border-red-200 hover:border-red-500 hover:bg-red-50/70 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 mt-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Einnahmengruppe löschen</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Income Group Form */}
        <form onSubmit={handleAddIncomeGroup} className="flex gap-2">
          <input
            type="text"
            placeholder="Neue Einnahmengruppe benennen..."
            value={newIncName}
            onChange={(e) => setNewIncName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-[#cbd5d1] rounded-2xl text-xs sm:text-sm font-semibold text-[#14231f] focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Gruppe anlegen</span>
          </button>
        </form>
      </div>
    </div>
  );
};
