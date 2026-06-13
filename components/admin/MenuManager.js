"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import CrownMark from "@/components/CrownMark";
import ImageCropper from "./ImageCropper";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextOrder(items, category) {
  const inCategory = items.filter((item) => item.category === category);
  if (inCategory.length === 0) return 0;
  return Math.max(...inCategory.map((item) => item.order ?? 0)) + 1;
}

export default function MenuManager({ initialMenu }) {
  const [menu, setMenu] = useState(initialMenu);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [cropTarget, setCropTarget] = useState(null); // item id awaiting a cropped photo
  const [cropFile, setCropFile] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  const groups = useMemo(() => {
    const items = [...menu.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return menu.categories.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }));
  }, [menu]);

  function markDirty(updater) {
    setMenu(updater);
    setDirty(true);
    setSavedAt(null);
  }

  function updateItem(id, patch) {
    markDirty((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function addItem(category) {
    const id = makeId();
    markDirty((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id,
          name: "New item",
          description: "",
          price: 0,
          category,
          image: "",
          order: nextOrder(prev.items, category),
        },
      ],
    }));
    setExpandedId(id);
  }

  function deleteItem(id) {
    if (!confirm("Remove this item from the menu?")) return;
    markDirty((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
    if (expandedId === id) setExpandedId(null);
  }

  function moveItem(id, direction) {
    markDirty((prev) => {
      const item = prev.items.find((i) => i.id === id);
      if (!item) return prev;

      const siblings = prev.items
        .filter((i) => i.category === item.category)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const index = siblings.findIndex((i) => i.id === id);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= siblings.length) return prev;

      const a = siblings[index];
      const b = siblings[targetIndex];
      const aOrder = a.order ?? 0;
      const bOrder = b.order ?? 0;

      return {
        ...prev,
        items: prev.items.map((i) => {
          if (i.id === a.id) return { ...i, order: bOrder };
          if (i.id === b.id) return { ...i, order: aOrder };
          return i;
        }),
      };
    });
  }

  function moveCategory(category, direction) {
    markDirty((prev) => {
      const index = prev.categories.indexOf(category);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.categories.length) return prev;

      const categories = [...prev.categories];
      [categories[index], categories[targetIndex]] = [categories[targetIndex], categories[index]];
      return { ...prev, categories };
    });
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    if (menu.categories.includes(name)) {
      setError(`"${name}" already exists.`);
      return;
    }
    setError("");
    markDirty((prev) => ({ ...prev, categories: [...prev.categories, name] }));
    setNewCategory("");
  }

  function removeCategory(category) {
    const hasItems = menu.items.some((item) => item.category === category);
    if (hasItems) {
      setError(`Move or remove items in "${category}" before deleting it.`);
      return;
    }
    setError("");
    markDirty((prev) => ({ ...prev, categories: prev.categories.filter((c) => c !== category) }));
  }

  function openPhotoPicker(itemId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        setCropTarget(itemId);
        setCropFile(file);
      }
    };
    input.click();
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save the menu.");
        setSaving(false);
        return;
      }

      const saved = await res.json();
      setMenu(saved);
      setDirty(false);
      setSavedAt(new Date());
    } catch {
      setError("Could not save the menu. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Save bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] px-5 py-3.5">
        <p className="text-sm text-[var(--ink-soft)]">
          {dirty
            ? "You have unsaved changes."
            : savedAt
              ? `Saved at ${savedAt.toLocaleTimeString()}.`
              : "Edit items, then save to publish."}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving\u2026" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Categories */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <h3 className="font-display text-lg">Categories</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Controls the order categories appear in on the Menu page.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {menu.categories.map((category, index) => (
            <li
              key={category}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <span className="font-medium">{category}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => moveCategory(category, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
                  aria-label={`Move ${category} up`}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(category, 1)}
                  disabled={index === menu.categories.length - 1}
                  className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
                  aria-label={`Move ${category} down`}
                >
                  &darr;
                </button>
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="rounded-md border border-[var(--line)] px-2 py-1 text-xs text-red-600 hover:border-red-300"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="New category name"
            className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={addCategory}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Add
          </button>
        </div>
      </div>

      {/* Items by category */}
      {groups.map((group) => (
        <div key={group.category} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-lg">{group.category}</h3>
            <button
              type="button"
              onClick={() => addItem(group.category)}
              className="rounded-full border border-[var(--line)] px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              + Add item
            </button>
          </div>

          {group.items.length === 0 && (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">No items yet.</p>
          )}

          <ul className="mt-4 flex flex-col gap-3">
            {group.items.map((item, index) => (
              <li key={item.id} className="rounded-xl border border-[var(--line)]">
                <div className="flex items-center gap-3 p-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--accent-soft)]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <CrownMark className="h-5 w-5 text-[var(--accent)] opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name || "Untitled item"}</p>
                    <p className="text-sm text-[var(--ink-soft)]">&#2547;{item.price}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveItem(item.id, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
                      aria-label={`Move ${item.name} up`}
                    >
                      &uarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(item.id, 1)}
                      disabled={index === group.items.length - 1}
                      className="rounded-md border border-[var(--line)] px-2 py-1 text-xs disabled:opacity-30"
                      aria-label={`Move ${item.name} down`}
                    >
                      &darr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {expandedId === item.id ? "Close" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="rounded-md border border-[var(--line)] px-3 py-1 text-xs font-semibold text-red-600 hover:border-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {expandedId === item.id && (
                  <div className="grid grid-cols-1 gap-4 border-t border-[var(--line)] p-4 sm:grid-cols-[160px_1fr]">
                    <div className="flex flex-col gap-2">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--accent-soft)]">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <CrownMark className="h-8 w-8 text-[var(--accent)] opacity-40" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openPhotoPicker(item.id)}
                        className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        {item.image ? "Change photo" : "Add photo"}
                      </button>
                      {item.image && (
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { image: "" })}
                          className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold text-red-600 hover:border-red-300"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                          Name
                        </span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
                        />
                      </label>

                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                          Description
                        </span>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(event) => updateItem(item.id, { description: event.target.value })}
                          className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
                        />
                      </label>

                      <div className="flex flex-wrap gap-3">
                        <label className="flex flex-1 flex-col gap-1 text-sm">
                          <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                            Price (&#2547;)
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(event) =>
                              updateItem(item.id, { price: Number(event.target.value) || 0 })
                            }
                            className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
                          />
                        </label>

                        <label className="flex flex-1 flex-col gap-1 text-sm">
                          <span className="text-xs font-semibold tracking-[0.2em] text-[var(--mute)] uppercase">
                            Category
                          </span>
                          <select
                            value={item.category}
                            onChange={(event) =>
                              updateItem(item.id, {
                                category: event.target.value,
                                order: nextOrder(menu.items, event.target.value),
                              })
                            }
                            className="rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 focus:border-[var(--accent)]"
                          >
                            {menu.categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ImageCropper
        file={cropFile}
        onCancel={() => {
          setCropFile(null);
          setCropTarget(null);
        }}
        onUploaded={(url) => {
          if (cropTarget) updateItem(cropTarget, { image: url });
          setCropFile(null);
          setCropTarget(null);
        }}
      />
    </div>
  );
}
