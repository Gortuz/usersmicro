import {
    PipeTransform,
    Injectable,
    BadRequestException,
    ArgumentMetadata,
    Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResponseHelper } from '../helpers/response.helper';

@Injectable()
export class ValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!metadata.type || metadata.type !== 'body' || !metadata.metatype) {
            return value;
        }

        const object = plainToInstance(
            metadata.metatype as Type<any>,
            value,
        );
        const errors = await validate(object);
        
        if (errors.length > 0) {
            const formattedErrors: Record<string, any> = {};
            errors.forEach((err: any) => {
                if (err.constraints) {
                    formattedErrors[err.property] = Object.values(err.constraints);
                }
            });

            throw new BadRequestException(
                ResponseHelper.badRequest('Validation failed', formattedErrors),
            );
        }

        return value;
    }
}