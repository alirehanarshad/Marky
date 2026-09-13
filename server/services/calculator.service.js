// Deterministic Mathematical E-Commerce Calculators
// Strict rule: No LLM halluncination for math. Real deterministic formulas.

export class CalculatorService {
  // Tool 34: Break-Even ROAS & CPA Calculator
  calculateBreakEvenROAS({ sellingPrice, cogs, shippingCost = 0, packagingCost = 0, returnRatePercent = 0, targetProfitMarginPercent = 0 }) {
    const sp = Number(sellingPrice) || 0;
    const directCost = (Number(cogs) || 0) + (Number(shippingCost) || 0) + (Number(packagingCost) || 0);
    const returnFactor = 1 + ((Number(returnRatePercent) || 0) / 100);
    const effectiveCost = directCost * returnFactor;
    const grossMargin = sp - effectiveCost;
    const grossMarginPercent = sp > 0 ? (grossMargin / sp) * 100 : 0;

    // Break-Even ROAS = Selling Price / Gross Margin
    const breakEvenROAS = grossMargin > 0 ? (sp / grossMargin) : 0;
    // Break-Even CPA = Gross Margin
    const maxAllowableCPA = Math.max(0, grossMargin);

    // Target ROAS including desired profit margin
    const targetProfitAmount = (sp * (Number(targetProfitMarginPercent) || 0)) / 100;
    const targetAllowableAdSpend = Math.max(0, grossMargin - targetProfitAmount);
    const targetROAS = targetAllowableAdSpend > 0 ? (sp / targetAllowableAdSpend) : 0;
    const targetCPA = targetAllowableAdSpend;

    return {
      formula: 'Break-Even ROAS = Selling Price / (Selling Price - COGS - Shipping - Packaging)',
      inputs: {
        sellingPrice: sp,
        cogs: Number(cogs),
        shippingCost: Number(shippingCost),
        packagingCost: Number(packagingCost),
        returnRatePercent: Number(returnRatePercent),
        targetProfitMarginPercent: Number(targetProfitMarginPercent)
      },
      metrics: {
        grossMarginPKR: Math.round(grossMargin),
        grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
        breakEvenROAS: Number(breakEvenROAS.toFixed(2)),
        maxBreakEvenCPA: Math.round(maxAllowableCPA),
        targetROAS: Number(targetROAS.toFixed(2)),
        targetCPA: Math.round(targetCPA)
      },
      guidance: [
        `If your actual ROAS is above ${breakEvenROAS.toFixed(2)}x, your ad campaign is profitable.`,
        `Never bid or acquire customers above PKR ${Math.round(maxAllowableCPA)} per order to prevent cash-flow bleed.`,
        `To achieve your ${targetProfitMarginPercent}% net profit target, keep ad CPA below PKR ${Math.round(targetCPA)} (Target ROAS: ${targetROAS.toFixed(2)}x).`
      ]
    };
  }

  // Tool 35: Sale Discount & Profit Estimator
  calculateDiscountProfit({ originalPrice, discountPercent, expectedUnitsSold, unitCogs, adSpend = 0 }) {
    const op = Number(originalPrice) || 0;
    const discPct = Number(discountPercent) || 0;
    const units = Number(expectedUnitsSold) || 0;
    const cogs = Number(unitCogs) || 0;
    const totalAdSpend = Number(adSpend) || 0;

    const discountAmount = (op * discPct) / 100;
    const salePrice = op - discountAmount;
    const unitGrossProfit = salePrice - cogs;
    const totalRevenue = salePrice * units;
    const totalCOGS = cogs * units;
    const totalGrossProfit = unitGrossProfit * units;
    const netProfit = totalGrossProfit - totalAdSpend;
    const netMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const blendedROAS = totalAdSpend > 0 ? (totalRevenue / totalAdSpend) : 0;

    return {
      formula: 'Net Profit = (Sale Price - COGS) * Units - Total Ad Spend',
      inputs: {
        originalPrice: op,
        discountPercent: discPct,
        salePrice,
        expectedUnitsSold: units,
        unitCogs: cogs,
        adSpend: totalAdSpend
      },
      metrics: {
        discountPerUnit: Math.round(discountAmount),
        effectiveSalePrice: Math.round(salePrice),
        unitMargin: Math.round(unitGrossProfit),
        projectedRevenue: Math.round(totalRevenue),
        projectedGrossProfit: Math.round(totalGrossProfit),
        projectedNetProfit: Math.round(netProfit),
        netMarginPercent: Number(netMarginPercent.toFixed(1)),
        blendedROAS: Number(blendedROAS.toFixed(2))
      },
      guidance: [
        `Discounting by ${discPct}% drops your per-unit profit from PKR ${op - cogs} to PKR ${Math.round(unitGrossProfit)}.`,
        `You need to sell at least ${Math.ceil(totalAdSpend / (unitGrossProfit > 0 ? unitGrossProfit : 1))} units just to cover the ad budget of PKR ${totalAdSpend}.`,
        netProfit > 0 ? `Campaign is projected to generate PKR ${Math.round(netProfit)} net profit.` : `Warning: Projected campaign will lose PKR ${Math.abs(Math.round(netProfit))}. Consider reducing discount or ad spend.`
      ]
    };
  }
}

export const calculatorService = new CalculatorService();
