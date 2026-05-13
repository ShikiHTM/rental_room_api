import type { IPaymentStrategy } from "../../types/types.js";

export class CashPaymentStrategy implements IPaymentStrategy {
    public async pay(_amount: number): Promise<void> {
        // Cash on arrival — no external integration. The host collects the cash on
        // check-in, so we just acknowledge the intent and record a PENDING payment.
        return;
    }
}
