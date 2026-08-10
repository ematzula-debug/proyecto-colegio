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
  createStudentService,
  deactivateStudentService,
  getStudentsService,
  updateStudentService,
} from "@/services/students.service";
import type { Student, StudentFormData } from "@/types/student";

const initialFormData: StudentFormData = {
  codigo: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  direccion: "",
  telefono: "",
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentsService();
      setStudents(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al cargar alumnos.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    getStudentsService()
      .then((data) => {
        if (cancelled) return;

        setStudents(data);
        setError("");
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setError(
          error instanceof Error ? error.message : "Error al cargar alumnos.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setFormData(initialFormData);
    setEditingStudent(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(student: Student) {
    setEditingStudent(student);
    setError("");
    setSuccessMessage("");

    setFormData({
      codigo: student.codigo,
      nombres: student.nombres,
      apellidos: student.apellidos,
      fechaNacimiento: student.fechaNacimiento
        ? student.fechaNacimiento.slice(0, 10)
        : "",
      direccion: student.direccion || "",
      telefono: student.telefono || "",
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

      if (editingStudent) {
        await updateStudentService(editingStudent.id, formData);
        setSuccessMessage("Alumno actualizado correctamente.");
      } else {
        await createStudentService(formData);
        setSuccessMessage("Alumno registrado correctamente.");
      }

      await loadStudents();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al guardar alumno.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(student: Student) {
    const confirmed = window.confirm(
      `¿Deseas desactivar al alumno ${student.nombres} ${student.apellidos}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateStudentService(student.id);
      setSuccessMessage("Alumno desactivado correctamente.");
      await loadStudents();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al desactivar alumno.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alumnos</h2>
          <p className="text-muted-foreground">
            Administración de alumnos registrados en el colegio.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo alumno
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
          <CardTitle>Listado de alumnos</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de alumnos registrados.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando alumnos...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay alumnos registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre completo</TableHead>
                    <TableHead>Fecha nacimiento</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.codigo}
                      </TableCell>
                      <TableCell>
                        {student.nombres} {student.apellidos}
                      </TableCell>
                      <TableCell>
                        {student.fechaNacimiento
                          ? student.fechaNacimiento.slice(0, 10)
                          : "-"}
                      </TableCell>
                      <TableCell>{student.telefono || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {student.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(student)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(student)}
                          disabled={student.estado !== "ACTIVO"}
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
              {editingStudent ? "Editar alumno" : "Registrar alumno"}
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
                  placeholder="A-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Juan Carlos"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección del alumno"
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
