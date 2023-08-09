import _ from 'lodash';

export async function TimezoneMiddlware(params: any, next: any): Promise<any> {
    check_date(params.args);

    const result = await next(params);

    return_date(result);

    return result;
}

function check_date(obj: any): void {
    _.forEach(obj, (value) => {
        if (value instanceof Date) {
            value.setHours(value.getHours() + 9);
            return;
        }

        if (typeof value === 'object') {
            return check_date(value);
        }

        return;
    });

    return;
}

function return_date(obj: any): void {
    _.forEach(obj, (value) => {
        if (value instanceof Date) {
            value.setHours(value.getHours() - 9);
            return;
        }

        if (typeof value === 'object') {
            return return_date(value);
        }

        return;
    });

    return;
}
