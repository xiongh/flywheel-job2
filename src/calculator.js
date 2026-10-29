export const defaults = { tasks: 160, manualHours: 4, hourlyRate: 85, aiHours: 1.5, reviewHours: 0.75, reworkHours: 0.35, inputTokens: 8000, outputTokens: 4000, inputPrice: 3, outputPrice: 15, toolingCost: 500 };
export const scenarios = {
  default: defaults,
  optimistic: { tasks: 400, manualHours: 3.5, hourlyRate: 95, aiHours: 1, reviewHours: 0.35, reworkHours: 0.15, inputTokens: 6000, outputTokens: 3000, inputPrice: 3, outputPrice: 15, toolingCost: 900 },
  costly: { tasks: 30, manualHours: 1, hourlyRate: 85, aiHours: 1.1, reviewHours: 0.7, reworkHours: 0.4, inputTokens: 18000, outputTokens: 9000, inputPrice: 8, outputPrice: 35, toolingCost: 1500 }
};
const keys = Object.keys(defaults);
const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
export function validate(values) { const errors = []; for (const key of keys) { const value = values[key]; if (!Number.isFinite(value)) errors.push(`${key} must be a number.`); else if (value < 0) errors.push(`${key} cannot be negative.`); } return errors; }
export function calculate(values) {
  const errors = validate(values); if (errors.length) return { valid: false, errors };
  const { tasks, manualHours, hourlyRate, aiHours, reviewHours, reworkHours, inputTokens, outputTokens, inputPrice, outputPrice, toolingCost } = values;
  const manualCost = money(tasks * manualHours * hourlyRate);
  const aiLaborCost = money(tasks * (aiHours + reviewHours + reworkHours) * hourlyRate);
  const tokenCost = money(tasks * ((inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice));
  const totalAiCost = money(aiLaborCost + tokenCost + toolingCost);
  const netSavings = money(manualCost - totalAiCost);
  const percentageSavings = manualCost === 0 ? 0 : (netSavings / manualCost) * 100;
  const perTaskManual = manualHours * hourlyRate;
  const perTaskAi = (aiHours + reviewHours + reworkHours) * hourlyRate + ((inputTokens / 1_000_000) * inputPrice + (outputTokens / 1_000_000) * outputPrice);
  const contribution = perTaskManual - perTaskAi;
  return { valid: true, manualCost, aiLaborCost, tokenCost, totalAiCost, netSavings, percentageSavings, perTaskManual, perTaskAi, breakEvenTasks: contribution > 0 ? toolingCost / contribution : null };
}
