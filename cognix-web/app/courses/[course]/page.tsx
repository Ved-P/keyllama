interface CoursePageProps {
  params: { course: string }
}

export default function CoursePage({ params }: CoursePageProps) {
  const { course } = params; // `course` is a string
  return <div>Course: {course}</div>
}
