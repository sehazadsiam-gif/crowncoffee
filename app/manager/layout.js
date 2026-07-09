// Manager portal layout — no site header/footer, standalone app shell.
// The root layout wraps everything including BasketProvider, which we still
// want available here, so we just override the visual chrome only.

export default function ManagerLayout({ children }) {
  return children;
}
