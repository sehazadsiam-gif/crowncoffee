"use client";

import { useState, useEffect } from "react";
import { getItemCustomizations } from "@/lib/customizations";

export default function CustomizationModal({ item, isOpen, onClose, onConfirm }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const customizations = getItemCustomizations(item);

  // Initialize selections with default required options
  useEffect(() => {
    if (customizations) {
      const initial = {};
      customizations.forEach((custom) => {
        if (custom.required && custom.options.length > 0) {
          // Default to the first option (usually Whole Milk / Normal Sweetness)
          initial[custom.id] = custom.options[0];
        } else if (!custom.required) {
          // Multi-select or optional defaults to empty array
          initial[custom.id] = [];
        }
      });
      setSelectedOptions(initial);
    }
  }, [item, customizations]);

  if (!isOpen || !item || !customizations) return null;

  // Handle single-select option changes (e.g., radios)
  const handleSingleSelect = (customId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [customId]: option,
    }));
  };

  // Handle multi-select option changes (e.g., checkboxes)
  const handleMultiSelect = (customId, option) => {
    setSelectedOptions((prev) => {
      const current = prev[customId] || [];
      const exists = current.some((opt) => opt.name === option.name);
      const updated = exists
        ? current.filter((opt) => opt.name !== option.name)
        : [...current, option];
      return {
        ...prev,
        [customId]: updated,
      };
    });
  };

  // Calculate customized unit price
  const calculateUnitPrice = () => {
    let price = item.price;
    Object.values(selectedOptions).forEach((selection) => {
      if (Array.isArray(selection)) {
        selection.forEach((opt) => {
          price += opt.price || 0;
        });
      } else if (selection && selection.price) {
        price += selection.price;
      }
    });
    return price;
  };

  const handleAdd = () => {
    onConfirm(selectedOptions, calculateUnitPrice());
    onClose();
  };

  const unitPrice = calculateUnitPrice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-[var(--paper)] shadow-2xl border border-[var(--line)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[var(--card)] px-6 py-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent)]">
              Customize Item
            </span>
            <h3 className="font-display text-lg font-bold text-[var(--ink)] mt-0.5">
              {item.name}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1.5 text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {customizations.map((custom) => {
            const isRequired = custom.required;
            return (
              <fieldset key={custom.id} className="space-y-3">
                <legend className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center justify-between w-full">
                  <span>{custom.name}</span>
                  {isRequired ? (
                    <span className="text-[9px] bg-amber-100 text-amber-800 rounded-sm px-1.5 py-0.5 font-bold uppercase">
                      Required
                    </span>
                  ) : (
                    <span className="text-[9px] text-[var(--ink-soft)] font-normal">
                      Optional
                    </span>
                  )}
                </legend>
                
                <div className="grid grid-cols-1 gap-2">
                  {custom.options.map((opt) => {
                    const priceModifier = opt.price ? `+৳${opt.price}` : "Free";
                    
                    if (isRequired) {
                      // Render Radio
                      const isSelected = selectedOptions[custom.id]?.name === opt.name;
                      return (
                        <label
                          key={opt.name}
                          onClick={() => handleSingleSelect(custom.id, opt)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition ${
                            isSelected
                              ? "border-[var(--accent)] bg-amber-50/15"
                              : "border-[var(--line)] bg-white hover:border-[var(--ink-soft)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[var(--accent)]" : "border-[var(--line)]"
                            }`}>
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                              )}
                            </span>
                            <span className="text-sm font-semibold text-[var(--ink)]">{opt.name}</span>
                          </div>
                          <span className="text-xs font-bold text-[var(--accent)]">{priceModifier}</span>
                        </label>
                      );
                    } else {
                      // Render Checkbox
                      const isChecked = (selectedOptions[custom.id] || []).some(
                        (cOpt) => cOpt.name === opt.name
                      );
                      return (
                        <label
                          key={opt.name}
                          onClick={() => handleMultiSelect(custom.id, opt)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition ${
                            isChecked
                              ? "border-[var(--accent)] bg-amber-50/15"
                              : "border-[var(--line)] bg-white hover:border-[var(--ink-soft)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--line)]"
                            }`}>
                              {isChecked && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </span>
                            <span className="text-sm font-semibold text-[var(--ink)]">{opt.name}</span>
                          </div>
                          <span className="text-xs font-bold text-[var(--accent)]">{priceModifier}</span>
                        </label>
                      );
                    }
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[var(--card)] px-6 py-4 border-t border-[var(--line)] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[var(--ink-soft)] font-medium">Total Price</p>
            <p className="text-lg font-extrabold text-[var(--accent)]">৳{unitPrice}</p>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-full bg-[var(--ink)] hover:bg-[var(--accent)] text-white font-semibold text-sm px-6 py-2.5 transition active:scale-95 shadow-md"
          >
            Add to Basket
          </button>
        </div>
      </div>
    </div>
  );
}
