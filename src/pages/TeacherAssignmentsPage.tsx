import { type FormEvent, useEffect, useMemo, useState } from "react";
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
import { getSectionsService } from "@/services/sections.service";
import { getSubjectsService } from "@/services/subjects.service";
import {
  createTeacherAssignmentService,
  deactivateTeacherAssignmentService,
  getTeacherAssignmentsService,
  updateTeacherAssignmentService,
} from "@/services/teacherAssignments.service";
import { getTeachersService } from "@/services/teachers.service";
import type { Grade } from "@/types/grade";
import type { Section } from "@/types/section";
import type { Subject } from "@/types/subject";
import type { Teacher } from "@/types/teacher";
import type {
  TeacherAssignment,
  TeacherAssignmentFormData,
} from "@/types/teacherAssignment";

const initialFormData: TeacherAssignmentFormData = {
  profesorId: "",
  asignaturaId: "",
  gradoId: "",
  seccionId: "",
};

export function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<TeacherAssignment | null>(null);
  const [formData, setFormData] =
    useState<TeacherAssignmentFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.estado === "ACTIVO"),
    [teachers],
  );

  const activeGrades = useMemo(
    () => grades.filter((grade) => grade.estado === "ACTIVO"),
    [grades],
  );

  const filteredSections = useMemo(
    () =>
      sections.filter(
        (section) =>
          section.estado === "ACTIVO" &&
          String(section.gradoId) === formData.gradoId,
      ),
    [sections, formData.gradoId],
  );

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          subject.estado === "ACTIVO" &&
          String(subject.gradoId) === formData.gradoId,
      ),
    [subjects, formData.gradoId],
  );

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [
          assignmentsData,
          teachersData,
          gradesData,
          sectionsData,
          subjectsData,
        ] = await Promise.all([
          getTeacherAssignmentsService(),
          getTeachersService(),
          getGradesService(),
          getSectionsService(),
          getSubjectsService(),
        ]);

        if (active) {
          setAssignments(assignmentsData);
          setTeachers(teachersData);
          setGrades(gradesData);
          setSections(sectionsData);
          setSubjects(subjectsData);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar asignaciones.",
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

  async function reloadAssignments() {
    const data = await getTeacherAssignmentsService();
    setAssignments(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingAssignment(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(assignment: TeacherAssignment) {
    setEditingAssignment(assignment);
    setError("");
    setSuccessMessage("");

    setFormData({
      profesorId: String(assignment.profesorId),
      asignaturaId: String(assignment.asignaturaId),
      gradoId: String(assignment.gradoId),
      seccionId: String(assignment.seccionId),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(
    field: keyof TeacherAssignmentFormData,
    value: string | null,
  ) {
    if (value === null) {
      return;
    }

    setFormData((current) => {
      if (field === "gradoId") {
        return {
          ...current,
          gradoId: value,
          asignaturaId: "",
          seccionId: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function getTeacherLabel() {
    const teacher = teachers.find(
      (item) => String(item.id) === formData.profesorId,
    );

    if (!teacher) {
      return "Selecciona un profesor";
    }

    return `${teacher.nombres} ${teacher.apellidos}`;
  }

  function getGradeLabel() {
    const grade = grades.find((item) => String(item.id) === formData.gradoId);

    if (!grade) {
      return "Selecciona un grado";
    }

    const nivel = grade.nivel ?? "";

    return `${grade.nombre}${nivel ? ` - ${nivel}` : ""}`;
  }

  function getSubjectLabel() {
    const subject = subjects.find(
      (item) => String(item.id) === formData.asignaturaId,
    );

    if (!subject) {
      return "Selecciona una asignatura";
    }

    return `${subject.codigo} - ${subject.nombre}`;
  }

  function getSectionLabel() {
    const section = sections.find(
      (item) => String(item.id) === formData.seccionId,
    );

    if (!section) {
      return "Selecciona una sección";
    }

    return section.nombre;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingAssignment) {
        await updateTeacherAssignmentService(editingAssignment.id, formData);
        setSuccessMessage("Asignación actualizada correctamente.");
      } else {
        await createTeacherAssignmentService(formData);
        setSuccessMessage("Asignación registrada correctamente.");
      }

      await reloadAssignments();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar asignación.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(assignment: TeacherAssignment) {
    const confirmed = window.confirm(
      `¿Deseas desactivar la asignación de ${assignment.profesorNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateTeacherAssignmentService(assignment.id);
      setSuccessMessage("Asignación desactivada correctamente.");
      await reloadAssignments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al desactivar asignación.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Asignaciones de profesores
          </h2>
          <p className="text-muted-foreground">
            Relación entre profesor, asignatura, grado y sección.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva asignación
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
          <CardTitle>Listado de asignaciones</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de asignaciones registradas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando asignaciones...
            </p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay asignaciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Asignatura</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.profesorNombre}</TableCell>

                      <TableCell>
                        {assignment.asignaturaCodigo} -{" "}
                        {assignment.asignaturaNombre}
                      </TableCell>

                      <TableCell>
                        {assignment.gradoNombre}
                        {assignment.gradoNivel != null &&
                        assignment.gradoNivel !== ""
                          ? ` - ${assignment.gradoNivel}`
                          : ""}
                      </TableCell>

                      <TableCell>{assignment.seccionNombre}</TableCell>

                      <TableCell>{assignment.cicloEscolarAnio}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            assignment.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assignment.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(assignment)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(assignment)}
                          disabled={assignment.estado !== "ACTIVO"}
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
              {editingAssignment ? "Editar asignación" : "Registrar asignación"}
            </DialogTitle>
            <DialogDescription>
              Selecciona el profesor, grado, asignatura y sección.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Profesor</Label>
              <Select
                value={formData.profesorId}
                onValueChange={(value) =>
                  handleSelectChange("profesorId", value)
                }
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.profesorId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getTeacherLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {activeTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                      {teacher.nombres} {teacher.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Grado</Label>
              <Select
                value={formData.gradoId}
                onValueChange={(value) => handleSelectChange("gradoId", value)}
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.gradoId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getGradeLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {activeGrades.map((grade) => (
                    <SelectItem key={grade.id} value={String(grade.id)}>
                      {grade.nombre}
                      {grade.nivel ? ` - ${grade.nivel}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asignatura</Label>
              <Select
                value={formData.asignaturaId}
                onValueChange={(value) =>
                  handleSelectChange("asignaturaId", value)
                }
                disabled={!formData.gradoId}
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.asignaturaId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSubjectLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={String(subject.id)}>
                      {subject.codigo} - {subject.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sección</Label>
              <Select
                value={formData.seccionId}
                onValueChange={(value) =>
                  handleSelectChange("seccionId", value)
                }
                disabled={!formData.gradoId}
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.seccionId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getSectionLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {filteredSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.nombre}
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
