import {
  LayoutDashboard,
  Target,
  Repeat,
  CreditCard,
  Home,
  CalendarDays,
  Wallet,
  MousePointerClick,
  Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface UserGuideModalProps {
  open: boolean;
  onClose: () => void;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient shadow-glow-sm">
          <Icon size={15} className="text-white" />
        </div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      <div className="space-y-1.5 pl-9 text-sm leading-relaxed text-slate-300">
        {children}
      </div>
    </section>
  );
}

export function UserGuideModal({ open, onClose }: UserGuideModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="User Guide — How to use this app"
      footer={<Button onClick={onClose}>Got it</Button>}
    >
      <div className="space-y-6">
        <p className="text-sm leading-relaxed text-slate-300">
          Welcome to <span className="font-semibold text-white">Raj's Tracker</span>{" "}
          — your personal & family expense command center. Yahaan har feature ka
          short guide hai. Saara data sirf aapke browser me save hota hai.
        </p>

        <Section icon={LayoutDashboard} title="Dashboard">
          <p>
            Top par 6 metric cards: Total Monthly Income, Total Expenses,
            Savings, Credit Card Balances, Mortgage + Utilities, aur Remaining
            Monthly Budget. Numbers automatically calculate hote hain.
          </p>
          <p>
            Neeche charts: <b>Spending by Category</b> (donut),{" "}
            <b>Income vs Expenses</b> (6-month trend), <b>Top Spending Areas</b>,{" "}
            <b>By Person / Sub-category</b> (Car Payment ka Raj vs Sharan split
            etc.), aur <b>Budget Alerts</b>.
          </p>
        </Section>

        <Section icon={MousePointerClick} title="Editable cards (clickable)">
          <p>Har metric card click karne par uska editor khulta hai:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Total Monthly Income</b> → Manage Income (add/edit/delete income sources)</li>
            <li><b>Total Expenses</b> & <b>Mortgage + Utilities</b> → Add Expense</li>
            <li><b>Savings</b> → Income editor (savings = income − expenses)</li>
            <li><b>Credit Card Balances</b> → Credit Cards tab</li>
            <li><b>Remaining Monthly Budget</b> → Monthly Budget tab</li>
          </ul>
        </Section>

        <Section icon={Wallet} title="Add Expense (top-right button)">
          <p>
            Kisi bhi screen par upar-daayein "Add Expense" button se kharcha log
            karein: amount, date, category, aur (agar ho to) sub-category jaise
            Car Payment → Raj/Sharan. Description optional hai.
          </p>
        </Section>

        <Section icon={Target} title="Monthly Budget">
          <p>
            Har category ke liye monthly cap set karein. Progress bar Budgeted vs
            Actual dikhata hai — 90% par amber, 100% se upar red ho jaata hai.
            "Set Budget" se naya cap daalein ya existing update karein.
          </p>
        </Section>

        <Section icon={Repeat} title="Recurring Bills">
          <p>
            Fixed monthly bills (Electricity, Water, Internet, Subscriptions)
            track karein. Bill ke checkbox par click karte hi wo us mahine ke
            expenses me automatically log ho jaata hai (un-check karne par hata
            bhi jaata hai). Upar Paid vs Still Due ka total dikhta hai.
          </p>
        </Section>

        <Section icon={CreditCard} title="Credit Cards">
          <p>
            Har card alag track karein: Name, Current Balance, Credit Limit, Due
            Day, Last 4 digits, aur <b>Owner</b> (Raj / Sharan / Joint). Card par
            utilization bar aur available credit dikhta hai. Edit/Delete buttons
            har card par hain.
          </p>
        </Section>

        <Section icon={Home} title="Home Expenses">
          <p>
            Naye ghar ke capital kharche teen panels me: <b>Renovations</b>,{" "}
            <b>Furniture & Decor</b>, <b>General Structural Repairs</b>. Har panel
            ke "+" se item add karein; upar total invested dikhta hai.
          </p>
        </Section>

        <Section icon={CalendarDays} title="Annual Expenses">
          <p>
            Saal me ek baar aane wale bade kharche (Property Tax, Vacation,
            Insurance renewal). App har expense ka <b>monthly saving target</b>{" "}
            (amount ÷ 12) khud nikaal deta hai taaki time aane par paisa ready
            ho.
          </p>
        </Section>

        <Section icon={Database} title="Your data">
          <p>
            Sab kuch <b>browser ki localStorage</b> me save hota hai — internet
            ya login ki zaroorat nahi. Pehli baar sample data bhara hota hai;
            usse edit/delete karke apna actual data daal sakte hain. Browser data
            clear karne par sab reset ho jaayega.
          </p>
        </Section>
      </div>
    </Modal>
  );
}
