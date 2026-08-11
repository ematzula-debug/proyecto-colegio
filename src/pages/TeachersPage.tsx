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
  createTeacherService,
  deactivateTeacherService,
  getTeachersService,
  updateTeacherService,
} from "@/services/teachers.service";
import type { Teacher, TeacherFormData } from "@/types/teacher";

const initialFormData: TeacherFormData = {
  codigo: "",
  nombres: "",
  apellidos: "",
  telefono: "",
  correo: "",
};

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialTeachers() {
      try {
        const data = await getTeachersService();

        if (active) {
          setTeachers(data);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar profesores.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialTeachers();

    return () => {
      active = false;
    };
  }, []);

  async function reloadTeachers() {
    const data = await getTeachersService();
    setTeachers(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingTeacher(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(teacher: Teacher) {
    setEditingTeacher(teacher);
    setError("");
    setSuccessMessage("");

    setFormData({
      codigo: teacher.codigo,
      nombres: teacher.nombres,
      apellidos: teacher.apellidos,
      telefono: teacher.telefono || "",
      correo: teacher.correo || "",
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

      if (editingTeacher) {
        await updateTeacherService(editingTeacher.id, formData);
        setSuccessMessage("Profesor actualizado correctamente.");
      } else {
        await createTeacherService(formData);
        setSuccessMessage("Profesor registrado correctamente.");
      }

      await reloadTeachers();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar profesor.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(teacher: Teacher) {
    const confirmed = window.confirm(
      `¿Deseas desactivar a ${teacher.nombres} ${teacher.apellidos}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateTeacherService(teacher.id);
      setSuccessMessage("Profesor desactivado correctamente.");
      await reloadTeachers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al desactivar profesor.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Profesores/Director(a)
          </h2>
          <p className="text-muted-foreground">
            Administración de docentes y personal académico del colegio.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo profesor
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
          <CardTitle>Listado de profesores</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de profesores registrados.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando profesores...
            </p>
          ) : teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay profesores registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre completo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.codigo}
                      </TableCell>

                      <TableCell>
                        {teacher.nombres} {teacher.apellidos}
                      </TableCell>

                      <TableCell>{teacher.telefono || "-"}</TableCell>

                      <TableCell>{teacher.correo || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            teacher.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {teacher.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(teacher)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(teacher)}
                          disabled={teacher.estado !== "ACTIVO"}
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
              {editingTeacher ? "Editar profesor" : "Registrar profesor"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos solicitados para guardar el registro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="P-001"
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
                  placeholder="María Fernanda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="García López"
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
                  placeholder="profesor@colegio.com"
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
