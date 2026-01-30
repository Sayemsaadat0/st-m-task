import { DashboardIcon, StudentIcon, CourseIcon, FacultyIcon } from './../components/icons/RootIcons';
export const ROUTES = {
    // Main routes
    DASHBOARD: "/",
    STUDENTS: "/students",
    STUDENT_CREATE: "/students/create",
    STUDENT_UPDATE: "/students/update",

    COURSES: "/courses",
    COURSE_CREATE: "/courses/create",
    COURSE_UPDATE: "/courses/update",

    FACULTY: "/faculty",
    FACULTY_CREATE: "/faculty/create",
    FACULTY_UPDATE: "/faculty/update",
} as const;



export const SIDEBAR_ROUTES = [
    {
        id: "dashboard",
        title: "Dashboard",
        path: ROUTES.DASHBOARD,
        icon: DashboardIcon,
        iconSize: "20" as const,
    },
    {
        id: "students",
        title: "Students",
        path: ROUTES.STUDENTS,
        icon: StudentIcon,
        iconSize: "24" as const, 
    },
    {
        id: "courses",
        title: "Courses",
        path: ROUTES.COURSES,
        icon: CourseIcon,
        iconSize: "20" as const,
    },
    {
        id: "faculty",
        title: "Faculty",
        path: ROUTES.FACULTY,
        icon: FacultyIcon,
        iconSize: "20" as const,
    },
]