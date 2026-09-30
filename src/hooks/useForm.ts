import { useCallback, useMemo, useState } from 'react';

/** Returns an error message, or undefined when the value is acceptable. */
export type Validator<TValues> = (
  value: TValues[keyof TValues],
  values: TValues,
) => string | undefined;

export type ValidationSchema<TValues> = {
  [K in keyof TValues]?: (value: TValues[K], values: TValues) => string | undefined;
};

export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>;

export type UseFormOptions<TValues> = {
  initialValues: TValues;
  schema?: ValidationSchema<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;
};

/**
 * Small typed form controller.
 *
 * Deliberately dependency-free: the app's forms are short, and a local hook
 * keeps validation rules as plain functions that are trivial to unit test.
 * Fields validate on blur and on every change once they have been touched —
 * never while the user is still typing their first attempt, which would flash
 * errors at them mid-word.
 */
export function useForm<TValues extends Record<string, unknown>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormOptions<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    <K extends keyof TValues>(field: K, nextValues: TValues) =>
      schema?.[field]?.(nextValues[field], nextValues),
    [schema],
  );

  const setValue = useCallback(
    <K extends keyof TValues>(field: K, value: TValues[K]) => {
      setValues(current => {
        const next = { ...current, [field]: value };
        // Only re-validate a field the user has already left once, so the
        // first keystroke of an empty field never shows an error.
        setErrors(currentErrors =>
          touched[field]
            ? { ...currentErrors, [field]: validateField(field, next) }
            : currentErrors,
        );
        return next;
      });
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    <K extends keyof TValues>(field: K) => {
      setTouched(current => ({ ...current, [field]: true }));
      setErrors(current => ({ ...current, [field]: validateField(field, values) }));
    },
    [validateField, values],
  );

  const validateAll = useCallback((): FormErrors<TValues> => {
    if (!schema) {
      return {};
    }
    const next: FormErrors<TValues> = {};
    (Object.keys(schema) as (keyof TValues)[]).forEach(field => {
      const message = validateField(field, values);
      if (message) {
        next[field] = message;
      }
    });
    return next;
  }, [schema, validateField, values]);

  const handleSubmit = useCallback(async () => {
    const nextErrors = validateAll();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      // Reveal every message at once so the user sees all of them together.
      setTouched(
        Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof TValues, boolean>>,
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateAll, values]);

  /** True once every rule passes — used to enable the submit button. */
  const isValid = useMemo(() => Object.keys(validateAll()).length === 0, [validateAll]);

  /** Spreads straight onto a TextField. */
  const fieldProps = useCallback(
    <K extends keyof TValues>(field: K) => ({
      value: String(values[field] ?? ''),
      onChangeText: (text: string) => setValue(field, text as TValues[K]),
      onBlur: () => handleBlur(field),
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, errors, touched, setValue, handleBlur],
  );

  return { values, errors, touched, isSubmitting, isValid, setValue, handleSubmit, fieldProps };
}
