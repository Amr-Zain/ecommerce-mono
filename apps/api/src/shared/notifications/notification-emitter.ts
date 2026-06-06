import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

/**
 * Dedicated emitter for real-time notification delivery (SSE).
 *
 * Isolated from EventEmitter2 (the domain event bus) so that
 * internal notification push does not share the same channel
 * as durable domain events dispatched by the outbox worker.
 */
@Injectable()
export class NotificationEmitter extends EventEmitter {}
