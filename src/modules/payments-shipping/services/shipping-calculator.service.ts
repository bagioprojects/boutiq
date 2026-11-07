export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  priceAmount: number; // kuruş cinsinden
  currency: string;
  minWeight?: number;
  maxWeight?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  isFreeShipping: boolean;
}

export interface ShippingCalculationInput {
  destinationCountry: string;
  totalWeightGrams: number;
  orderTotalAmount: number;
  currency: string;
}

export class ShippingCalculatorService {
  constructor(private readonly zones: ShippingZone[]) {}

  calculate(input: ShippingCalculationInput): ShippingRate[] {
    const applicableZone = this.zones.find((zone) =>
      zone.countries.includes(input.destinationCountry),
    );

    if (!applicableZone) return [];

    return applicableZone.rates.filter((rate) => {
      if (rate.minWeight !== undefined && input.totalWeightGrams < rate.minWeight) return false;
      if (rate.maxWeight !== undefined && input.totalWeightGrams > rate.maxWeight) return false;
      if (rate.minOrderAmount !== undefined && input.orderTotalAmount < rate.minOrderAmount) return false;
      if (rate.maxOrderAmount !== undefined && input.orderTotalAmount > rate.maxOrderAmount) return false;
      return true;
    });
  }

  getCheapestRate(input: ShippingCalculationInput): ShippingRate | null {
    const rates = this.calculate(input);
    if (rates.length === 0) return null;
    return rates.reduce((min, r) => (r.priceAmount < min.priceAmount ? r : min), rates[0]!);
  }
}

