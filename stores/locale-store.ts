import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import i18n, { setLocale as setI18nLocale } from '@/lib/i18n';

type Locale = 'en' | 'ar';

interface LocaleState {
  locale: Locale;
  isRTL: boolean;
}

interface LocaleActions {
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useLocaleStore = create<LocaleState & LocaleActions>()(
  persist(
    (set, get) => ({
      locale: 'ar',
      isRTL: true,

      setLocale: (locale: Locale) => {
        const isRTL = locale === 'ar';

        // Update i18n
        setI18nLocale(locale);

        // Update store
        set({ locale, isRTL });

        // Note: RTL changes require app restart
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }
      },

      toggleLocale: () => {
        const currentLocale = get().locale;
        const newLocale = currentLocale === 'ar' ? 'en' : 'ar';
        get().setLocale(newLocale);
      },
    }),
    {
      name: 'washman-locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Sync i18n with stored locale on app start
        if (state?.locale) {
          i18n.locale = state.locale;
        }
      },
    }
  )
);

// Selector helpers
export const selectLocale = (state: LocaleState) => state.locale;
export const selectIsRTL = (state: LocaleState) => state.isRTL;
