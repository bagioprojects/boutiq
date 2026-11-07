import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { AnalyticsService, TrackEventInput } from '../services/analytics.service';
import type { WebhookDispatcherService, WebhookTopic } from '../services/webhook-dispatcher.service';

export class AnalyticsController extends BaseController {
  constructor(private readonly analyticsService: AnalyticsService) {
    super();
  }

  async trackEvent(input: TrackEventInput): Promise<ApiResponse<{ tracked: boolean }>> {
    await this.analyticsService.track(input);
    return this.ok({ tracked: true });
  }

  async getActiveVisitors(): Promise<ApiResponse<{ activeVisitors: number }>> {
    const count = await this.analyticsService.getActiveVisitorsCount();
    return this.ok({ activeVisitors: count });
  }
}

export class WebhookController extends BaseController {
  constructor(private readonly dispatcher: WebhookDispatcherService) {
    super();
  }

  async triggerEvent(topic: WebhookTopic, payload: Record<string, unknown>): Promise<ApiResponse<{ dispatched: boolean }>> {
    await this.dispatcher.dispatch(topic, payload);
    return this.ok({ dispatched: true });
  }
}

