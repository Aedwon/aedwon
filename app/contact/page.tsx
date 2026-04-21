"use client";

import { useTheme } from "@/components/ThemeContext";
import { Send, ChevronDown, Calendar, Mail } from "lucide-react";
import { StateLabel } from "@/components/StateLabel";
import { SectionMarker } from "@/components/SectionMarker";
import { CONTACT } from "@/lib/portfolio";

export default function ContactPage() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <main className="bg-paper text-ink min-h-screen">
                <div className="max-w-3xl mx-auto px-6 py-16 md:px-12 md:py-24 lg:px-24">
                    <div className="mb-12">
                        <StateLabel />
                        <h1 className="mt-6 font-serif text-h1 md:text-display font-bold tracking-tight leading-[1.05]">
                            {CONTACT.title}
                        </h1>
                        <p className="mt-6 text-body opacity-80 max-w-xl">
                            {CONTACT.subtitle}
                        </p>
                    </div>

                    {/* § 01 — BOOK A CALL */}
                    <section className="py-10 border-t border-rule">
                        <SectionMarker number="01" label="BOOK A CALL" />
                        <p className="font-serif text-h3 leading-snug mb-6">
                            {CONTACT.call.headline}
                        </p>
                        <a
                            href={CONTACT.calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-accent text-paper px-6 py-3 font-sans text-body hover:opacity-90 transition-opacity"
                        >
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                            {CONTACT.call.button} →
                        </a>
                    </section>

                    {/* § 02 — OR WRITE IT OUT */}
                    <section className="py-10 border-t border-rule">
                        <SectionMarker number="02" label="OR WRITE IT OUT" />
                        <p className="text-body opacity-80 mb-8">
                            {CONTACT.form.helper}
                        </p>

                        <form className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <label className="flex flex-col gap-2">
                                    <span className="font-mono text-micro tracking-widest uppercase opacity-70">{CONTACT.form.nameLabel}</span>
                                    <input
                                        type="text"
                                        className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none transition-colors"
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="font-mono text-micro tracking-widest uppercase opacity-70">{CONTACT.form.emailLabel}</span>
                                    <input
                                        type="email"
                                        placeholder="you@domain.com"
                                        className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none placeholder:opacity-30 transition-colors"
                                    />
                                </label>
                            </div>

                            <label className="flex flex-col gap-2">
                                <span className="font-mono text-micro tracking-widest uppercase opacity-70">{CONTACT.form.projectLabel}</span>
                                <div className="relative">
                                    <select className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none appearance-none cursor-pointer transition-colors">
                                        {CONTACT.form.projectOptions.map((opt) => (
                                            <option key={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="font-mono text-micro tracking-widest uppercase opacity-70">{CONTACT.form.goalLabel}</span>
                                <textarea
                                    rows={5}
                                    placeholder={CONTACT.form.goalPlaceholder}
                                    aria-describedby="reply-time-note"
                                    className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none resize-none placeholder:opacity-30 transition-colors"
                                />
                                <span id="reply-time-note" className="text-micro opacity-60 mt-1">{CONTACT.replyPromise}</span>
                            </label>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 text-body font-medium hover:text-accent transition-colors"
                                >
                                    {CONTACT.form.submit} <Send className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* § 03 — OR JUST EMAIL */}
                    <section className="py-10 border-t border-rule">
                        <SectionMarker number="03" label="OR JUST EMAIL" />
                        <p className="text-body opacity-80">
                            {CONTACT.emailSection.prefix}{" "}
                            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1 underline underline-offset-4 decoration-rule hover:decoration-ink hover:text-accent transition-colors">
                                <Mail className="w-4 h-4" aria-hidden="true" /> {CONTACT.email}
                            </a>
                            . {CONTACT.emailSection.suffix}
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className={`
            flex items-center justify-center px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-24 bg-background transition-colors duration-300
            ${theme === 'discord' ? 'min-h-full items-start pt-10' : 'min-h-screen'}
        `}>

            <div className={`
                w-full max-w-2xl
                ${theme === 'discord' ? 'mt-4' : ''}
            `}>

                <div className="mb-8 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme === 'discord' ? 'bg-[#3ba55c]' : 'bg-green-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${theme === 'discord' ? 'bg-[#3ba55c]' : 'bg-green-500'}`}></span>
                    </div>
                    <span className={`text-sm font-bold tracking-wide uppercase opacity-70 ${theme === 'discord' ? 'text-gray-400' : ''}`}>Currently Accepting New Clients</span>
                </div>

                {theme === 'discord' ? (
                    <div className="mb-10">
                        <div className="w-16 h-16 bg-[#40444b] rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl text-gray-200">#</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to #start-a-project!</h1>
                        <p className="text-[#b9bbbe]">{CONTACT.subtitle}</p>
                    </div>
                ) : (
                    <div className="mb-10">
                        <h1 className="text-5xl md:text-7xl font-bold font-theme tracking-tight mb-4">
                            {CONTACT.title}
                        </h1>
                        <p className="text-lg opacity-80 max-w-xl">
                            {CONTACT.subtitle}
                        </p>
                    </div>
                )}

                {/* Door 1 — Book a call */}
                <section className={`
                    mb-6 p-6 flex flex-col gap-4
                    ${theme === 'neubrutalist' ? 'bg-accent text-black border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                    ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-accent' : ''}
                `}>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'discord' ? 'text-accent' : ''}`}>
                            {CONTACT.call.label}
                        </span>
                    </div>
                    <p className={`text-base md:text-lg font-theme leading-snug ${theme === 'discord' ? 'text-gray-200' : ''}`}>
                        {CONTACT.call.headline}
                    </p>
                    <a
                        href={CONTACT.calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            self-start inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all
                            ${theme === 'neubrutalist' ? 'bg-black text-white hover:opacity-80' : ''}
                            ${theme === 'discord' ? 'bg-accent text-white hover:bg-accent/90 rounded-md' : ''}
                        `}
                    >
                        {CONTACT.call.button} →
                    </a>
                </section>

                {/* Door 2 — Write it out */}
                <section className={`
                    mb-6 p-6
                    ${theme === 'neubrutalist' ? 'bg-white border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                    ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg' : ''}
                `}>
                    <div className="flex items-center gap-2 mb-3">
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'discord' ? 'text-accent' : ''}`}>
                            {CONTACT.form.label}
                        </span>
                    </div>
                    <p className={`text-sm mb-6 opacity-80 ${theme === 'discord' ? 'text-[#b9bbbe]' : ''}`}>
                        {CONTACT.form.helper}
                    </p>

                    <form className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'discord' ? 'text-[#b9bbbe]' : 'opacity-70'}`}>{CONTACT.form.nameLabel}</label>
                                <input
                                    type="text"
                                    placeholder={theme === 'discord' ? "username#0000" : "John Doe"}
                                    className={`
                                        w-full p-3 outline-none transition-all text-sm
                                        ${theme === 'neubrutalist' ? 'bg-white border-2 border-black focus:border-accent' : ''}
                                        ${theme === 'discord' ? 'bg-[#40444b] rounded-md text-gray-200 placeholder:text-gray-500' : ''}
                                    `}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'discord' ? 'text-[#b9bbbe]' : 'opacity-70'}`}>{CONTACT.form.emailLabel}</label>
                                <input
                                    type="email"
                                    placeholder="you@domain.com"
                                    className={`
                                        w-full p-3 outline-none transition-all text-sm
                                        ${theme === 'neubrutalist' ? 'bg-white border-2 border-black focus:border-accent' : ''}
                                        ${theme === 'discord' ? 'bg-[#40444b] rounded-md text-gray-200 placeholder:text-gray-500' : ''}
                                    `}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'discord' ? 'text-[#b9bbbe]' : 'opacity-70'}`}>{CONTACT.form.projectLabel}</label>
                            <div className="relative">
                                <select className={`
                                    w-full p-3 appearance-none outline-none cursor-pointer text-sm
                                    ${theme === 'neubrutalist' ? 'bg-white border-2 border-black focus:border-accent' : ''}
                                    ${theme === 'discord' ? 'bg-[#40444b] rounded-md text-gray-200' : ''}
                                `}>
                                    {CONTACT.form.projectOptions.map((opt) => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className={`text-xs font-bold uppercase tracking-wider ${theme === 'discord' ? 'text-[#b9bbbe]' : 'opacity-70'}`}>{CONTACT.form.goalLabel}</label>
                            <textarea
                                rows={4}
                                placeholder={CONTACT.form.goalPlaceholder}
                                aria-describedby="reply-time-note"
                                className={`
                                    w-full p-3 outline-none transition-all resize-none text-sm
                                    ${theme === 'neubrutalist' ? 'bg-white border-2 border-black focus:border-accent' : ''}
                                    ${theme === 'discord' ? 'bg-[#40444b] rounded-md text-gray-200 placeholder:text-gray-500' : ''}
                                `}
                            />
                            <span id="reply-time-note" className={`text-xs mt-1 ${theme === 'discord' ? 'text-[#b9bbbe]' : 'opacity-60'}`}>{CONTACT.replyPromise}</span>
                        </div>

                        <div className="mt-2">
                            <button type="submit" className={`
                                inline-flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all
                                ${theme === 'neubrutalist' ? 'bg-accent text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]' : ''}
                                ${theme === 'discord' ? 'bg-accent hover:opacity-90 text-white rounded-md' : ''}
                            `}>
                                {CONTACT.form.submit} <Send className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                    </form>
                </section>

                {/* Door 3 — Just email */}
                <section className={`
                    p-6 flex flex-col gap-2
                    ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
                    ${theme === 'discord' ? 'bg-[#2f3136] rounded-lg border-l-4 border-l-[#57F287]' : ''}
                `}>
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'discord' ? 'text-[#57F287]' : ''}`}>
                            {CONTACT.emailSection.label}
                        </span>
                    </div>
                    <p className={`text-sm ${theme === 'neubrutalist' ? 'text-black' : theme === 'discord' ? 'text-gray-300' : 'opacity-80'}`}>
                        {CONTACT.emailSection.prefix}{" "}
                        <a
                            href={`mailto:${CONTACT.email}`}
                            className={`
                                inline-flex items-center gap-1 font-medium underline underline-offset-4 transition-colors
                                ${theme === 'neubrutalist' ? 'text-black hover:text-accent' : ''}
                                ${theme === 'discord' ? 'text-accent hover:text-accent/80' : ''}
                            `}
                        >
                            {CONTACT.email}
                        </a>
                        . {CONTACT.emailSection.suffix}
                    </p>
                </section>

            </div>
        </main>
    );
}
