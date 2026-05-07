import type { IPaymentStrategy } from "../types/types.js";

export class PaymentService {
    protected strategy: IPaymentStrategy;

    public constructor(strategy: IPaymentStrategy) {
        this.strategy = strategy;
    };

    public pay(amount: number) {
        if(!this.strategy) {
            throw new Error('Payment strategy not set.');
        }

        return this.strategy.pay(amount);
    }
}