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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getGradesService } from "@/services/grades.service";
import {
  createSubjectService,
  deactivateSubjectService,
  getSubjectsService,
  updateSubjectService,
} from "@/services/subjects.service";
import type { Grade } from "@/types/grade";
import type { Subject, SubjectFormData } from "@/types/subject";

const initialFormData: SubjectFormData = {
  codigo: "",
  nombre: "",
  gradoId: "",
};

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [subjectsData, gradesData] = await Promise.all([
          getSubjectsService(),
          getGradesService(),
        ]);

        if (active) {
          setSubjects(subjectsData);
          setGrades(gradesData);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar asignaturas.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  async function reloadSubjects() {
    const data = await getSubjectsService();
    setSubjects(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingSubject(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(subject: Subject) {
    setEditingSubject(subject);
    setError("");
    setSuccessMessage("");

    setFormData({
      codigo: subject.codigo,
      nombre: subject.nombre,
      gradoId: String(subject.gradoId),
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

  function handleGradeChange(value: string | null) {
    setFormData((current) => ({
      ...current,
      gradoId: value ?? "",
    }));
  }

  function getSelectedGradeLabel() {
    const selectedGrade = grades.find(
      (grade) => String(grade.id) === formData.gradoId,
    );

    if (!selectedGrade) {
      return "Selecciona un grado";
    }

    return `${selectedGrade.nombre}${
      selectedGrade.nivel ? ` - ${selectedGrade.nivel}` : ""
    }`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingSubject) {
        await updateSubjectService(editingSubject.id, formData);
        setSuccessMessage("Asignatura actualizada correctamente.");
      } else {
        await createSubjectService(formData);
        setSuccessMessage("Asignatura registrada correctamente.");
      }

      await reloadSubjects();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar asignatura.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(subject: Subject) {
    const confirmed = window.confirm(
      `¿Deseas desactivar la asignatura ${subject.nombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateSubjectService(subject.id);
      setSuccessMessage("Asignatura desactivada correctamente.");
      await reloadSubjects();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al desactivar asignatura.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asignaturas</h2>
          <p className="text-muted-foreground">
            Administración de cursos o materias por grado.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva asignatura
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
          <CardTitle>Listado de asignaturas</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de asignaturas registradas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando asignaturas...
            </p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay asignaturas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Asignatura</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">
                        {subject.codigo}
                      </TableCell>

                      <TableCell>{subject.nombre}</TableCell>

                      <TableCell>{subject.gradoNombre || "-"}</TableCell>

                      <TableCell>{subject.gradoNivel || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            subject.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {subject.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(subject)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(subject)}
                          disabled={subject.estado !== "ACTIVO"}
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
              {editingSubject ? "Editar asignatura" : "Registrar asignatura"}
            </DialogTitle>
            <DialogDescription>
              Define el código, nombre y grado al que pertenece la asignatura.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="MAT-1B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de asignatura</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Matemática"
              />
            </div>

            <div className="space-y-2">
              <Label>Grado</Label>
              <Select
                value={formData.gradoId}
                onValueChange={handleGradeChange}
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.gradoId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSelectedGradeLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {grades
                    .filter(
                      (grade) =>
                        grade.estado === "ACTIVO" ||
                        String(grade.id) === formData.gradoId,
                    )
                    .map((grade) => (
                      <SelectItem key={grade.id} value={String(grade.id)}>
                        {grade.nombre}
                        {grade.nivel ? ` - ${grade.nivel}` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
