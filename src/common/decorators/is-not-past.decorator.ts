import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validates that a date string (YYYY-MM-DD or full ISO) is today or in the future.
 */
export function IsNotPast(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPast',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!value || typeof value !== 'string') return true; // let @IsNotEmpty / @IsDateString handle it

          const input = new Date(value);
          if (isNaN(input.getTime())) return true; // let @IsDateString handle invalid format

          // Compare dates only (strip time component)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          input.setHours(0, 0, 0, 0);

          return input >= today;
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be today or a future date`;
        },
      },
    });
  };
}
