import { useEffect, useState } from "react";

export type PaymentMethodKey = "tapToPay" | "cardManual" | "ach" | "cash";

type UniversellPaymentConfig = Record<PaymentMethodKey, { enabled: boolean }>;

type ConfiguredState = Record<PaymentMethodKey, boolean>;

type PaymentMethodState = {
  enabled: boolean;
  configured: boolean;
};

const PAYMENT_METHODS_STORAGE_KEY = "paymentMethodsConfigured";

// Universell configuration (enabled/disabled)
const UNIVERSSELL_PAYMENT_METHODS: UniversellPaymentConfig = {
  tapToPay: { enabled: true },
  cardManual: { enabled: true },
  ach: { enabled: true },
  cash: { enabled: true },
};

// Local setup state (configured in Service Pro)
const DEFAULT_CONFIGURED: ConfiguredState = {
  tapToPay: false,
  cardManual: false,
  ach: false,
  cash: false,
};

const readConfiguredState = (): ConfiguredState => {
  try {
    const stored = localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as Partial<ConfiguredState>) : {};

    const migratedAchConfigured = localStorage.getItem("achConfigured");
    const achConfigured = migratedAchConfigured === "true";

    return {
      tapToPay: parsed.tapToPay ?? DEFAULT_CONFIGURED.tapToPay,
      cardManual: parsed.cardManual ?? DEFAULT_CONFIGURED.cardManual,
      ach: parsed.ach ?? (achConfigured || DEFAULT_CONFIGURED.ach),
      cash: parsed.cash ?? DEFAULT_CONFIGURED.cash,
    };
  } catch (error) {
    console.error("Error reading payment method configuration:", error);
    return DEFAULT_CONFIGURED;
  }
};

export const usePaymentConfiguration = () => {
  const [configuredState, setConfiguredState] = useState<ConfiguredState>(DEFAULT_CONFIGURED);

  useEffect(() => {
    setConfiguredState(readConfiguredState());
  }, []);

  const persistConfiguredState = (next: ConfiguredState) => {
    localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(next));
    if (next.ach !== undefined) {
      localStorage.setItem("achConfigured", String(next.ach));
    }
  };

  const setMethodConfigured = (methodKey: PaymentMethodKey, configured: boolean) => {
    setConfiguredState((prev) => {
      const next = { ...prev, [methodKey]: configured } as ConfiguredState;
      persistConfiguredState(next);
      return next;
    });
  };

  const getMethodState = (methodKey: PaymentMethodKey): PaymentMethodState => {
    const enabled = UNIVERSSELL_PAYMENT_METHODS[methodKey]?.enabled ?? false;

    return {
      enabled,
      configured: configuredState[methodKey],
    };
  };

  return {
    universellConfig: UNIVERSSELL_PAYMENT_METHODS,
    configuredState,
    setMethodConfigured,
    getMethodState,
  };
};
