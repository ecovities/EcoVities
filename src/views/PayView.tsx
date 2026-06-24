import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getContacts, transferEcoPoints } from "../lib/api";
import { InitialAvatar } from "../components/Avatar";
import type { ContactSummary } from "../types";

export function PayView() {
  const { ecoId } = useParams<{ ecoId: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<ContactSummary | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!ecoId) return;
      const all = await getContacts();
      setContact(all.find((c) => c.eco_id === ecoId) ?? null);
    }
    load();
  }, [ecoId]);

  async function handlePay() {
    if (!ecoId || !amount) return;
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      setError("Enter an amount greater than zero");
      return;
    }
    setSubmitting(true);
    setError(null);

    const referenceId = `client-${crypto.randomUUID()}`;
    const result = await transferEcoPoints({
      toEcoId: ecoId,
      amount: numericAmount,
      note: note || undefined,
      referenceId,
    });

    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Payment failed");
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="flex-col flex-1 h-full bg-surface relative flex">
      <div className="px-4 pt-6 pb-4 flex items-center gap-2 bg-surface">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Back"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-medium text-gray-900">Pay</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {contact && (
          <>
            <InitialAvatar name={contact.full_name} size={80} />
            <h2 className="text-2xl font-medium text-gray-900 mt-3">{contact.full_name}</h2>
            <p className="text-gray-500 text-sm">Paying securely with EcoVities</p>
          </>
        )}

        <div className="mt-12 w-full flex items-center justify-center">
          <span className="text-5xl font-medium text-gray-400 mr-2">EP</span>
          <input
            autoFocus
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="text-7xl font-medium text-gray-900 bg-transparent outline-none w-1/2 text-left placeholder-gray-300"
          />
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="mt-8 bg-surface-container text-gray-800 px-6 py-3 rounded-full outline-none w-full max-w-xs text-center text-[15px]"
        />

        {error && (
          <p className="text-error text-[13px] mt-4 px-4 text-center" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-surface to-transparent">
        <button
          onClick={handlePay}
          disabled={submitting || !amount}
          className="w-full bg-primary text-white py-4 rounded-full text-lg font-medium shadow-md hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? "Processing…" : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
