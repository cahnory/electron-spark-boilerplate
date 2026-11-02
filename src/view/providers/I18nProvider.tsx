import { useEffect, type ReactNode } from "react";
import { IntlProvider } from "react-intl";

import { type Settings, settings } from "../../preload/settings";
import { en } from "../messages/en";
import { fr } from "../messages/fr";
import { useIpcState } from "./useIpcState";

const messages = { en, fr } satisfies Record<Settings["locale"], Record<keyof typeof en, string>>;

export const I18nProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const { value: locale, failed, retry } = useIpcState(settings.state, (state) => state.locale);

  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  if (!locale) {
    return (
      <div role={failed ? "alert" : "status"}>
        {failed ? "Unable to load language settings. Retrying…" : "Loading…"}
        {failed && <button onClick={retry}>Retry now</button>}
      </div>
    );
  }

  return (
    <IntlProvider locale={locale} defaultLocale="en" messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
};
