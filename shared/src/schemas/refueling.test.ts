import { describe, expect, it } from "vitest";
import {createRefuelingSchema} from "./refueling";

describe("createRefuelingSchema", () => {

  describe("happy path", () => {
    it("parses correctly", () => {
      const parsed = createRefuelingSchema.parse({
        date: "2024-01-01",
        liters: 50,
        totalPrice: 100,
        mileage: 15000,
        station: "Shell",
      });

      expect(parsed).toBeDefined();
    });
  });

});
