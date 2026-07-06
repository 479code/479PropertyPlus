import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateNumberingSequenceDto } from './create-numbering-sequence.dto';

/**
 * `entity` is the immutable natural key of a sequence, so it is omitted from
 * updates; every other field is optional.
 */
export class UpdateNumberingSequenceDto extends PartialType(
  OmitType(CreateNumberingSequenceDto, ['entity'] as const),
) {}
