import { describe, expect, it } from "vitest";
import { tipoSociedadToLabel } from "./utils";

describe("tipoSociedadToLabel", () => {
  it("devuelve guion si no hay tipo", () => {
    expect(tipoSociedadToLabel(null)).toBe("—");
    expect(tipoSociedadToLabel("")).toBe("—");
  });

  it("reconoce los tipos societarios conocidos", () => {
    expect(tipoSociedadToLabel("SRL")).toBe("SRL");
    expect(tipoSociedadToLabel("Sociedad de Responsabilidad Limitada")).toBe("SRL");
    expect(tipoSociedadToLabel("SAS")).toBe("SAS");
    expect(tipoSociedadToLabel("Sociedad Anónima")).toBe("SA");
    expect(tipoSociedadToLabel("Sociedad Civil")).toBe("SCivil");
  });

  it("trunca a 6 caracteres los tipos desconocidos", () => {
    expect(tipoSociedadToLabel("Fideicomiso")).toBe("Fideic");
    expect(tipoSociedadToLabel("UTE")).toBe("UTE");
  });
});
