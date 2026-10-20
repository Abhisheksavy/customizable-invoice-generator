"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId, type KeyboardEvent } from "react";
import { useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { formatCents } from "@/shared/format";
import { lineTotalCents } from "@/shared/invoice/calculate-totals";
import { INVOICE_LIMITS as LIMITS } from "@/shared/invoice/limits";
import { DecimalField, TextField } from "../form-fields";
import { emptyLineItem } from "../invoice-form-values";
import { SectionCard } from "../section-card";

export function LineItemsSection() {
  const { control, trigger } = useFormContext<InvoiceInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const { errors } = useFormState({ control, name: "lineItems" });
  const listError = errors.lineItems?.root?.message ?? errors.lineItems?.message;
  const canAdd = fields.length < LIMITS.lineItems;

  const addItem = () => {
    if (canAdd) append(emptyLineItem(), { focusName: `lineItems.${fields.length}.description` });
  };

  const removeItem = (index: number) => {
    remove(index);
    void trigger("discountCents");
  };

  return (
    <SectionCard
      title="Line items"
      description="Each line is quantity × unit price, rounded to the cent."
    >
      <ol className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <LineItemRow
            key={field.id}
            index={index}
            canRemove={fields.length > 1}
            onRemove={() => removeItem(index)}
            onEnterInLastField={index === fields.length - 1 ? addItem : undefined}
          />
        ))}
      </ol>
      {listError && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {listError}
        </p>
      )}
      <Button
        variant="secondary"
        onClick={addItem}
        disabled={!canAdd}
        className="mt-3 w-full border-dashed shadow-none"
      >
        <Plus aria-hidden />
        Add line item
      </Button>
    </SectionCard>
  );
}

interface LineItemRowProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onEnterInLastField?: () => void;
}

function LineItemRow({ index, canRemove, onRemove, onEnterInLastField }: LineItemRowProps) {
  const headingId = useId();
  const [quantity, unitPriceCents] = useWatch<
    InvoiceInput,
    [`lineItems.${number}.quantity`, `lineItems.${number}.unitPriceCents`]
  >({
    name: [`lineItems.${index}.quantity`, `lineItems.${index}.unitPriceCents`],
  });
  const hasAmount =
    Number.isFinite(quantity) &&
    Number.isFinite(unitPriceCents) &&
    quantity >= 0 &&
    unitPriceCents >= 0;

  const addRowOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onEnterInLastField) {
      event.preventDefault();
      onEnterInLastField();
    }
  };

  return (
    <li
      role="group"
      aria-labelledby={headingId}
      className="rounded-xl border border-line bg-surface-muted/70 p-3 sm:p-4"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 id={headingId} className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Item {index + 1}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove item ${index + 1}`}
          title={canRemove ? undefined : "An invoice needs at least one line item"}
          className="-mr-1.5 text-ink-muted hover:text-danger"
        >
          <Trash2 aria-hidden />
          Remove
        </Button>
      </div>
      <div className="grid gap-3">
        <TextField
          name={`lineItems.${index}.description`}
          label="Description"
          placeholder="e.g. Logo design, three concepts"
          maxLength={LIMITS.descriptionLength}
        />
        <div className="grid grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)] gap-3 @sm:grid-cols-[minmax(0,6rem)_minmax(0,10rem)_1fr]">
          <DecimalField
            name={`lineItems.${index}.quantity`}
            label="Qty"
            kind="decimal"
            deps={["discountCents"]}
          />
          <DecimalField
            name={`lineItems.${index}.unitPriceCents`}
            label="Unit price"
            kind="money"
            leading="$"
            placeholder="0.00"
            deps={["discountCents"]}
            onKeyDown={addRowOnEnter}
          />
          <dl className="col-span-2 flex items-baseline justify-between gap-2 border-t border-line pt-2 @sm:col-span-1 @sm:block @sm:border-0 @sm:pt-0 @sm:text-right">
            <dt className="text-sm font-medium text-ink-soft">Amount</dt>
            <dd className="font-semibold tabular-nums @sm:mt-2.5">
              {hasAmount ? formatCents(lineTotalCents(quantity, unitPriceCents)) : "—"}
            </dd>
          </dl>
        </div>
      </div>
    </li>
  );
}
