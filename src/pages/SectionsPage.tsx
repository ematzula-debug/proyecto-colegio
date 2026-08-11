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
  createSectionService,
  deactivateSectionService,
  getSectionsService,
  updateSectionService,
} from "@/services/sections.service";
import type { Grade } from "@/types/grade";
import type { Section, SectionFormData } from "@/types/section";

const initialFormData: SectionFormData = {
  nombre: "",
  gradoId: "",
};

export function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<SectionFormData>(initialFormData);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      try {
        const [sectionsData, gradesData] = await Promise.all([
          getSectionsService(),
          getGradesService(),
        ]);

        if (active) {
          setSections(sectionsData);
          setGrades(gradesData);
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Error al cargar secciones.",
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

  async function reloadSections() {
    const data = await getSectionsService();
    setSections(data);
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingSection(null);
  }

  function openCreateDialog() {
    resetForm();
    setError("");
    setSuccessMessage("");
    setOpenDialog(true);
  }

  function openEditDialog(section: Section) {
    setEditingSection(section);
    setError("");
    setSuccessMessage("");

    setFormData({
      nombre: section.nombre,
      gradoId: String(section.gradoId),
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

    return `${selectedGrade.nombre}${selectedGrade.nivel ? ` - ${selectedGrade.nivel}` : ""}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingSection) {
        await updateSectionService(editingSection.id, formData);
        setSuccessMessage("Sección actualizada correctamente.");
      } else {
        await createSectionService(formData);
        setSuccessMessage("Sección registrada correctamente.");
      }

      await reloadSections();
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al guardar sección.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(section: Section) {
    const confirmed = window.confirm(
      `¿Deseas desactivar la sección ${section.nombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deactivateSectionService(section.id);
      setSuccessMessage("Sección desactivada correctamente.");
      await reloadSections();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al desactivar sección.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Secciones</h2>
          <p className="text-muted-foreground">
            Administración de secciones asociadas a cada grado.
          </p>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva sección
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
          <CardTitle>Listado de secciones</CardTitle>
          <CardDescription>
            Consulta, edición y desactivación de secciones registradas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando secciones...
            </p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay secciones registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sección</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        {section.nombre}
                      </TableCell>

                      <TableCell>{section.gradoNombre || "-"}</TableCell>

                      <TableCell>{section.gradoNivel || "-"}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            section.estado === "ACTIVO"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {section.estado}
                        </Badge>
                      </TableCell>

                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(section)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeactivate(section)}
                          disabled={section.estado !== "ACTIVO"}
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
              {editingSection ? "Editar sección" : "Registrar sección"}
            </DialogTitle>
            <DialogDescription>
              Selecciona el grado y define el nombre de la sección.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de sección</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="A"
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
