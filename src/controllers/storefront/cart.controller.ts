export class CartController {
  public static async getCartViewModel() {
    return {
      title: 'Alışveriş Sepetim',
      itemCount: 0,
      totalAmountFormatted: '0,00 ₺',
      isEmpty: true,
    };
  }
}

