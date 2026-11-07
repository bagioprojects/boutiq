export type RoundingStrategy = 'NONE' | 'NEAREST_99' | 'NEAREST_90' | 'NEAREST_INTEGER' | 'NEAREST_5';

export class PriceRoundingService {
  applyStrategy(priceInMinorUnits: number, strategy: RoundingStrategy): number {
    const decimal = priceInMinorUnits / 100;

    switch (strategy) {
      case 'NONE':
        return priceInMinorUnits;

      case 'NEAREST_99': {
        const floored = Math.floor(decimal);
        return Math.round((floored + 0.99) * 100);
      }

      case 'NEAREST_90': {
        const floored = Math.floor(decimal);
        return Math.round((floored + 0.90) * 100);
      }

      case 'NEAREST_INTEGER':
        return Math.round(decimal) * 100;

      case 'NEAREST_5': {
        const rounded = Math.round(decimal / 5) * 5;
        return rounded * 100;
      }

      default:
        return priceInMinorUnits;
    }
  }

  convertCurrency(
    amountInMinorUnits: number,
    exchangeRate: number,
    roundingStrategy: RoundingStrategy = 'NEAREST_99',
  ): number {
    const converted = Math.round(amountInMinorUnits * exchangeRate);
    return this.applyStrategy(converted, roundingStrategy);
  }
}

