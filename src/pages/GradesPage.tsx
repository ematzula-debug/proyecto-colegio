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
import {
  createGradeService,
  deactivateGradeService,
  getGradesService,
  updateGradeService,
} from "@/services/grades.service";
import type { Grade, GradeFormData } from "@/types/grade";

const initialFormData: GradeFormData = {
  nombre: "",
  nivel: "",
};

export function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<GradeFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialGrades() {
      try {
        const data = await getGradesService();

        if (active) {
          setGrades(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Error al cargar grados.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialGrades();

    return () => {
      active = false;
    };
  }, []);

  async function reloadGrades() {
    const data = await getGradesService();
    setGrades(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingGrade(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(grade: Grade) {
    setEditingGrade(grade);
    setError("");
    setSuccessMessage("");

    setFormData({
      nombre: grade.nombre,
      nivel: grade.nivel || "",
    });

    setOpenDialog(true);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
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

      if (editingGrade) {
        await updateGradeService(editingGrade.id, formData);
        setSuccessMessage("Grado actualizado correctamente.");
      } else {
        await createGradeService(formData);
        setSuccessMessage("Grado registrado correctamente.");
      }

      await reloadGrades();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar grado.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(grade: Grade) {
    const confirmed = window.confirm(
      `¿Deseas desactivar el grado ${grade.nombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateGradeService(grade.id);
      setSuccessMessage("Grado desactivado correctamente.");
      await reloadGrades();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al desactivar grado.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grados</h2>
          <p className="text-muted-foreground">
            Administración de grados académicos del colegio.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo grado
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
          <CardTitle>Listado de grados</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de grados registrados.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando grados...</p>
          ) : grades.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay grados registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">
                        {grade.nombre}
                      </TableCell>

                      <TableCell>{grade.nivel || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            grade.estado === "ACTIVO" ? "default" : "secondary"
                          }
                        >
                          {grade.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(grade)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(grade)}
                          disabled={grade.estado !== "ACTIVO"}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGrade ? "Editar grado" : "Registrar grado"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos solicitados para guardar el registro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del grado</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Primero Básico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel</Label>
              <Input
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                placeholder="Básico, Diversificado, Primaria"
              />
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
