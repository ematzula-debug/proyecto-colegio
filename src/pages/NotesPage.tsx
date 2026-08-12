import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Pencil, Plus, XCircle } from "lucide-react";
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
import { getStoredUser } from "@/services/auth.service";
import { getEnrollmentsService } from "@/services/enrollments.service";
import {
  annulNoteService,
  createNoteService,
  getNotesService,
  updateNoteService,
} from "@/services/notes.service";
import { getTeacherAssignmentsService } from "@/services/teacherAssignments.service";
import type { Enrollment } from "@/types/enrollment";
import type { AcademicNote, NoteFormData } from "@/types/note";
import type { TeacherAssignment } from "@/types/teacherAssignment";

const initialFormData: NoteFormData = {
  alumnoId: "",
  asignacionId: "",
  asignaturaId: "",
  profesorId: "",
  unidad: "",
  nota: "",
};

const units = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4", "Recuperación"];

export function NotesPage() {
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const user = getStoredUser();
  const userRole = user?.rol ?? "";

  const canManageNotes =
    userRole === "ADMIN" || userRole === "PROFESOR_DIRECTOR";

  const activeEnrollments = useMemo(
    () => enrollments.filter((enrollment) => enrollment.estado === "INSCRITO"),
    [enrollments],
  );

  const selectedEnrollment = useMemo(
    () =>
      activeEnrollments.find(
        (enrollment) => String(enrollment.alumnoId) === formData.alumnoId,
      ),
    [activeEnrollments, formData.alumnoId],
  );

  const filteredAssignments = useMemo(() => {
    if (!selectedEnrollment) {
      return [];
    }

    return assignments.filter(
      (assignment) =>
        assignment.estado === "ACTIVO" &&
        assignment.gradoId === selectedEnrollment.gradoId &&
        assignment.seccionId === selectedEnrollment.seccionId,
    );
  }, [assignments, selectedEnrollment]);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        if (canManageNotes) {
          const [notesData, enrollmentsData, assignmentsData] =
            await Promise.all([
              getNotesService(),
              getEnrollmentsService(),
              getTeacherAssignmentsService(),
            ]);

          if (active) {
            setNotes(notesData);
            setEnrollments(enrollmentsData);
            setAssignments(assignmentsData);
          }
        } else {
          const notesData = await getNotesService();

          if (active) {
            setNotes(notesData);
            setEnrollments([]);
            setAssignments([]);
          }
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Error al cargar notas.",
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
  }, [canManageNotes]);

  async function reloadNotes() {
    const data = await getNotesService();
    setNotes(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingNote(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(note: AcademicNote) {
    setEditingNote(note);
    setError("");
    setSuccessMessage("");

    const assignment = assignments.find(
      (item) =>
        item.profesorId === note.profesorId &&
        item.asignaturaId === note.asignaturaId,
    );

    setFormData({
      alumnoId: String(note.alumnoId),
      asignacionId: assignment ? String(assignment.id) : "",
      asignaturaId: String(note.asignaturaId),
      profesorId: String(note.profesorId),
      unidad: note.unidad,
      nota: String(note.nota),
    });

    setOpenDialog(true);
  }

  function handleSelectChange(field: keyof NoteFormData, value: string | null) {
    if (value === null) {
      return;
    }

    setFormData((current) => {
      if (field === "alumnoId") {
        return {
          ...current,
          alumnoId: value,
          asignacionId: "",
          asignaturaId: "",
          profesorId: "",
        };
      }

      if (field === "asignacionId") {
        const selectedAssignment = assignments.find(
          (assignment) => String(assignment.id) === value,
        );

        return {
          ...current,
          asignacionId: value,
          asignaturaId: selectedAssignment
            ? String(selectedAssignment.asignaturaId)
            : "",
          profesorId: selectedAssignment
            ? String(selectedAssignment.profesorId)
            : "",
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function getStudentLabel() {
    const enrollment = activeEnrollments.find(
      (item) => String(item.alumnoId) === formData.alumnoId,
    );

    if (!enrollment) {
      return "Selecciona un alumno";
    }

    return `${enrollment.alumnoCodigo} - ${enrollment.alumnoNombre}`;
  }

  function getAssignmentLabel() {
    const assignment = assignments.find(
      (item) => String(item.id) === formData.asignacionId,
    );

    if (!assignment) {
      return "Selecciona asignatura y profesor";
    }

    return `${assignment.asignaturaCodigo} - ${assignment.asignaturaNombre} | ${assignment.profesorNombre}`;
  }

  function getUnitLabel() {
    return formData.unidad || "Selecciona una unidad";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingNote) {
        await updateNoteService(editingNote.id, formData);
        setSuccessMessage("Nota actualizada correctamente.");
      } else {
        await createNoteService(formData);
        setSuccessMessage("Nota registrada correctamente.");
      }

      await reloadNotes();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar nota.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAnnul(note: AcademicNote) {
    const confirmed = window.confirm(
      `¿Deseas anular la nota de ${note.alumnoNombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await annulNoteService(note.id);
      setSuccessMessage("Nota anulada correctamente.");
      await reloadNotes();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al anular nota.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notas</h2>
          <p className="text-muted-foreground">
            Registro y consulta de calificaciones de los alumnos.
          </p>
        </div>

        {canManageNotes && (
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva nota
          </Button>
        )}
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
          <CardTitle>Listado de notas</CardTitle>
          <CardDescription>
            Consulta de notas registradas en el sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando notas...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay notas registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Asignatura</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Estado</TableHead>
                    {canManageNotes && (
                      <TableHead className="text-right">Acciones</TableHead>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {notes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        {note.alumnoCodigo} - {note.alumnoNombre}
                      </TableCell>

                      <TableCell>
                        {note.asignaturaCodigo} - {note.asignaturaNombre}
                      </TableCell>

                      <TableCell>{note.profesorNombre}</TableCell>

                      <TableCell>{note.unidad}</TableCell>

                      <TableCell className="font-semibold">
                        {Number(note.nota).toFixed(2)}
                      </TableCell>

                      <TableCell>{note.cicloEscolarAnio}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            note.estado === "ACTIVO" ? "default" : "secondary"
                          }
                        >
                          {note.estado}
                        </Badge>
                      </TableCell>

                      {canManageNotes && (
                        <TableCell className="space-x-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(note)}
                            disabled={note.estado !== "ACTIVO"}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAnnul(note)}
                            disabled={note.estado !== "ACTIVO"}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Anular
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {canManageNotes && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Editar nota" : "Registrar nota"}
              </DialogTitle>
              <DialogDescription>
                Selecciona un alumno inscrito, una asignación docente y registra
                la nota correspondiente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Alumno</Label>
                <Select
                  value={formData.alumnoId}
                  onValueChange={(value) =>
                    handleSelectChange("alumnoId", value)
                  }
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
                    className="z-9999 min-w-300px"
                  >
                    {activeEnrollments.map((enrollment) => (
                      <SelectItem
                        key={enrollment.id}
                        value={String(enrollment.alumnoId)}
                      >
                        {enrollment.alumnoCodigo} - {enrollment.alumnoNombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Asignatura / Profesor</Label>
                <Select
                  value={formData.asignacionId}
                  onValueChange={(value) =>
                    handleSelectChange("asignacionId", value)
                  }
                  disabled={!formData.alumnoId}
                >
                  <SelectTrigger className="w-full justify-between">
                    <span
                      className={
                        formData.asignacionId
                          ? "truncate"
                          : "truncate text-muted-foreground"
                      }
                    >
                      {getAssignmentLabel()}
                    </span>
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="z-9999 min-w-320px"
                  >
                    {filteredAssignments.map((assignment) => (
                      <SelectItem
                        key={assignment.id}
                        value={String(assignment.id)}
                      >
                        {assignment.asignaturaCodigo} -{" "}
                        {assignment.asignaturaNombre} |{" "}
                        {assignment.profesorNombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select
                  value={formData.unidad}
                  onValueChange={(value) => handleSelectChange("unidad", value)}
                >
                  <SelectTrigger className="w-full justify-between">
                    <span
                      className={
                        formData.unidad
                          ? "truncate"
                          : "truncate text-muted-foreground"
                      }
                    >
                      {getUnitLabel()}
                    </span>
                  </SelectTrigger>

                  <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="z-9999 min-w-260px"
                  >
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota">Nota</Label>
                <Input
                  id="nota"
                  name="nota"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.nota}
                  onChange={handleInputChange}
                  placeholder="85"
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
      )}
    </div>
  );
}
