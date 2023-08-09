import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from '../asset/labels/common';

// auth checker decoratores
export const NoAuth = () => SetMetadata(MetadataKey.NoAuth, true);
