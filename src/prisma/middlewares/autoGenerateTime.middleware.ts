import { arrayNotEmpty, isNotEmptyObject } from 'class-validator';

export function AutoGenerateTimeMiddleware(params: any, next: any, Prisma: any): Promise<any> {
    if (params.model) {
        const field = Prisma[`${params.model.charAt(0).toUpperCase() + params.model.slice(1)}ScalarFieldEnum`];

        if (field['createdAt'] || field['updatedAt']) {
            switch (params.action) {
                case 'create':
                    if (isNotEmptyObject(params.args.data)) {
                        params.args.data['createdAt'] = new Date();
                        if (field['updatedAt']) {
                            params.args.data['updatedAt'] = new Date();
                        }
                    }
                    break;

                case 'createMany':
                    if (arrayNotEmpty(params.args.data)) {
                        params.args.data.map((data: any) => {
                            if (field['updatedAt']) {
                                return {
                                    ...data,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                };
                            } else {
                                return {
                                    ...data,
                                    createdAt: new Date(),
                                };
                            }
                        });
                    }
                    break;

                case 'update':
                case 'updateMany':
                    if (isNotEmptyObject(params.args.data)) {
                        params.args.data['updatedAt'] = new Date();
                    }
                    break;
            }
        }
    }

    return next(params);
}
