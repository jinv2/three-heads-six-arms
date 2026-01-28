// 支付系统模块
export class PaymentSystem {
  constructor() {
    this.methods = ['支付宝', '微信支付', '银行卡'];
  }
  
  createOrder(amount) {
    return {
      orderId: 'TH' + Date.now(),
      amount: amount,
      status: 'pending'
    };
  }
}
