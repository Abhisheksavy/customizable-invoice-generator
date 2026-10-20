"use client";

import type { ComponentProps } from "react";
import {
  get,
  useController,
  useFormContext,
  useFormState,
  type FieldPath,
  type FieldPathByValue,
} from "react-hook-form";
import { DecimalInput, type DecimalInputProps } from "@/components/ui/decimal-input";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";

type TextPath = FieldPathByValue<InvoiceInput, string>;
type NumberPath = FieldPathByValue<InvoiceInput, number>;

interface FieldChromeProps {
  label: string;
  hint?: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
}

interface TextFieldProps
  extends FieldChromeProps, Omit<ComponentProps<"input">, "name" | "className"> {
  name: TextPath;
  deps?: FieldPath<InvoiceInput>[];
}

/** Labelled text input registered with the invoice form. */
export function TextField({
  name,
  deps,
  label,
  hint,
  optional,
  hideLabel,
  className,
  ...inputProps
}: TextFieldProps) {
  const { register } = useFormContext<InvoiceInput>();
  const error = useFieldError(name);

  return (
    <Field
      label={label}
      hint={hint}
      optional={optional}
      hideLabel={hideLabel}
      error={error}
      className={className}
    >
      {(control) => <Input {...inputProps} {...control} {...register(name, { deps })} />}
    </Field>
  );
}

interface TextAreaFieldProps
  extends FieldChromeProps, Omit<ComponentProps<"textarea">, "name" | "className"> {
  name: TextPath;
}

/** Labelled multi-line input registered with the invoice form. */
export function TextAreaField({
  name,
  label,
  hint,
  optional,
  hideLabel,
  className,
  ...textareaProps
}: TextAreaFieldProps) {
  const { register } = useFormContext<InvoiceInput>();
  const error = useFieldError(name);

  return (
    <Field
      label={label}
      hint={hint}
      optional={optional}
      hideLabel={hideLabel}
      error={error}
      className={className}
    >
      {(control) => <Textarea {...textareaProps} {...control} {...register(name)} />}
    </Field>
  );
}

interface DecimalFieldProps
  extends
    FieldChromeProps,
    Omit<DecimalInputProps, "name" | "value" | "onValueChange" | "className"> {
  name: NumberPath;
  deps?: FieldPath<InvoiceInput>[];
}

/** Labelled money or decimal input bound to the invoice form. */
export function DecimalField({
  name,
  deps,
  label,
  hint,
  optional,
  hideLabel,
  className,
  ...inputProps
}: DecimalFieldProps) {
  const { field, fieldState } = useController<InvoiceInput, NumberPath>({ name, rules: { deps } });

  return (
    <Field
      label={label}
      hint={hint}
      optional={optional}
      hideLabel={hideLabel}
      error={fieldState.error?.message}
      className={className}
    >
      {(control) => (
        <DecimalInput
          {...inputProps}
          {...control}
          ref={field.ref}
          name={field.name}
          value={field.value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    </Field>
  );
}

function useFieldError(name: FieldPath<InvoiceInput>): string | undefined {
  const { errors } = useFormState<InvoiceInput>({ name });
  return get(errors, name)?.message;
}
