"use client";

import { EyeOff, Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Switch } from "@/components/ui/switch";
import type { InvoiceInput } from "@/shared/dto/invoice.dto";
import { INVOICE_LIMITS as LIMITS } from "@/shared/invoice/limits";
import { TextField } from "../form-fields";
import { SectionCard } from "../section-card";

const SUGGESTED_LABELS = ["PO number", "Project", "Payment terms", "Tax ID"];

export function CustomFieldsSection() {
  const { control } = useFormContext<InvoiceInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "customFields" });
  const customFields = useWatch({ control, name: "customFields" });
  const usedLabels = new Set(customFields.map((field) => field.label.trim().toLowerCase()));
  const suggestions = SUGGESTED_LABELS.filter((label) => !usedLabels.has(label.toLowerCase()));
  const canAdd = fields.length < LIMITS.customFields;
  const hiddenCount = customFields.filter((field) => !field.visible).length;
  const summary =
    customFields.length === 0
      ? "None added"
      : [
          `${customFields.length} ${customFields.length === 1 ? "field" : "fields"}`,
          hiddenCount > 0 && `${hiddenCount} hidden`,
        ]
          .filter(Boolean)
          .join(" · ");

  const addField = (label = "") =>
    append(
      { label, value: "", visible: true },
      { focusName: `customFields.${fields.length}.${label ? "value" : "label"}` },
    );

  return (
    <SectionCard
      title="Custom fields"
      description="Extra details such as a PO number. Hidden fields are saved for you but left off the invoice, PDF and email."
      summary={summary}
      fields={["customFields"]}
    >
      {fields.length > 0 && (
        <ul className="mb-4 flex flex-col gap-3">
          {fields.map((field, index) => (
            <CustomFieldRow key={field.id} index={index} onRemove={() => remove(index)} />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => addField()} disabled={!canAdd}>
          <Plus aria-hidden />
          Add field
        </Button>
        {canAdd &&
          suggestions.map((label) => (
            <Chip key={label} onClick={() => addField(label)} aria-label={`Add ${label} field`}>
              <Plus aria-hidden />
              {label}
            </Chip>
          ))}
      </div>
    </SectionCard>
  );
}

function CustomFieldRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const switchLabelId = useId();
  const { setValue } = useFormContext<InvoiceInput>();
  const [label, isVisible] = useWatch<
    InvoiceInput,
    [`customFields.${number}.label`, `customFields.${number}.visible`]
  >({
    name: [`customFields.${index}.label`, `customFields.${index}.visible`],
  });
  const displayName = label.trim() || `field ${index + 1}`;

  return (
    <li className="rounded-xl bg-surface p-3 shadow-tile sm:p-4">
      <div className="grid gap-3 @lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <TextField
          name={`customFields.${index}.label`}
          label="Label"
          placeholder="e.g. PO number"
          maxLength={LIMITS.customFieldLabelLength}
        />
        <TextField
          name={`customFields.${index}.value`}
          label="Value"
          placeholder="e.g. 4471"
          maxLength={LIMITS.customFieldValueLength}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={isVisible}
            onCheckedChange={(checked) =>
              setValue(`customFields.${index}.visible`, checked, { shouldDirty: true })
            }
            aria-labelledby={switchLabelId}
          />
          <span id={switchLabelId} className="text-sm text-ink-soft">
            Show on invoice
          </span>
          {!isVisible && (
            <Badge>
              <EyeOff aria-hidden className="size-3" />
              Hidden
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${displayName}`}
          className="-mr-1.5 text-ink-muted hover:text-danger"
        >
          <Trash2 aria-hidden />
          Remove
        </Button>
      </div>
    </li>
  );
}
