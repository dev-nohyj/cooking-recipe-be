import { PresignedUrlTypeLabel } from 'src/asset/labels/common';

export const presignedUrlFilePath = (type: PresignedUrlTypeLabel) => {
    switch (type) {
        case PresignedUrlTypeLabel.userProfile:
            return 'userProfile/origin/';
        default:
            '';
    }
};
