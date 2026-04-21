"use client";

interface PricingTierProps {
    name: string;
    price: string;
    copy: string;
}

export function PricingTier({ name, price, copy }: PricingTierProps) {
    return (
        <div className="border border-rule p-8 flex flex-col gap-4">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60">TIER</div>
            <h3 className="font-serif text-h2 font-bold leading-tight">{name}</h3>
            <div className="font-mono text-small opacity-80">{price}</div>
            <p className="text-body opacity-80 leading-relaxed">{copy}</p>
        </div>
    );
}
