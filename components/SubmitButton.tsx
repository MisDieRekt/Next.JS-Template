'use client';

import { useTransition } from "react";

export function SubmitButton({ formAction, className, pendingText, children }: any) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const form = event.currentTarget.form;
    if (form) {
      const formData = new FormData(form);
      startTransition(() => formAction(formData));
    }
  };

  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
