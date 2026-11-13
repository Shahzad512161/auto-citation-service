"use client";
import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { Btn, Card, Field, inputCls, Modal, Badge } from "../../../components/ui";
import { getSubscription, save, planLimit } from "../../../lib/store";
import { getUser as getAuthUser } from "../../../lib/auth";

const PLANS = [
  { name: "Free Trial", price: 0, listings: 5, desc: "1 Business, 1 Country" },
  { name: "Starter", price: 19, listings: 50, desc: "1 Business, 2 Countries, Custom Add" },
  { name: "Growth", price: 49, listings: 200, desc: "3 Businesses, All Countries, Reports", popular: true },
  { name: "Agency", price: 149, listings: 1000, desc: "20 Businesses, Unlimited, White Label, API" },
  { name: "Pay As You Go", price: 0.2, listings: null, desc: "$0.20 per listing — pay only for what you blast" },
];

export default function SubscriptionPage() {
  const [sub, setSub] = useState(null);
  const [region, setRegion] = useState("USA");
  const [checkout, setCheckout] = useState(null);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { const s = getSubscription(); setSub(s); setRegion(s.region || "USA"); }, []);

  function priceFor(plan) {
    if (plan.name === "Pay As You Go") return 0.2;
    if (region === "UAE" || region === "Saudi Arabia") return Math.round(plan.price * 0.7 * 100) / 100;
    if ((region === "Pakistan" || region === "India") && plan.name === "Growth") {
      // Growth in Pak/India is $19 as specified; auto-renew discount applies on top of the
      // standard price, so the $19 regional price is shown without a further renew discount.
      return 19;
    }
    if (plan.name === "Growth") return sub?.auto_renew ? 49 : 59;
    return plan.price;
  }

  function choose(plan) {
    if (plan.name === "Free Trial") {
      const s = { ...sub, plan: "Free Trial", listings_limit: 5, status: "active" };
      save("cb_subscription", s); setSub(s); setMsg("Free Trial activated.");
      return;
    }
    setCheckout(plan);
  }

  function confirmCheckout(e) {
    e.preventDefault();
    const plan = checkout;
    const s = {
      ...sub,
      plan: plan.name,
      listings_limit: planLimit(plan.name),
      status: "active",
      region,
      stripe_customer_id: "cus_demo_" + Math.random().toString(36).slice(2, 10),
    };
    save("cb_subscription", s); setSub(s); setCheckout(null);
    setMsg(`${plan.name} activated (Stripe simulation — no real charge was made).`);
  }

  if (!sub) return null;
  const limit = planLimit(sub.plan);
  const user = getAuthUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscription / Packages</h1>
      {msg && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{msg}</p>}

      <Card className="flex flex-wrap items-center gap-4 p-5">
        <p className="text-sm"><b>Usage:</b> You have used {sub.listings_used || 0}/{limit} listings {user ? `(linked to ${user.email})` : ""}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Auto Renewal</span>
          <button
            onClick={() => { const s = { ...sub, auto_renew: !sub.auto_renew }; save("cb_subscription", s); setSub(s); }}
            className={`relative h-6 w-11 rounded-full transition ${sub.auto_renew ? "bg-[#0F6FFF]" : "bg-gray-300"}`}
            aria-label="Toggle auto renewal"
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${sub.auto_renew ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm">{sub.auto_renew ? "ON" : "OFF"}</span>
        </div>
        {sub.auto_renew && <Badge tone="green">Auto Renewal ON — 20% discount applied (Growth $49 instead of $59)</Badge>}
        {!sub.auto_renew && <span className="text-sm text-gray-500">Growth without auto-renew: $59/mo, no auto renew.</span>}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium">Pricing region:</span>
          <select className={inputCls} style={{ width: 170 }} value={region} onChange={(e) => { setRegion(e.target.value); save("cb_subscription", { ...sub, region: e.target.value }); }}>
            {["USA", "UAE", "Saudi Arabia", "Pakistan", "India"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <p className="w-full text-xs text-gray-400">Country-wise pricing: USA = list price · UAE/Saudi = 30% off · Pak/India = Growth $19 (as specified).</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PLANS.map((p) => {
          const price = priceFor(p);
          const active = sub.plan === p.name;
          return (
            <Card key={p.name} className={`flex flex-col p-5 ${p.popular ? "border-2 !border-[#0F6FFF] shadow-lg" : ""} ${active ? "ring-2 ring-green-500" : ""}`}>
              {p.popular && <Badge tone="blue" className="mb-2 self-start">Most Popular</Badge>}
              {active && <Badge tone="green" className="mb-2 self-start">Current plan</Badge>}
              <p className="font-bold">{p.name}</p>
              <p className="mt-2 text-3xl font-extrabold">
                {p.name === "Pay As You Go" ? "$0.20" : `$${price}`}
                {p.name !== "Pay As You Go" && <span className="text-sm font-normal text-gray-500">/mo</span>}
              </p>
              <p className="mt-1 text-sm text-gray-500">{p.listings ? `${p.listings} Listings` : "Per listing"}</p>
              <p className="mt-2 flex-1 text-sm text-gray-600">{p.desc}</p>
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                <li className="flex gap-1"><Check size={14} className="text-green-600" /> Auto-fill bookmarklet</li>
                <li className="flex gap-1"><Check size={14} className="text-green-600" /> Reports + CSV/PDF export</li>
              </ul>
              <Btn className="mt-4 w-full" variant={active ? "secondary" : "primary"} disabled={active} onClick={() => choose(p)}>
                {active ? "Current plan" : "Upgrade with Stripe"}
              </Btn>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">“Upgrade with Stripe” here is a Stripe Checkout <b>simulation</b>: it shows a checkout form and activates the plan locally, but takes no real payment. Connect a real Stripe account and replace confirmCheckout with a Checkout Session to charge for real.</p>

      <Card className="overflow-x-auto p-5">
        <h2 className="mb-3 font-bold">Billing (subscriptions table)</h2>
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-gray-500"><th className="py-2">User</th><th className="py-2">Plan</th><th className="py-2">Auto renew</th><th className="py-2">Used / Limit</th><th className="py-2">Stripe customer</th><th className="py-2">Status</th></tr></thead>
          <tbody><tr>
            <td className="py-2">{user?.email || "—"}</td><td className="py-2">{sub.plan}</td><td className="py-2">{sub.auto_renew ? "Yes" : "No"}</td>
            <td className="py-2">{sub.listings_used || 0} / {limit}</td><td className="py-2">{sub.stripe_customer_id || "—"}</td><td className="py-2"><Badge tone="green">{sub.status}</Badge></td>
          </tr></tbody>
        </table>
      </Card>

      <Modal open={!!checkout} onClose={() => setCheckout(null)} title={`Stripe Checkout (simulation) — ${checkout?.name}`}>
        {checkout && (
          <form onSubmit={confirmCheckout} className="space-y-3">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Simulation only — no real charge. Use any test-looking details; nothing is sent anywhere.</p>
            <Field label="Name on card"><input className={inputCls} required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
            <Field label="Card number"><input className={inputCls} required placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry"><input className={inputCls} required placeholder="12/30" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></Field>
              <Field label="CVC"><input className={inputCls} required placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></Field>
            </div>
            <p className="text-sm">Total today: <b>${priceFor(checkout)}{checkout.name === "Pay As You Go" ? " per listing" : "/month"}</b> · Auto renewal {sub.auto_renew ? "ON" : "OFF"}</p>
            <Btn type="submit" className="w-full"><Crown size={16} /> Pay &amp; activate {checkout.name}</Btn>
          </form>
        )}
      </Modal>
    </div>
  );
}
