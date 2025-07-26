import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(private health: HealthCheckService) {}

  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
