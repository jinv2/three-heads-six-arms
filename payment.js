// 支付系统集成
class PaymentSystem {
    constructor() {
        this.methods = ['支付宝', '微信支付', '银行卡', 'PayPal'];
        this.rates = {
            CNY: { stripe: 0.029, alipay: 0.006, wechat: 0.006 },
            USD: { stripe: 0.029, paypal: 0.034 }
        };
    }
    
    // 创建支付订单
    createOrder(amount, currency = 'CNY') {
        const orderId = 'TH' + Date.now();
        return {
            orderId: orderId,
            amount: amount,
            currency: currency,
            status: 'pending',
            createdAt: new Date(),
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderId}`,
            paymentUrl: `/payment/${orderId}`
        };
    }
    
    // 计算手续费
    calculateFee(amount, method) {
        const rate = this.rates.CNY[method] || 0.03;
        return Math.ceil(amount * rate * 100) / 100;
    }
    
    // 支持的支付方式
    getSupportedMethods(amount) {
        return this.methods.map(method => ({
            method: method,
            fee: this.calculateFee(amount, method),
            total: amount + this.calculateFee(amount, method)
        }));
    }
}
