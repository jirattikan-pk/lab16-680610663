import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** ลงทะเบียนวิชาให้นักศึกษา (ถ้ามีอยู่แล้วไม่ใส่ซ้ำ) */
  enroll: (studentId: string[], courseId: string) => void;
  /** ยกเลิกการลงทะเบียน */
  // drop: (studentId: string, courseId: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
  removeInstructor: (courseId: string, instructor: string) => void;
  newCourse: (courseId: string, coursetitle: string, instructor: string[]) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      enroll: (studentId, courseId) =>
        set((state) => ({
          students: state.students.map((s) => {
            if (studentId.includes(`${s.firstName} ${s.lastName}`)) {
              if(s.enrolledCourses.includes(courseId)) return s;
              return { 
                ...s,
                enrolledCourses: [...s.enrolledCourses, courseId],
              };
            }
            return s;
          })
        })),

        newCourse: (courseId, coursetitle, instructor) =>
          set((state) => {
            const normalizedCode = courseId.trim().toUpperCase();
            const exists = state.courses.some((c) => c.courseCode === normalizedCode)
            if(exists) return state;
            return {
              courses: [
              ...state.courses,
              {courseCode: normalizedCode,
              courseTitle: coursetitle,
              instructors: instructor,},
            ],
          };
        }),

      // drop: (studentId, courseId) =>
      //   set((state) => ({
      //     enrollments: state.enrollments.filter(
      //       (e) => !(e.studentId === studentId && e.courseId === courseId),
      //     ),
      //   })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      removeInstructor: (courseId, instructor) =>
        set((state) => ({
        courses: state.courses.map((c) => {
          if(c.courseCode == courseId) {
            const dlin = c.instructors?.filter((i) => i !== instructor);
            return {
              ...c,
              instructors: dlin,
            }
          }
          return c;
          })
        })),

      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseId),
          students: state.students.map((s) => {
            if(!s.enrolledCourses.includes(courseId)) return s;
            const dlcourse = s.enrolledCourses.filter((c) => c !== courseId);
            return {
              ...s,
              enrolledCourses: dlcourse ,
            }
          })
        })),
    }),
    {
      name: "lab16-2569-680610663",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
