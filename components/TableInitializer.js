"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBasket } from "@/context/BasketContext";

/**
 * Client component that reads ?table=N from the URL and stores it in BasketContext.
 * Must be client-side because useSearchParams requires it.
 */
export default function TableInitializer() {
  const searchParams = useSearchParams();
  const { setTableNumber } = useBasket();

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);

  return null;
}
