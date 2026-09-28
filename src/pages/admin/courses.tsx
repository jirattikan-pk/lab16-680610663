import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X } from "lucide-react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { useState } from "react";
import { FieldDescription } from "@/components/ui/field";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminCoursesPage() {
  const { courses, newCourse, removeCourse, removeInstructor } =
    useEnrollmentStore();

  const [formCourseCode, setFormCourseCode] = useState<string | null>(null);
  const [formCourseTitle, setFormCourseTitle] = useState<string | null>(null);
  const [formInstructor, setFormInstructor] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  // const [instructorOptions, setInstructorOptions] =
  //   useState<string[]>(allinstructor);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const anchor = useComboboxAnchor();

  const trimmed = instructorQuery.trim();
  const canCreate =
    trimmed.length > 0 &&
    !formInstructor.some((i) => i.toLowerCase() === trimmed.toLowerCase());

  const handleAddInstructor = () => {
    //setInstructorOptions((prev) => [...prev, trimmed]);
    setFormInstructor((prev) => [...prev, trimmed]); // เลือกให้เลยหลังเพิ่ม
    setInstructorQuery("");
  };

  const handleEnroll = () => {
    if (!formCourseCode || !formCourseTitle) return;
    newCourse(formCourseCode, formCourseTitle, formInstructor);
    setEnrollDialogOpen(false);
  };

  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourseCode(null);
      setFormCourseTitle(null);
      setFormInstructor([]);
    }
  };

  const isdupicate = courses.some(
    (c) => c.courseCode === formCourseCode?.trim().toUpperCase(),
  );

  const allinstructor = Array.from(
    new Set(courses.flatMap((c) => c.instructors)),
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า"จัดการการลงทะเบียน"ทันที
          </p>
        </div>

        <Dialog
          open={enrollDialogOpen}
          onOpenChange={handleEnrollDialogOpenChange}
        >
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>
            <div className="grid min-w-0 gap-4">
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="formCourseCode">รหัสวิชา</Label>
                <Input
                  aria-invalid={isdupicate}
                  aria-describedby={
                    isdupicate ? "formCourseCode-error" : undefined
                  }
                  id="formCourseCode"
                  placeholder="เช่น CPE303"
                  value={formCourseCode ?? ""}
                  onChange={(c) => setFormCourseCode(c.target.value)}
                />
                {isdupicate && (
                  <FieldDescription
                    id="formCourseCode-error"
                    className="text-red-500"
                  >
                    มีรหัสวิชา {formCourseCode?.toUpperCase()} นี้แล้ว
                  </FieldDescription>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="formCourseTitle">ชื่อวิชา</Label>
                <Input
                  id="formCourseTitle"
                  placeholder="เช่น Mobile Aplication Development"
                  value={formCourseTitle ?? ""}
                  onChange={(c) => setFormCourseTitle(c.target.value)}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <Label htmlFor="formInstructor">ผู้สอน</Label>
                <Combobox
                  multiple
                  autoHighlight
                  id="formInstructor"
                  items={allinstructor}
                  value={formInstructor}
                  onValueChange={(v) => setFormInstructor(v as string[])}
                  inputValue={instructorQuery}
                  onInputValueChange={setInstructorQuery}
                >
                  <ComboboxChips
                    ref={anchor}
                    className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg min-w-0"
                  >
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((value: string) => (
                            <ComboboxChip key={value}>{value}</ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            placeholder={
                              formInstructor?.length
                                ? ""
                                : "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                            }
                          />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent anchor={anchor}>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                    {canCreate && (
                      <div className="border-t p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={handleAddInstructor}
                        >+เพิ่มผู้สอน "{trimmed}"
                        </Button>
                      </div>
                    )}
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  !formCourseCode ||
                  !formCourseTitle ||
                  !formInstructor?.length ||
                  isdupicate
                }
                onClick={handleEnroll}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((n) => (
              <TableRow key={`${n.courseCode}`}>
                <TableCell>{n.courseCode}</TableCell>
                <TableCell>{n.courseTitle}</TableCell>
                <TableCell>
                  {n.instructors?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {n.instructors.map((i) => (
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            key={i}
                            variant="outline"
                            className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                          >
                            {i}
                            <Button
                              size="xs"
                              variant="ghost"
                              className="rounded-full p-0.5 hover:bg-blue-800/60"
                              onClick={() => removeInstructor(n.courseCode, i)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      ยังไม่มีผู้สอน
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ลบ {n.courseCode} — {n.courseTitle}{" "}
                          ออกจากรายวิชาที่เปิดสอน
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => removeCourse(n.courseCode)}
                        >
                          ยืนยัน
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
