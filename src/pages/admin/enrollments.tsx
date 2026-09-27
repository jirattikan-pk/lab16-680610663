import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import * as React from "react";
import { Badge } from "@/components/ui/badge";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full min-w-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enroll, removeStudent } = useEnrollmentStore();

  const [formStudent, setFormStudent] = useState<string[]>([]);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");
  const anchor = useComboboxAnchor();

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
  const availableStudents = students.filter(
    (s) => !s.enrolledCourses.some((e) => e === formCourse),
  );

  const handleEnroll = () => {
    if (!formStudent?.length || !formCourse) return;
    enroll(formStudent, formCourse);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent([]);
      setFormCourse(null);
    }
  };

  const visibleCourses = courses.filter((c) => {
    if (mode === "course") {
      return filterCourse === "all" || c.courseCode === filterCourse;
    }
    if (filterStudent === "all") return true;
    const student = students.find((s) => s.studentId === filterStudent);
    return student?.enrolledCourses.includes(c.courseCode) ?? false;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน
              แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น(เลือกได้มากกว่า 1
              คน)
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-w-0 gap-4">
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(v) => {
                  setFormCourse(v);
                  setFormStudent([]);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <Combobox
                multiple
                autoHighlight
                id="formStudent"
                items={availableStudents}
                value={formStudent}
                onValueChange={(v) => setFormStudent(v as string[])}
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
                            formStudent?.length
                              ? ""
                              : formCourse
                                ? "ค้นหา/เลือกนักศึกษา"
                                : "เลือกวิชาก่อน"
                          }
                        />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem
                        key={item.studentId} value={`${item.firstName} ${item.lastName}`}
                      >
                        {item.studentId} — {item.firstName} {item.lastName}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formStudent.length || !formCourse}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudent?.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCourses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {visibleCourses.map((c) => {
              const enrolledStudents = students.filter((s) =>
                s.enrolledCourses.includes(c.courseCode),
              );
              return (
                <TableRow key={c.courseCode}>
                  <TableCell>{c.courseCode}</TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    {enrolledStudents.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {enrolledStudents.map((s) => (
                          <div className="flex flex-wrap gap-1.5">
                            <Badge
                              key={s.studentId}
                              variant="outline"
                              className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
                            >
                              {s.firstName} {s.lastName}
                              <Button
                                size="xs"
                                variant="ghost"
                                className="rounded-full p-0.5 hover:bg-blue-800/60"
                                onClick={() => removeStudent(s.studentId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">ยังไม่มีนักศึกษาลงทะเบียน</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
