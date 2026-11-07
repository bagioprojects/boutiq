import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { OrderStateMachineService } from '../services/order-state-machine.service';
import type { SplitFulfillmentService, CreateFulfillmentInput } from '../services/split-fulfillment.service';
import { toOrderId } from '../../../core/types/branded';

export class AdminOrderController extends BaseController {
  constructor(
    private readonly stateMachine: OrderStateMachineService,
    private readonly fulfillmentService: SplitFulfillmentService,
  ) {
    super();
  }

  async transitionStatus(orderId: string, status: any, actorId: string, note?: string): Promise<ApiResponse<void>> {
    const result = await this.stateMachine.transition(toOrderId(orderId), status, actorId, note);
    return this.handleResult(result);
  }

  async cancel(orderId: string, reason: string, actorId: string): Promise<ApiResponse<void>> {
    const result = await this.stateMachine.cancelOrder(toOrderId(orderId), reason, actorId);
    return this.handleResult(result);
  }

  async fulfill(input: CreateFulfillmentInput): Promise<ApiResponse<{ fulfillmentId: string }>> {
    const result = await this.fulfillmentService.createFulfillment(input);
    return this.handleResult(result);
  }
}

