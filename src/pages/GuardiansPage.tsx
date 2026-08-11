import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createGuardianService,
  deactivateGuardianService,
  getGuardiansService,
  updateGuardianService,
} from "@/services/guardians.service";
import type { Guardian, GuardianFormData } from "@/types/guardian";

const initialFormData: GuardianFormData = {
  dpi: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  direccion: "",
  correo: "",
};

export function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [formData, setFormData] = useState<GuardianFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialGuardians() {
      try {
        const data = await getGuardiansService();

        if (active) {
          setGuardians(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar encargados.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialGuardians();

    return () => {
      active = false;
    };
  }, []);

  async function reloadGuardians() {
    const data = await getGuardiansService();
    setGuardians(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingGuardian(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(guardian: Guardian) {
    setEditingGuardian(guardian);
    setError("");
    setSuccessMessage("");

    setFormData({
      dpi: guardian.dpi || "",
      nombres: guardian.nombres,
      apellidos: guardian.apellidos,
      telefono: guardian.telefono || "",
      direccion: guardian.direccion || "",
      correo: guardian.correo || "",
    });

    setOpenDialog(true);
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingGuardian) {
        await updateGuardianService(editingGuardian.id, formData);
        setSuccessMessage("Encargado actualizado correctamente.");
      } else {
        await createGuardianService(formData);
        setSuccessMessage("Encargado registrado correctamente.");
      }

      await reloadGuardians();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar encargado.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(guardian: Guardian) {
    const confirmed = window.confirm(
      `¿Deseas desactivar a ${guardian.nombres} ${guardian.apellidos}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateGuardianService(guardian.id);
      setSuccessMessage("Encargado desactivado correctamente.");
      await reloadGuardians();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al desactivar encargado.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Padres/Encargados
          </h2>
          <p className="text-muted-foreground">
            Registro y administración de padres de familia o encargados.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo encargado
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado de encargados</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de padres o encargados
            registrados.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando encargados...
            </p>
          ) : guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay encargados registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DPI</TableHead>
                    <TableHead>Nombre completo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {guardians.map((guardian) => (
                    <TableRow key={guardian.id}>
                      <TableCell className="font-medium">
                        {guardian.dpi || "-"}
                      </TableCell>

                      <TableCell>
                        {guardian.nombres} {guardian.apellidos}
                      </TableCell>

                      <TableCell>{guardian.telefono || "-"}</TableCell>

                      <TableCell>{guardian.correo || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            guardian.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {guardian.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(guardian)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(guardian)}
                          disabled={guardian.estado !== "ACTIVO"}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Desactivar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGuardian ? "Editar encargado" : "Registrar encargado"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos solicitados para guardar el registro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dpi">DPI</Label>
                <Input
                  id="dpi"
                  name="dpi"
                  value={formData.dpi}
                  onChange={handleChange}
                  placeholder="0000 00000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="5555-5555"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Carlos Antonio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Pérez López"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="encargado@correo.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección del encargado"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
