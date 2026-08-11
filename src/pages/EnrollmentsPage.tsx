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
import {
  createEnrollmentService,
  getEnrollmentsService,
  updateEnrollmentService,
  withdrawEnrollmentService,
} from "@/services/enrollments.service";
import { getGradesService } from "@/services/grades.service";
import { getSectionsService } from "@/services/sections.service";
import { getStudentsService } from "@/services/students.service";
import type { Enrollment, EnrollmentFormData } from "@/types/enrollment";
import type { Grade } from "@/types/grade";
import type { Section } from "@/types/section";
import type { Student } from "@/types/student";

const initialFormData: EnrollmentFormData = {
  alumnoId: "",
  gradoId: "",
  seccionId: "",
};

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(
    null,
  );
  const [formData, setFormData] = useState<EnrollmentFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeStudents = useMemo(
    () => students.filter((student) => student.estado === "ACTIVO"),
    [students],
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

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [enrollmentsData, studentsData, gradesData, sectionsData] =
          await Promise.all([
            getEnrollmentsService(),
            getStudentsService(),
            getGradesService(),
            getSectionsService(),
          ]);

        if (active) {
          setEnrollments(enrollmentsData);
          setStudents(studentsData);
          setGrades(gradesData);
          setSections(sectionsData);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar inscripciones.",
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

  async function reloadEnrollments() {
    const data = await getEnrollmentsService();
    setEnrollments(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingEnrollment(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(enrollment: Enrollment) {
    setEditingEnrollment(enrollment);
    setError("");
    setSuccessMessage("");

    setFormData({
      alumnoId: String(enrollment.alumnoId),
      gradoId: String(enrollment.gradoId),
      seccionId: String(enrollment.seccionId),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(
    field: keyof EnrollmentFormData,
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
          seccionId: "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function getStudentLabel() {
    const student = students.find(
      (item) => String(item.id) === formData.alumnoId,
    );

    if (!student) {
      return "Selecciona un alumno";
    }

    return `${student.codigo} - ${student.nombres} ${student.apellidos}`;
  }

  function getGradeLabel() {
    const grade = grades.find((item) => String(item.id) === formData.gradoId);

    if (!grade) {
      return "Selecciona un grado";
    }

    const nivel = grade.nivel ?? "";

    return `${grade.nombre}${nivel ? ` - ${nivel}` : ""}`;
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

      if (editingEnrollment) {
        await updateEnrollmentService(editingEnrollment.id, formData);
        setSuccessMessage("Inscripción actualizada correctamente.");
      } else {
        await createEnrollmentService(formData);
        setSuccessMessage("Inscripción registrada correctamente.");
      }

      await reloadEnrollments();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al guardar inscripción.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw(enrollment: Enrollment) {
    const confirmed = window.confirm(
      `¿Deseas retirar la inscripción de ${enrollment.alumnoNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await withdrawEnrollmentService(enrollment.id);
      setSuccessMessage("Inscripción retirada correctamente.");
      await reloadEnrollments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al retirar inscripción.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inscripciones</h2>
          <p className="text-muted-foreground">
            Control de inscripción de alumnos por ciclo escolar, grado y
            sección.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva inscripción
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
          <CardTitle>Listado de inscripciones</CardTitle>
          <CardDescription>
            Consulta, edición y retiro de inscripciones registradas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando inscripciones...
            </p>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay inscripciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        {enrollment.alumnoCodigo} - {enrollment.alumnoNombre}
                      </TableCell>

                      <TableCell>
                        {enrollment.gradoNombre}
                        {enrollment.gradoNivel
                          ? ` - ${enrollment.gradoNivel}`
                          : ""}
                      </TableCell>

                      <TableCell>{enrollment.seccionNombre}</TableCell>

                      <TableCell>{enrollment.cicloEscolarAnio}</TableCell>

                      <TableCell>
                        {enrollment.fechaInscripcion
                          ? enrollment.fechaInscripcion.slice(0, 10)
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            enrollment.estado === "INSCRITO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {enrollment.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(enrollment)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleWithdraw(enrollment)}
                          disabled={enrollment.estado !== "INSCRITO"}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Retirar
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
              {editingEnrollment
                ? "Editar inscripción"
                : "Registrar inscripción"}
            </DialogTitle>
            <DialogDescription>
              Selecciona el alumno, grado y sección. El ciclo escolar activo se
              asigna automáticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Alumno</Label>
              <Select
                value={formData.alumnoId}
                onValueChange={(value) => handleSelectChange("alumnoId", value)}
              >
                <SelectTrigger className="w-full justify-between">
                  <span
                    className={
                      formData.alumnoId
                        ? "truncate"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {getStudentLabel()}
                  </span>
                </SelectTrigger>

                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="z-9999 min-w-260px"
                >
                  {activeStudents.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.codigo} - {student.nombres} {student.apellidos}
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
