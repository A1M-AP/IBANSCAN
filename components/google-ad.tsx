"use client";
import { useEffect, useRef, useState } from "react";
import { hasAdConsent, type TcfConsent } from "@/lib/advertising";
type AdWindow = Window & {
  __tcfapi?: (
    command: string,
    version: number,
    callback: (data: TcfConsent, success: boolean) => void,
    parameter?: number,
  ) => void;
  adsbygoogle?: object[];
};
export function GoogleAd({
  client,
  slot,
  placeholder,
}: {
  client: string;
  slot: string;
  placeholder: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);
  const element = useRef<HTMLModElement>(null);
  useEffect(() => {
    const win = window as AdWindow;
    let listener: number | undefined;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const listen = () => {
      if (!active) return;
      if (win.__tcfapi) {
        win.__tcfapi("addEventListener", 2, (data, ok) => {
          listener = data?.listenerId;
          if (active) setAllowed(ok && hasAdConsent(data));
        });
      } else if (++attempts < 120) timer = setTimeout(listen, 500);
    };
    listen();
    return () => {
      active = false;
      clearTimeout(timer);
      if (listener !== undefined)
        win.__tcfapi?.("removeEventListener", 2, () => {}, listener);
    };
  }, []);
  useEffect(() => {
    if (!allowed || !element.current) return;
    const win = window as AdWindow;
    let active = true;
    const load = () => {
      if (active && element.current && !element.current.dataset.requested) {
        element.current.dataset.requested = "true";
        try {
          (win.adsbygoogle = win.adsbygoogle || []).push({});
        } catch {}
      }
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-ibanscan-ads]",
    );
    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.ibanscanAds = "true";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
        client;
      script.addEventListener("load", () => {
        script!.dataset.loaded = "true";
        load();
      });
      document.head.append(script);
    } else if (script.dataset.loaded === "true") load();
    else script.addEventListener("load", load);
    return () => {
      active = false;
      script?.removeEventListener("load", load);
    };
  }, [allowed, client, slot]);
  return allowed ? (
    <ins
      ref={element}
      className="adsbygoogle"
      style={{ display: "block", minHeight: 130 }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  ) : (
    <>{placeholder}</>
  );
}
