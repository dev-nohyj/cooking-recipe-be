import { SetMetadata } from '@nestjs/common';
import { MetadataKey } from '../const/labels/common';

// auth checker decoratores
export const NoAuth = () => SetMetadata(MetadataKey.NoAuth, true);
