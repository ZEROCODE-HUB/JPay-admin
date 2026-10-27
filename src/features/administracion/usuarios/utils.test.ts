import { describe, expect, it } from "vitest";
import { estadoAdminTone } from "./estados";
import { estadoAdminLabel, nuevoAdminUser } from "./utils";

describe("administración de personal", () => {
  const base = {
    nombre: " Ana ",
    email: " a@x.com ",
    legajo: " L1 ",
    password: " p ",
    rolId: "r1",
  };

  it("nuevoAdminUser recorta campos y conserva la contraseña tal cual", () => {
    expect(nuevoAdminUser(base)).toEqual({
      nombre: "Ana",
      email: "a@x.com",
      legajo: "L1",
      password: " p ",
      rolId: "r1",
    });
  });

  it("nuevoAdminUser exige nombre, email, contraseña y rol", () => {
    expect(nuevoAdminUser({ ...base, nombre: " " })).toBeNull();
    expect(nuevoAdminUser({ ...base, email: "" })).toBeNull();
    expect(nuevoAdminUser({ ...base, password: "  " })).toBeNull();
    expect(nuevoAdminUser({ ...base, rolId: "" })).toBeNull();
    expect(nuevoAdminUser({ ...base, legajo: "" })).not.toBeNull();
  });

  it("estado activo/inactivo", () => {
    expect(estadoAdminLabel(true)).toBe("Activo");
    expect(estadoAdminLabel(false)).toBe("Inactivo");
    expect(estadoAdminTone(true)).toBe("success");
    expect(estadoAdminTone(false)).toBe("neutral");
  });
});
