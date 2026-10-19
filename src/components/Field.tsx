import { useId, type InputHTMLAttributes } from "react";

export function Field({
  label,
  errors,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  errors?: string[] | undefined;
  hint?: string | undefined;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {props.required && (
          <span aria-hidden className="text-primary">
            {" "}
            *
          </span>
        )}
      </label>
      <input
        id={id}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errId : undefined}
        className="mt-1.5 h-10 w-full rounded-md border border-input bg-card px-3 text-sm aria-[invalid=true]:border-destructive"
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {errors?.length ? (
        <p id={errId} className="mt-1 text-xs text-destructive">
          {errors.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
