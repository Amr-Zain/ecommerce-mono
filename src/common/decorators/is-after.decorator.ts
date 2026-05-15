import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];

          if (!value || !relatedValue) return true; // Let IsNotEmpty handle missing values

          const startDate = new Date(relatedValue as string | number | Date);
          const endDate = new Date(value as string | number | Date);

          return endDate > startDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must be after ${relatedPropertyName}`;
        },
      },
    });
  };
}
