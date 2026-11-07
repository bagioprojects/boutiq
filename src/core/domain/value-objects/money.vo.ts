import { DomainError } from '../errors/domain.error';

export type CurrencyCode = 'TRY' | 'USD' | 'EUR' | 'GBP';

export class Money {
  private constructor(
    public readonly amount: number, // Integer - en küçük birim (kuruş/cent)
    public readonly currency: CurrencyCode,
  ) {
    if (!Number.isInteger(amount)) {
      throw new DomainError('Para miktarı tam sayı (kuruş/cent) olmalıdır');
    }
    if (amount < 0) {
      throw new DomainError('Para miktarı negatif olamaz');
    }
  }

  static of(amountInMinorUnits: number, currency: CurrencyCode = 'TRY'): Money {
    return new Money(Math.round(amountInMinorUnits), currency);
  }

  static fromDecimal(decimal: number, currency: CurrencyCode = 'TRY'): Money {
    return new Money(Math.round(decimal * 100), currency);
  }

  static zero(currency: CurrencyCode = 'TRY'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (other.amount > this.amount) {
      throw new DomainError('Para çıkarma sonucu negatif olamaz');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  percentage(percent: number): Money {
    return this.multiply(percent / 100);
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toDecimal(): number {
    return this.amount / 100;
  }

  format(locale = 'tr-TR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.toDecimal());
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Para birimi uyuşmazlığı: ${this.currency} vs ${other.currency}`);
    }
  }
}

