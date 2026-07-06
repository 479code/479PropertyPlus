import { PartialType } from '@nestjs/swagger';

import { CreateLateFeeRuleDto } from './create-late-fee-rule.dto';

export class UpdateLateFeeRuleDto extends PartialType(CreateLateFeeRuleDto) {}
