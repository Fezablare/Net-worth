import type { AppData } from "./types";

export function createSeedData(): AppData {
  return {
    portfolio: {
      cash: [
        {
          id: "cash-1",
          name: "Everyday offset",
          balance: 28500,
          ownershipPercent: 100,
        },
        {
          id: "cash-2",
          name: "Emergency savings",
          balance: 42000,
          ownershipPercent: 100,
        },
      ],
      super: [
        {
          id: "super-1",
          name: "AustralianSuper",
          balance: 198400,
          ownershipPercent: 100,
        },
        {
          id: "super-2",
          name: "REST Super",
          balance: 67200,
          ownershipPercent: 100,
        },
      ],
      properties: [
        {
          id: "prop-1",
          name: "Brunswick apartment",
          value: 720000,
          mortgage: 410000,
          ownershipPercent: 50,
        },
        {
          id: "prop-2",
          name: "Geelong investment unit",
          value: 485000,
          mortgage: 312000,
          ownershipPercent: 100,
        },
        {
          id: "prop-3",
          name: "Family home — Footscray",
          value: 1150000,
          mortgage: 680000,
          ownershipPercent: 100,
        },
      ],
      holdings: [
        {
          id: "hold-1",
          ticker: "VAS.AX",
          quantity: 420,
          ownershipPercent: 100,
        },
        {
          id: "hold-2",
          ticker: "VGS.AX",
          quantity: 180,
          ownershipPercent: 100,
        },
      ],
      otherDebts: [
        {
          id: "debt-1",
          name: "HECS-HELP",
          balance: 18400,
          ownershipPercent: 100,
        },
      ],
    },
    snapshots: [],
    quoteCache: {
      "VAS.AX": {
        price: 98.42,
        asOf: new Date().toISOString(),
        stale: true,
      },
      "VGS.AX": {
        price: 112.15,
        asOf: new Date().toISOString(),
        stale: true,
      },
    },
  };
}
