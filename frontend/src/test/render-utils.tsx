"use client";

import React, { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

export function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="th" messages={{}}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
