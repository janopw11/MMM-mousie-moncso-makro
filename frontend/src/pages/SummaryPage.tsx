import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import { useUsers } from '../context/UserContext';
import { useWeekSummary } from '../hooks/useWeekSummary';
import { formatDayLabel, getWeekStart, shiftWeek, toDateKey } from '../utils/date';
import { MACRO_COLORS_HEX } from '../utils/constants';

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function SummaryPage() {
  const { activeUser } = useUsers();
  const [weekStart, setWeekStart] = useState(() => toDateKey(getWeekStart(new Date())));
  const { summary, loading, error } = useWeekSummary(activeUser?.id ?? null, weekStart);

  if (!activeUser) {
    return <div className="empty-state">Add a user to get started.</div>;
  }

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div className="error-banner">{error}</div>}
        <div className="spinner-wrap">Loading summary…</div>
      </div>
    );
  }

  const caloriesData = summary.days.map((d) => ({
    day: formatDayLabel(new Date(d.date)),
    Consumed: round(d.consumed.calories),
    Goal: round(d.goal.calories),
  }));

  const macroData = summary.days.map((d) => ({
    day: formatDayLabel(new Date(d.date)),
    Protein: round(d.consumed.proteinG),
    Carbs: round(d.consumed.carbsG),
    Fat: round(d.consumed.fatG),
  }));

  const veggieData = summary.days.map((d) => ({
    day: formatDayLabel(new Date(d.date)),
    Consumed: round(d.veggiesConsumedG),
    Goal: d.veggiesGoalG,
  }));

  const totalMacroCalories = {
    protein: summary.weekConsumedTotal.proteinG * 4,
    carbs: summary.weekConsumedTotal.carbsG * 4,
    fat: summary.weekConsumedTotal.fatG * 9,
  };
  const pieData = [
    { name: 'Protein', value: round(totalMacroCalories.protein), color: MACRO_COLORS_HEX.protein },
    { name: 'Carbs', value: round(totalMacroCalories.carbs), color: MACRO_COLORS_HEX.carbs },
    { name: 'Fat', value: round(totalMacroCalories.fat), color: MACRO_COLORS_HEX.fat },
  ].filter((entry) => entry.value > 0);

  const remainingCalories = summary.weekGoalTotal.calories - summary.weekConsumedTotal.calories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setWeekStart((w) => shiftWeek(w, -1))}>
          ← Prev week
        </button>
        <h2>
          Week of {summary.weekStart} – {summary.weekEnd}
        </h2>
        <button className="btn btn-secondary" onClick={() => setWeekStart((w) => shiftWeek(w, 1))}>
          Next week →
        </button>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <div className="stat-row">
            <span>Consumed</span>
            <strong>{round(summary.weekConsumedTotal.calories)} kcal</strong>
          </div>
        </div>
        <div className="card">
          <div className="stat-row">
            <span>Goal</span>
            <strong>{round(summary.weekGoalTotal.calories)} kcal</strong>
          </div>
        </div>
        <div className="card">
          <div className="stat-row">
            <span>{remainingCalories >= 0 ? 'Remaining' : 'Over goal'}</span>
            <strong style={{ color: remainingCalories >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {round(Math.abs(remainingCalories))} kcal
            </strong>
          </div>
        </div>
        <div className="card">
          <div className="stat-row">
            <span>Veggies</span>
            <strong>
              {round(summary.weekVeggiesConsumedTotalG)} / {summary.weekVeggiesGoalTotalG} g
            </strong>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card chart-card">
          <h3>Calories: consumed vs goal</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              />
              <Legend />
              <Bar dataKey="Consumed" fill="#f6a623" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Goal" fill="#c9c2b4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Weekly macro split (by calories)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Macros per day (g)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={macroData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              />
              <Legend />
              <Bar dataKey="Protein" stackId="macros" fill={MACRO_COLORS_HEX.protein} />
              <Bar dataKey="Carbs" stackId="macros" fill={MACRO_COLORS_HEX.carbs} />
              <Bar dataKey="Fat" stackId="macros" fill={MACRO_COLORS_HEX.fat} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Veggies: consumed vs goal (g)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={veggieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}
              />
              <Legend />
              <Bar dataKey="Consumed" fill={MACRO_COLORS_HEX.veggies} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Goal" fill="#c9c2b4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
