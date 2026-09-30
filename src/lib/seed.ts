import type { AppData } from "./types";

export function createSeedData(): AppData {
  return {
    portfolio: {
      cash: [
        {
          id: "cash-1",
          name: "Everyday offset",
          balance: 42000,
          owner: "Felix",
        },
      ],
      super: [
        {
          id: "super-1",
          name: "AustralianSuper",
          balance: 186000,
          owner: "Felix",
        },
        {
          id: "super-2",
          name: "REST Super",
          balance: 92000,
          owner: "Kaki",
        },
      ],
      properties: [
        {
          id: "prop-1",
          name: "Footscray home",
          value: 1050000,
          mortgage: 590000,
          owner: "Joint",
        },
        {
          id: "prop-2",
          name: "Brunswick apartment",
          value: 640000,
          mortgage: 410000,
          owner: "Felix",
        },
        {
          id: "prop-3",
          name: "Geelong unit",
          value: 560000,
          mortgage: 195358,
          owner: "Joint",
        },
      ],
      holdings: [
        {
          id: "hold-1",
          ticker: "VAS.AX",
          quantity: 640,
          owner: "Felix",
        },
        {
          id: "hold-2",
          ticker: "VGS.AX",
          quantity: 410,
          owner: "Kaki",
        },
      ],
      otherDebts: [
        {
          id: "debt-1",
          name: "HECS-HELP",
          balance: 24500,
          owner: "Felix",
        },
      ],
    },
    snapshots: [],
    quoteCache: {
      "VAS.AX": {
        price: 101.85,
        asOf: new Date().toISOString(),
        stale: true,
      },
      "VGS.AX": {
        price: 119.6,
        asOf: new Date().toISOString(),
        stale: true,
      },
    },
  };
}
