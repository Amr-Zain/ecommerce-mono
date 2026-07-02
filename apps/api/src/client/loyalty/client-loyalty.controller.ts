import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthUserPayload } from '@/auth/auth.service';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';

@ApiContext('client')
@ApiTags('Client - Loyalty')
@ApiBearerAuth('access-token')
@Controller('loyalty')
export class ClientLoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUserPayload) {
    return this.loyalty.getClientSummary(user.id);
  }

  @Get('rewards')
  rewards(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.loyalty.listRewards(query, true);
  }

  @Get('transactions')
  transactions(@CurrentUser() user: AuthUserPayload, @ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.loyalty.listClientTransactions(user.id, query);
  }
}
